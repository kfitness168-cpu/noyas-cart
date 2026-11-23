import { json, isAdmin, hasDb, addCap } from "../_shared.js";

const STATUSES = ["new", "prep", "sent", "done"];

// Admin: change an order's status
export async function onRequestPatch({ request, env, params }) {
  if (!(await isAdmin(request, env))) return json({ ok: false }, 401);
  if (!hasDb(env)) return json({ ok: false, error: "no-db" }, 503);
  const key = decodeURIComponent(params.key || "");
  if (!key.startsWith("o:")) return json({ ok: false }, 400);
  const o = await env.ORDERS.get(key, "json");
  if (!o) return json({ ok: false, error: "not-found" }, 404);
  const body = await request.json().catch(() => ({}));
  if (body.status && STATUSES.includes(body.status)) o.status = body.status;
  o.updatedAt = new Date().toISOString();
  await env.ORDERS.put(key, JSON.stringify(o), { expirationTtl: 60 * 60 * 24 * 120 });
  return json({ ok: true, order: o });
}

// Admin: delete an order (e.g. a test order)
export async function onRequestDelete({ request, env, params }) {
  if (!(await isAdmin(request, env))) return json({ ok: false }, 401);
  if (!hasDb(env)) return json({ ok: false, error: "no-db" }, 503);
  const key = decodeURIComponent(params.key || "");
  if (!key.startsWith("o:")) return json({ ok: false }, 400);
  const o = await env.ORDERS.get(key, "json");
  await env.ORDERS.delete(key);
  // a deleted order (e.g. a test) frees its sandwiches from the daily cap
  if (o && o.sw) { const day = key.split(":")[1]; if (/^\d{4}-\d{2}-\d{2}$/.test(day)) await addCap(env, day, -o.sw); }
  return json({ ok: true });
}
