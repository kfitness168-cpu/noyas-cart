import { json, isAdmin, hasDb } from "../_shared.js";

const STATUSES = ["new", "prep", "sent", "done"];

// Customer places an order (public). Saved alongside the WhatsApp message.
export async function onRequestPost({ request, env }) {
  if (!hasDb(env)) return json({ ok: false, error: "no-db" }, 503);
  const raw = await request.text();
  if (raw.length > 30000) return json({ ok: false, error: "too-big" }, 413);
  let o;
  try { o = JSON.parse(raw); } catch { return json({ ok: false, error: "bad-json" }, 400); }
  if (!o || !Array.isArray(o.lines) || !o.lines.length || typeof o.first !== "string") return json({ ok: false, error: "bad-order" }, 400);
  const day = /^\d{4}-\d{2}-\d{2}$/.test(o.dayIso || "") ? o.dayIso : new Date().toISOString().slice(0, 10);
  const n = (parseInt(await env.ORDERS.get("seq"), 10) || 1000) + 1;
  await env.ORDERS.put("seq", String(n));
  const key = `o:${day}:${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const rec = { ...o, num: n, status: "new", savedAt: new Date().toISOString(), key };
  await env.ORDERS.put(key, JSON.stringify(rec), { expirationTtl: 60 * 60 * 24 * 120 });
  return json({ ok: true, num: n });
}

// Admin: list orders for a day (?day=YYYY-MM-DD), newest first
export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false }, 401);
  if (!hasDb(env)) return json({ ok: false, error: "no-db" }, 503);
  const url = new URL(request.url);
  const day = url.searchParams.get("day") || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return json({ ok: false, error: "bad-day" }, 400);
  const keys = [];
  let cursor;
  do {
    const r = await env.ORDERS.list({ prefix: `o:${day}:`, cursor });
    keys.push(...r.keys.map(k => k.name));
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  const orders = (await Promise.all(keys.map(k => env.ORDERS.get(k, "json")))).filter(Boolean);
  return json({ ok: true, orders, statuses: STATUSES });
}
