import { publicSiteRecord } from "./site-record.js";
export const CMS_WORKSPACE = "cms-next-dev";
export const CMS_WORKSPACE_VERSION = 1;
const ROOT = "cmsDevelopment/next";
export function developmentDatabase(db) {
  return {
    collection: (name) => db.collection(ROOT + "/" + name),
    runTransaction: (fn) => db.runTransaction(fn),
  };
}
export async function initializeDevelopmentWorkspace(db, defaults) {
  const target = db.collection(ROOT + "/site").doc("public");
  await db.runTransaction(async (tx) => {
    const [current, production] = await Promise.all([
      tx.get(target),
      tx.get(db.collection("site").doc("public")),
    ]);
    if (current.exists) return;
    // Copy only the public catalogue, never calendars, inquiries, private guides or credentials.
    const data = production.data()?.data || defaults;
    tx.set(target, { ...publicSiteRecord(data, 0), workspace: CMS_WORKSPACE });
  });
}
