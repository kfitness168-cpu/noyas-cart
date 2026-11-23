import { json, isAdmin, hasDb } from "../_shared.js";
// Admin: what the last notification is about (used by /sw.js)
export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false }, 401);
  if (!hasDb(env)) return json({ ok: false, error: "no-db" }, 503);
  return json({ ok: true, last: await env.ORDERS.get("push:last", "json") });
}
