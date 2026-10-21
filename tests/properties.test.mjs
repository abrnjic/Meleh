import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { memoryDb } from "./memory-db.mjs";
import {
  emptyProperty,
  normalizeProperty,
  publicationIssues,
} from "../dist/property-model.js";
import {
  createProperty,
  savePropertyDraft,
  publishProperty,
  readProperty,
  listProperties,
  publicProperties,
  publicProperty,
  propertyHistory,
  restoreProperty,
} from "../server/properties.js";
import {
  developmentDatabase,
  initializeDevelopmentWorkspace,
} from "../server/cms-workspace.js";
import { bridgeCmsRequest, cmsBridgeOrigin } from "../server/cms-proxy.js";
import { publicSiteRecord } from "../server/site-record.js";
import { handle } from "../api/index.js";
const defaults = JSON.parse(
  await readFile(
    new URL("../server/default-site.json", import.meta.url),
    "utf8",
  ),
);
const user = { uid: "allowed-admin" };
const localized = (value) => ({ hr: value, en: "", de: "", cs: "" });
function completeProperty(name = "Nova kuća", slug = "nova-kuca") {
  const data = emptyProperty(name, slug, "house");
  data.description = localized("Opis kuće.\nDrugi odlomak.");
  data.location = "Pelješac";
  data.photos = [
    { key: "own-photo", file: "own-house.webp", alt: localized("Kuća") },
  ];
  data.units = [
    {
      id: randomUUID(),
      slug: "kuca",
      name: "Kuća",
      description: localized("Opis smještaja"),
      guests: 4,
      rooms: 2,
      area: 65,
      image: "own-photo",
    },
  ];
  return normalizeProperty(data);
}
test("a new object is an empty private draft, without inherited photos, capacities or reservations", async () => {
  const db = memoryDb();
  const record = await createProperty(
    db,
    { name: "Nova kuća", slug: "nova-kuca", type: "house" },
    user,
  );
  assert.equal(record.published, null);
  assert.equal(record.draft.units.length, 0);
  assert.equal(record.draft.photos.length, 0);
  assert.equal((await publicProperties(db)).objects.length, 0);
  assert.ok(publicationIssues(record.draft).length);
  await assert.rejects(publicProperty(db, "nova-kuca"), { status: 404 });
  assert.equal(db.data.has("site/public"), false);
});
test("object creation reserves unique stable URLs and never writes to the original Meleh", async () => {
  const db = memoryDb({ "site/public": publicSiteRecord(defaults, 9) }),
    before = structuredClone(db.data.get("site/public"));
  await createProperty(
    db,
    { name: "Nova kuća", slug: "nova-kuca", type: "house" },
    user,
  );
  await assert.rejects(
    createProperty(
      db,
      { name: "Duplikat", slug: "nova-kuca", type: "villa" },
      user,
    ),
    { status: 409 },
  );
  await assert.rejects(
    createProperty(
      db,
      { name: "Drugi Meleh", slug: "meleh", type: "house" },
      user,
    ),
    { status: 409 },
  );
  assert.deepEqual(db.data.get("site/public"), before);
  const objects = await listProperties(db, { data: defaults });
  assert.equal(objects.objects[0].id, "meleh");
  assert.equal(objects.objects[0].units, 6);
});
test("object drafts have independent revisions and cannot overwrite concurrent edits or change URLs", async () => {
  const db = memoryDb(),
    one = await createProperty(
      db,
      { name: "Jedan", slug: "jedan", type: "house" },
      user,
    ),
    two = await createProperty(
      db,
      { name: "Dva", slug: "dva", type: "villa" },
      user,
    );
  const draft = completeProperty("Jedan", "jedan");
  const saved = await savePropertyDraft(
    db,
    one.id,
    { revision: 1, data: draft },
    user,
  );
  assert.equal(saved.revision, 2);
  await assert.rejects(
    savePropertyDraft(db, one.id, { revision: 1, data: draft }, user),
    { status: 409 },
  );
  await assert.rejects(
    savePropertyDraft(
      db,
      one.id,
      { revision: 2, data: { ...draft, slug: "drugi-url" } },
      user,
    ),
    { status: 400 },
  );
  assert.equal((await readProperty(db, two.id)).revision, 1);
});
test("publication exposes only the published snapshot, not newer private edits, and archives history per object", async () => {
  const db = memoryDb();
  let record = await createProperty(
    db,
    { name: "Kuća", slug: "kuca", type: "house" },
    user,
  );
  record = await savePropertyDraft(
    db,
    record.id,
    { revision: 1, data: completeProperty("Kuća", "kuca") },
    user,
  );
  record = await publishProperty(
    db,
    record.id,
    { revision: record.revision },
    user,
  );
  const firstPublished = record.published.data;
  record = await savePropertyDraft(
    db,
    record.id,
    {
      revision: record.revision,
      data: { ...record.draft, name: "Privatni novi naziv" },
    },
    user,
  );
  assert.equal((await publicProperty(db, "kuca")).name, "Kuća");
  record = await publishProperty(
    db,
    record.id,
    { revision: record.revision },
    user,
  );
  const history = await propertyHistory(db, record.id);
  assert.equal(history.versions.length, 1);
  assert.equal(history.versions[0].revision, 1);
  assert.equal(
    (await publicProperties(db)).objects[0].name,
    "Privatni novi naziv",
  );
  const restored = await restoreProperty(
    db,
    record.id,
    { revision: record.revision, versionId: history.versions[0].id },
    user,
  );
  assert.deepEqual(restored.draft, firstPublished);
  assert.equal((await publicProperty(db, "kuca")).name, "Privatni novi naziv");
  assert.equal("draft" in (await publicProperty(db, "kuca")), false);
});
test("incomplete units, unsafe text, missing image references and low contrast colours cannot publish", async () => {
  const db = memoryDb();
  const record = await createProperty(
    db,
    { name: "Nova kuća", slug: "nova-kuca", type: "house" },
    user,
  );
  await assert.rejects(publishProperty(db, record.id, { revision: 1 }, user), {
    status: 400,
  });
  const complete = completeProperty();
  for (const change of [
    (p) => (p.name = "<script>"),
    (p) => (p.branding.accent = "#ffffff"),
    (p) => (p.units[0].image = "missing"),
    (p) => (p.photos[0].url = "https://untrusted.test/x.jpg"),
    (p) => (p.photos[0].file = "../../file.webp"),
    (p) => (p.units[0].guests = 2.5),
  ]) {
    const p = structuredClone(complete);
    change(p);
    assert.throws(() => normalizeProperty(p));
  }
});
test("pages and sections retain order, visibility, translations and scope-safe photo references", () => {
  const p = completeProperty();
  const section = (type) => ({
    id: randomUUID(),
    type,
    visible: true,
    title: localized("Naslov"),
    body: localized("Prvi redak\nDrugi redak"),
    photoKeys: ["own-photo"],
    align: "left",
    surface: "blue",
  });
  p.pages = [
    {
      id: randomUUID(),
      slug: "pocetna",
      title: localized("Početna"),
      sections: [section("hero"), section("gallery")],
    },
  ];
  p.pages[0].sections[1].visible = false;
  p.pages[0].sections.reverse();
  const normalized = normalizeProperty(p);
  assert.equal(normalized.pages[0].sections[0].visible, false);
  assert.equal(normalized.pages[0].sections[1].type, "hero");
  const duplicate = structuredClone(p);
  duplicate.pages.push({ ...p.pages[0], id: randomUUID() });
  assert.throws(() => normalizeProperty(duplicate));
  p.pages[0].sections[0].photoKeys = ["missing"];
  assert.throws(() => normalizeProperty(p));
});
test("new unit prices follow the existing season rules and reject overlapping ranges", () => {
  const p = completeProperty();
  p.units[0].seasons = [
    { from: "2027-07-01", to: "2027-08-01", nightly: 100, minNights: 7 },
  ];
  assert.equal(normalizeProperty(p).units[0].seasons[0].nightly, 100);
  p.units[0].seasons.push({
    from: "2027-07-15",
    to: "2027-08-15",
    nightly: 120,
    minNights: 1,
  });
  assert.throws(() => normalizeProperty(p));
});
test("development workspace bootstraps public content only and is idempotent", async () => {
  const db = memoryDb({
    "site/public": publicSiteRecord(defaults, 12),
    "site/calendar": { bookings: [{ private: true }] },
    "inquiries/private": { email: "private@example.test" },
  });
  const before = structuredClone([...db.data.entries()]);
  await initializeDevelopmentWorkspace(db, defaults);
  const scoped = developmentDatabase(db);
  assert.equal(
    (await scoped.collection("site").doc("public").get()).data().revision,
    0,
  );
  assert.equal(
    (await scoped.collection("site").doc("calendar").get()).exists,
    false,
  );
  assert.equal((await scoped.collection("inquiries").get()).docs.length, 0);
  let object = await createProperty(
    scoped,
    { name: "Razvoj", slug: "razvoj", type: "house" },
    user,
  );
  object = await savePropertyDraft(
    scoped,
    object.id,
    { revision: 1, data: completeProperty("Razvoj", "razvoj") },
    user,
  );
  await publishProperty(scoped, object.id, { revision: object.revision }, user);
  assert.equal((await publicProperties(db)).objects.length, 0);
  assert.equal((await publicProperties(scoped)).objects.length, 1);
  await initializeDevelopmentWorkspace(db, defaults);
  for (const [path, data] of before) assert.deepEqual(db.data.get(path), data);
});
test("the bridge refuses old servers before forwarding any authenticated write", async () => {
  const calls = [];
  const response = await bridgeCmsRequest(
    new Request("http://localhost/api/admin?resource=cms-publish", {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: "{}",
    }),
    {
      origin: "https://meleh.vercel.app",
      fetcher: async (url, opts) => {
        calls.push({ url: String(url), opts });
        return Response.json({ adminReady: true });
      },
    },
  );
  assert.equal(response.status, 503);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].opts.headers, undefined);
  assert.throws(() =>
    cmsBridgeOrigin({ CMS_API_ORIGIN: "http://localhost:1234" }),
  );
});
test("the bridge forces the development namespace and forwards tokens only to the approved application", async () => {
  const calls = [];
  const response = await bridgeCmsRequest(
    new Request(
      "http://localhost/api/admin?resource=property-create&workspace=production",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: '{"name":"Test"}',
      },
    ),
    {
      origin: "https://meleh.vercel.app",
      fetcher: async (url, opts) => {
        calls.push({ url: String(url), opts });
        return calls.length === 1
          ? Response.json({
              cmsWorkspaceVersion: 1,
              cmsWorkspaces: ["cms-next-dev"],
            })
          : Response.json({ saved: true });
      },
    },
  );
  assert.equal(response.status, 200);
  assert.equal(calls.length, 2);
  const target = new URL(calls[1].url);
  assert.equal(target.origin, "https://meleh.vercel.app");
  assert.equal(target.searchParams.get("workspace"), "cms-next-dev");
  assert.equal(calls[1].opts.headers.get("origin"), target.origin);
  assert.equal(calls[1].opts.headers.get("authorization"), "Bearer test-token");
  assert.equal(calls[1].opts.redirect, "error");
});
test("new private property routes require Google authorization in either workspace", async () => {
  const old = process.env.ADMIN_EMAIL;
  process.env.ADMIN_EMAIL = "admin@example.test";
  try {
    for (const workspace of ["", "&workspace=cms-next-dev"])
      for (const [resource, method] of [
        ["property-list", "GET"],
        ["property-create", "POST"],
        ["property", "GET"],
        ["property-draft", "PUT"],
        ["property-publish", "POST"],
        ["property-history", "GET"],
        ["property-restore", "POST"],
      ]) {
        const r = await handle(
          new Request(
            "https://example.test/api/admin?resource=" + resource + workspace,
            { method, headers: { Origin: "https://example.test" } },
          ),
        );
        assert.equal(r.status, 401);
      }
  } finally {
    if (old === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = old;
  }
});
test("development cron and unknown namespaces fail closed without side effects", async () => {
  for (const [path, status] of [
    ["/api/calendar-background?workspace=cms-next-dev", 403],
    ["/api/config?workspace=arbitrary", 400],
  ])
    assert.equal(
      (await handle(new Request("https://example.test" + path))).status,
      status,
    );
});
