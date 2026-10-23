import {validateEditorDraft,validateEditorTrash} from './editor-draft.js';
import { randomUUID } from "node:crypto";
import { validateContent } from "../dist/model.js";
import { removeIllustrativePhotos } from "./destination.js";
import { publicSiteRecord } from "./site-record.js";
const fail = (message, status = 400) =>
  Object.assign(new Error(message), { status });
const normalized = (input) => validateContent(removeIllustrativePhotos(input));
const revision = (n) => {
  if (!Number.isInteger(n) || n < 0) throw fail("Neispravna verzija sadržaja.");
  return n;
};
const author = (user) => String(user?.uid || "administrator").slice(0, 128);
export async function readCmsDraft(db, published) {
  const draft = (await db.collection("site").doc("cmsDraft").get()).data();
  return (
    draft || {
      data: published.data,
      revision: 0,
      baseRevision: published.revision,
      updatedAt: null,
      updatedBy: null,
    }
  );
}
export async function saveCmsDraft(db, input, user) {
  const data = input.partial===true?validateEditorDraft(input.data):normalized(input.data);
  revision(input.revision);
  revision(input.baseRevision);
  let record;
  await db.runTransaction(async (tx) => {
    const ref = db.collection("site").doc("cmsDraft");
    const [snap, published] = await Promise.all([
      tx.get(ref),
      tx.get(db.collection("site").doc("public")),
    ]);
    const current = snap.data();
    if ((current?.revision || 0) !== input.revision)
      throw fail("Skicu je izmijenio drugi urednik. Osvježite prikaz.", 409);
    // A draft remains tied to its starting publication even after a legacy editor publishes.
    if (
      input.baseRevision !==
      (current?.baseRevision ?? published.data()?.revision ?? 0)
    )
      throw fail("Početna objava skice nije aktualna. Osvježite prikaz.", 409);
    record = {
      data,
      trash:validateEditorTrash(input.trash??current?.trash??[]),
      revision: input.revision + 1,
      baseRevision: input.baseRevision,
      updatedAt: new Date().toISOString(),
      updatedBy: author(user),
    };
    tx.set(ref, record);
  });
  return record;
}
export async function listCmsHistory(db) {
  const rows = await db
    .collection("cmsHistory")
    .orderBy("createdAt", "desc")
    .limit(30)
    .get();
  return {
    versions: rows.docs.map((d) => {
      const { revision, createdAt, createdBy, reason } = d.data();
      return { id: d.id, revision, createdAt, createdBy, reason };
    }),
  };
}
async function validateReferences(tx, db, data) {
  const [calendar, feeds] = await Promise.all([
    tx.get(db.collection("site").doc("calendar")),
    tx.get(db.collection("calendarFeeds")),
  ]);
  const slugs = new Set(data.apartments.map((a) => a.slug));
  if (feeds.docs.some((d) => !slugs.has(d.data().apartment)))
    throw fail("Prije uklanjanja apartmana uklonite njegove iCal veze.", 409);
  if ((calendar.data()?.bookings || []).some((b) => !slugs.has(b.apartment)))
    throw fail("Prije uklanjanja apartmana uklonite njegova zauzeća.", 409);
}
// Both the established editor and the new CMS share publication checks and history.
export async function publishContent(db, input, user, { draft = false } = {}) {
  revision(input.revision);
  if (draft) revision(input.draftRevision);
  const candidate = draft ? null : normalized(input.data),
    historyId = randomUUID();
  let result;
  await db.runTransaction(async (tx) => {
    const ref = db.collection("site").doc("public"),
      draftRef = db.collection("site").doc("cmsDraft");
    const [current, draftSnap] = await Promise.all([
      tx.get(ref),
      tx.get(draftRef),
    ]);
    const actual = current.data()?.revision || 0,
      stored = draftSnap.data();
    if (actual !== input.revision)
      throw fail(
        "Objavljeni sadržaj je promijenjen. Pregledajte novu verziju prije objave skice.",
        409,
      );
    if (
      draft &&
      (!stored ||
        stored.revision !== input.draftRevision ||
        stored.baseRevision !== actual)
    )
      throw fail("Skica ili njezina početna objava više nisu aktualne.", 409);
    const data = candidate || normalized(stored.data);
    await validateReferences(tx, db, data);
    const now = new Date().toISOString();
    // Archive before writing, within the same transaction. A rollback is always restored as a draft.
    if (current.exists)
      tx.set(db.collection("cmsHistory").doc(historyId), {
        data: current.data().data,
        revision: actual,
        createdAt: now,
        createdBy: author(user),
        reason: draft ? "Objava CMS skice" : "Objava iz postojećeg urednika",
      });
    tx.set(ref, publicSiteRecord(data, actual + 1));
    if (draft)
      tx.set(draftRef, {
        data,
        trash:validateEditorTrash(stored.trash||[]),
        revision: stored.revision + 1,
        baseRevision: actual + 1,
        updatedAt: now,
        updatedBy: author(user),
      });
    result = { saved: true, revision: actual + 1, data };
  });
  return result;
}
export async function restoreCmsVersion(db, input, user, published) {
  if (!/^[a-f0-9-]{36}$/.test(input.id || ""))
    throw fail("Neispravna oznaka verzije.");
  const version = (
    await db.collection("cmsHistory").doc(input.id).get()
  ).data();
  if (!version) throw fail("Verzija nije pronađena.", 404);
  // read revision supplied by the client; a concurrent draft change cannot be overwritten.
  revision(input.revision);
  const data = normalized(version.data);
  let record;
  await db.runTransaction(async (tx) => {
    const ref = db.collection("site").doc("cmsDraft");
    const [draft, current] = await Promise.all([
      tx.get(ref),
      tx.get(db.collection("site").doc("public")),
    ]);
    if ((draft.data()?.revision || 0) !== input.revision)
      throw fail("Skica je promijenjena. Osvježite prikaz.", 409);
    record = {
      data,
      trash:validateEditorTrash(draft.data()?.trash||[]),
      revision: input.revision + 1,
      baseRevision: current.data()?.revision ?? published.revision,
      updatedAt: new Date().toISOString(),
      updatedBy: author(user),
    };
    tx.set(ref, record);
  });
  return record;
}
export async function resetCmsDraft(db, input, user, published) {
  revision(input.revision);
  let record;
  await db.runTransaction(async (tx) => {
    const ref = db.collection("site").doc("cmsDraft");
    const [draft, current] = await Promise.all([
      tx.get(ref),
      tx.get(db.collection("site").doc("public")),
    ]);
    if ((draft.data()?.revision || 0) !== input.revision)
      throw fail("Skica je promijenjena. Osvježite prikaz.", 409);
    const live = current.data() || published;
    record = {
      data: normalized(live.data),
      trash:validateEditorTrash(draft.data()?.trash||[]),
      revision: input.revision + 1,
      baseRevision: live.revision,
      updatedAt: new Date().toISOString(),
      updatedBy: author(user),
    };
    tx.set(ref, record);
  });
  return record;
}
