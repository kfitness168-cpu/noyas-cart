import { json, hasDb } from "./_shared.js";

// Public: how many sandwiches were already ordered for a day (?day=YYYY-MM-DD). Used for the daily cap.
export async function onRequestGet({ request, env }) {
  if (!hasDb(env)) return json({ ok: false, error: "no-db" }, 503);
  const day = new URL(request.url).searchParams.get("day") || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return json({ ok: false, error: "bad-day" }, 400);
  const count = parseInt(await env.ORDERS.get("cap:" + day), 10) || 0;
  return json({ ok: true, count });
}
