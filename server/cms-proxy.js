import { CMS_WORKSPACE, CMS_WORKSPACE_VERSION } from "./cms-workspace.js";
const allowedOrigin = "https://meleh.vercel.app";
export function cmsBridgeOrigin(env = process.env) {
  const value = env.CMS_API_ORIGIN;
  if (!value) return null;
  if (value !== allowedOrigin)
    throw new Error("CMS API veza mora pokazivati na odobrenu Meleh domenu.");
  return value;
}
const unavailable = () =>
  Response.json(
    {
      error:
        "Razvojni prostor još nije omogućen na Meleh API-ju. Spremanje je blokirano radi zaštite produkcije.",
    },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
export async function bridgeCmsRequest(
  request,
  { origin = cmsBridgeOrigin(), fetcher = fetch } = {},
) {
  if (origin !== allowedOrigin) return unavailable();
  const probe = await fetcher(
    origin + "/api/config?workspace=" + CMS_WORKSPACE,
    { cache: "no-store", signal: AbortSignal.timeout(10000) },
  );
  if (!probe.ok) return unavailable();
  const config = await probe.json();
  // Old production APIs ignore unknown query fields. Never forward a write until the
  // backend explicitly proves namespace support, otherwise it could hit site/public.
  if (
    config.cmsWorkspaceVersion !== CMS_WORKSPACE_VERSION ||
    !config.cmsWorkspaces?.includes(CMS_WORKSPACE)
  )
    return unavailable();
  const input = new URL(request.url);
  if (!input.pathname.startsWith("/api/")) return unavailable();
  const target = new URL(input.pathname + input.search, origin);
  target.searchParams.set("workspace", CMS_WORKSPACE);
  if (input.pathname === "/api/config" && request.method === "GET")
    return Response.json(config, {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  const headers = new Headers();
  for (const key of ["authorization", "content-type"]) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  headers.set("Origin", origin);
  let body;
  if (!["GET", "HEAD"].includes(request.method) && request.body) {
    const parts = [];
    let length = 0;
    for await (const part of request.body) {
      length += part.byteLength;
      if (length > 2200000)
        return Response.json(
          { error: "Zahtjev je prevelik." },
          { status: 413 },
        );
      parts.push(part);
    }
    body = Buffer.concat(parts);
  }
  const response = await fetcher(target, {
    method: request.method,
    headers,
    body,
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(120000),
  });
  return new Response(request.method === "HEAD" ? null : response.body, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") || "application/json",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
