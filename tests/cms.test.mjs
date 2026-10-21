import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { memoryDb } from "./memory-db.mjs";
import {
  readCmsDraft,
  saveCmsDraft,
  publishContent,
  listCmsHistory,
  restoreCmsVersion,
} from "../server/cms.js";
import { publicSiteRecord } from "../server/site-record.js";
import { handle } from "../api/index.js";
const site = JSON.parse(
  await readFile(
    new URL("../server/default-site.json", import.meta.url),
    "utf8",
  ),
);
const user = { uid: "test-admin" },
  seed = () =>
    memoryDb({ "site/public": publicSiteRecord(structuredClone(site), 4) });
test("draft saves and previews never change published content or bookings", async () => {
  const db = seed(),
    initial = await readCmsDraft(db, { data: site, revision: 4 });
  assert.equal(initial.revision, 0);
  const data = structuredClone(site);
  data.name = "Nova skica";
  const saved = await saveCmsDraft(
    db,
    { data, revision: 0, baseRevision: 4 },
    user,
  );
  assert.equal(saved.revision, 1);
  assert.equal(db.data.get("site/public").data.name, site.name);
  assert.equal(db.data.has("site/calendar"), false);
  assert.equal(
    (await readCmsDraft(db, { data: site, revision: 4 })).data.name,
    "Nova skica",
  );
});
test("draft save rejects competing edits and invalid content", async () => {
  const db = seed();
  await saveCmsDraft(db, { data: site, revision: 0, baseRevision: 4 }, user);
  await assert.rejects(
    saveCmsDraft(db, { data: site, revision: 0, baseRevision: 4 }, user),
    { status: 409 },
  );
  await assert.rejects(
    saveCmsDraft(
      db,
      { data: { ...site, name: "<script>" }, revision: 1, baseRevision: 4 },
      user,
    ),
  );
  await assert.rejects(
    saveCmsDraft(db, { data: site, revision: -1, baseRevision: 4 }, user),
  );
});
test("publication atomically archives the previous version and keeps migration markers", async () => {
  const db = seed(),
    data = structuredClone(site);
  data.name = "Objavljeno iz CMS-a";
  await saveCmsDraft(db, { data, revision: 0, baseRevision: 4 }, user);
  const published = await publishContent(
    db,
    { revision: 4, draftRevision: 1 },
    user,
    { draft: true },
  );
  assert.equal(published.revision, 5);
  assert.equal(db.data.get("site/public").data.name, data.name);
  assert.ok(db.data.get("site/public").specificationRevision);
  assert.equal(db.data.get("site/cmsDraft").baseRevision, 5);
  const history = await listCmsHistory(db);
  assert.equal(history.versions.length, 1);
  assert.equal(history.versions[0].revision, 4);
  assert.equal("data" in history.versions[0], false);
  assert.equal(
    db.data.get("cmsHistory/" + history.versions[0].id).data.name,
    site.name,
  );
});
test("legacy editor publication makes an older CMS draft conflict rather than overwriting it", async () => {
  const db = seed();
  await saveCmsDraft(db, { data: site, revision: 0, baseRevision: 4 }, user);
  await publishContent(
    db,
    { data: { ...site, name: "Uredio drugi admin" }, revision: 4 },
    user,
  );
  await assert.rejects(
    publishContent(db, { revision: 5, draftRevision: 1 }, user, {
      draft: true,
    }),
    { status: 409 },
  );
  assert.equal(db.data.get("site/public").data.name, "Uredio drugi admin");
  assert.equal((await listCmsHistory(db)).versions.length, 1);
});
test("publication rejects removed apartment references in calendars and feeds", async () => {
  for (const reference of ["booking", "feed"]) {
    const db = seed(),
      slug = site.apartments[0].slug;
    if (reference === "booking")
      db.data.set("site/calendar", { bookings: [{ apartment: slug }] });
    else db.data.set("calendarFeeds/test", { apartment: slug });
    const data = structuredClone(site);
    data.apartments = data.apartments.slice(1);
    data.photos.forEach((p) => {
      if (p.category === slug) p.category = "house";
    });
    await assert.rejects(publishContent(db, { data, revision: 4 }, user), {
      status: 409,
    });
    assert.equal(db.data.get("site/public").revision, 4);
    assert.equal((await listCmsHistory(db)).versions.length, 0);
  }
});
test("history restoration creates a private draft and requires a separate publication", async () => {
  const db = seed();
  await publishContent(
    db,
    { data: { ...site, name: "Aktualni naziv" }, revision: 4 },
    user,
  );
  const { versions } = await listCmsHistory(db);
  const restored = await restoreCmsVersion(
    db,
    { id: versions[0].id, revision: 0 },
    user,
    { data: site, revision: 5 },
  );
  assert.equal(restored.data.name, site.name);
  assert.equal(restored.baseRevision, 5);
  assert.equal(db.data.get("site/public").data.name, "Aktualni naziv");
  await assert.rejects(
    restoreCmsVersion(db, { id: versions[0].id, revision: 0 }, user, {
      revision: 5,
    }),
    { status: 409 },
  );
});
test("stale publication or stale draft revision cannot publish and do not add history", async () => {
  const db = seed();
  await saveCmsDraft(db, { data: site, revision: 0, baseRevision: 4 }, user);
  for (const input of [
    { revision: 3, draftRevision: 1 },
    { revision: 4, draftRevision: 0 },
  ])
    await assert.rejects(publishContent(db, input, user, { draft: true }), {
      status: 409,
    });
  assert.equal((await listCmsHistory(db)).versions.length, 0);
});
test("all CMS endpoints require server-side administrator authorization", async () => {
  const previous = process.env.ADMIN_EMAIL;
  process.env.ADMIN_EMAIL = "admin@example.test";
  try {
    for (const [resource, method] of [
      ["cms-draft", "GET"],
      ["cms-draft", "PUT"],
      ["cms-publish", "POST"],
      ["cms-history", "GET"],
      ["cms-restore", "POST"],
      ["cms-reset", "POST"],
    ]) {
      const response = await handle(
        new Request("https://example.test/api/admin?resource=" + resource, {
          method,
          headers: { Origin: "https://example.test" },
        }),
      );
      assert.equal(response.status, 401);
    }
  } finally {
    if (previous === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = previous;
  }
});
test("resetting a stale draft uses the current publication and still checks draft concurrency", async () => {
  const { resetCmsDraft } = await import("../server/cms.js");
  const db = seed();
  await saveCmsDraft(db, { data: site, revision: 0, baseRevision: 4 }, user);
  await publishContent(
    db,
    { data: { ...site, name: "Nova javna verzija" }, revision: 4 },
    user,
  );
  const reset = await resetCmsDraft(db, { revision: 1 }, user, {
    data: site,
    revision: 4,
  });
  assert.equal(reset.baseRevision, 5);
  assert.equal(reset.data.name, "Nova javna verzija");
  assert.equal(reset.revision, 2);
  await assert.rejects(
    resetCmsDraft(db, { revision: 1 }, user, { data: site, revision: 4 }),
    { status: 409 },
  );
  assert.equal(db.data.get("site/public").revision, 5);
});
