// Shared helpers for the orders API.
// Admin password: set ADMIN_PASSWORD in Cloudflare (Settings > Variables) to change it.
// Until then the default password's SHA-256 below is used.
const DEFAULT_HASH = "0660c43393f5df55a26c93719b4aef78769cebbead1eb80bae4b6cb311dcb0a1";

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

async function sha256(t) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
}

export async function isAdmin(request, env) {
  const pw = request.headers.get("x-admin-key") || "";
  if (!pw) return false;
  if (env.ADMIN_PASSWORD) return pw === env.ADMIN_PASSWORD;
  return (await sha256(pw)) === DEFAULT_HASH;
}

// true when the KV namespace "ORDERS" is bound to the Pages project
export const hasDb = env => !!(env && env.ORDERS);

// Daily sandwich counter (for the cap shown on the site). Key: cap:YYYY-MM-DD
export async function addCap(env, day, n) {
  if (!n) return;
  const k = "cap:" + day;
  const c = Math.max(0, (parseInt(await env.ORDERS.get(k), 10) || 0) + n);
  await env.ORDERS.put(k, String(c), { expirationTtl: 60 * 60 * 24 * 40 });
}
