import { randomUUID } from "node:crypto";
import {
  emptyProperty,
  normalizeProperty,
  publicationIssues,
} from "../dist/property-model.js";
const fail = (message, status = 400) =>
  Object.assign(new Error(message), { status });
function objectId(value) {
  if (!/^[a-f0-9-]{36}$/.test(value || ""))
    throw fail("Neispravna oznaka objekta.");
  return value;
}
function expectedRevision(value) {
  if (!Number.isInteger(value) || value < 0)
    throw fail("Neispravna verzija objekta.");
  return value;
}
const actor = (user) => String(user?.uid || "administrator").slice(0, 128);
export async function listProperties(db, primary) {
  const rows = await db.collection("properties").limit(101).get();
  return {
    objects: [
      {
        id: "meleh",
        name: primary.data.name,
        slug: "meleh",
        type: "apartments",
        units: primary.data.apartments.length,
        published: true,
        primary: true,
      },
      ...rows.docs.map((d) => {
        const v = d.data();
        return {
          id: d.id,
          name: v.draft.name,
          slug: v.draft.slug,
          type: v.draft.type,
          units: v.draft.units.length,
          published: Boolean(v.published),
          revision: v.revision,
          publishedRevision: v.publishedRevision,
          updatedAt: v.updatedAt,
          primary: false,
        };
      }),
    ],
  };
}
export async function createProperty(db, input, user) {
  const data = normalizeProperty(
      emptyProperty(input.name, input.slug, input.type),
    ),
    id = randomUUID(),
    now = new Date().toISOString();
  const record = {
    revision: 1,
    publishedRevision: 0,
    draft: data,
    published: null,
    createdAt: now,
    updatedAt: now,
    updatedBy: actor(user),
  };
  await db.runTransaction(async (tx) => {
    const [reserved, all] = await Promise.all([
      tx.get(db.collection("propertySlugs").doc(data.slug)),
      tx.get(db.collection("properties")),
    ]);
    if (reserved.exists || data.slug === "meleh")
      throw fail("URL oznaka objekta već se koristi.", 409);
    if (all.docs.length >= 100) throw fail("Dosegnut je broj objekata.");
    tx.set(db.collection("propertySlugs").doc(data.slug), { id });
    tx.set(db.collection("properties").doc(id), record);
  });
  return { id, ...record };
}
export async function readProperty(db, id) {
  objectId(id);
  const row = (await db.collection("properties").doc(id).get()).data();
  if (!row) throw fail("Objekt nije pronađen.", 404);
  return { id, ...row };
}
export async function savePropertyDraft(db, id, input, user) {
  objectId(id);
  expectedRevision(input.revision);
  const draft = normalizeProperty(input.data);
  let result;
  await db.runTransaction(async (tx) => {
    const ref = db.collection("properties").doc(id),
      current = await tx.get(ref),
      row = current.data();
    if (!row) throw fail("Objekt nije pronađen.", 404);
    if (row.revision !== input.revision)
      throw fail("Drugi urednik promijenio je objekt. Osvježite prikaz.", 409);
    if (draft.slug !== row.draft.slug)
      throw fail("URL oznaka postojećeg objekta ne može se promijeniti.");
    result = {
      ...row,
      draft,
      revision: row.revision + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: actor(user),
    };
    tx.set(ref, result);
  });
  return { id, ...result };
}
export async function publishProperty(db, id, input, user) {
  objectId(id);
  expectedRevision(input.revision);
  let result;
  await db.runTransaction(async (tx) => {
    const ref = db.collection("properties").doc(id),
      current = await tx.get(ref),
      row = current.data();
    if (!row) throw fail("Objekt nije pronađen.", 404);
    if (row.revision !== input.revision)
      throw fail("Skica je promijenjena. Pregledajte je prije objave.", 409);
    const data = normalizeProperty(row.draft),
      issues = publicationIssues(data);
    if (issues.length) throw fail(issues.join(" "));
    const now = new Date().toISOString();
    if (row.published)
      tx.set(db.collection("properties/" + id + "/history").doc(randomUUID()), {
        ...row.published,
        archivedAt: now,
        archivedBy: actor(user),
      });
    result = {
      ...row,
      revision: row.revision + 1,
      publishedRevision: row.publishedRevision + 1,
      published: { data, revision: row.publishedRevision + 1, at: now },
      updatedAt: now,
      updatedBy: actor(user),
    };
    tx.set(ref, result);
  });
  return { id, ...result };
}
export async function publicProperties(db) {
  const rows = await db.collection("properties").limit(100).get();
  return {
    objects: rows.docs.flatMap((d) =>
      d.data().published ? [{ id: d.id, ...d.data().published.data }] : [],
    ),
  };
}
export async function publicProperty(db, slug) {
  if (!/^[a-z][a-z0-9-]{0,49}$/.test(slug || ""))
    throw fail("Objekt nije pronađen.", 404);
  const ref = (await db.collection("propertySlugs").doc(slug).get()).data();
  if (!ref) throw fail("Objekt nije pronađen.", 404);
  const row = (await db.collection("properties").doc(ref.id).get()).data();
  if (!row?.published) throw fail("Objekt nije objavljen.", 404);
  return { id: ref.id, ...row.published.data };
}
export async function propertyHistory(db, id) {
  objectId(id);
  await readProperty(db, id);
  const rows = await db
    .collection("properties/" + id + "/history")
    .orderBy("archivedAt", "desc")
    .limit(30)
    .get();
  return {
    versions: rows.docs.map((d) => ({
      id: d.id,
      revision: d.data().revision,
      at: d.data().at,
      archivedAt: d.data().archivedAt,
    })),
  };
}
export async function restoreProperty(db, id, input, user) {
  objectId(id);
  objectId(input.versionId);
  expectedRevision(input.revision);
  const history = (
    await db
      .collection("properties/" + id + "/history")
      .doc(input.versionId)
      .get()
  ).data();
  if (!history) throw fail("Verzija nije pronađena.", 404);
  const data = normalizeProperty(history.data);
  let result;
  await db.runTransaction(async (tx) => {
    const ref = db.collection("properties").doc(id),
      current = (await tx.get(ref)).data();
    if (!current) throw fail("Objekt nije pronađen.", 404);
    if (current.revision !== input.revision)
      throw fail("Skica objekta je promijenjena.", 409);
    if (current.draft.slug !== data.slug)
      throw fail("Verzija pripada drugoj URL oznaci.");
    result = {
      ...current,
      draft: data,
      revision: current.revision + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: actor(user),
    };
    tx.set(ref, result);
  });
  return { id, ...result };
}
