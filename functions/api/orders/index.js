import { json, isAdmin, hasDb, addCap } from "../_shared.js";
import { pushAll } from "../_push.js";

const STATUSES = ["new", "prep", "sent", "done"];

// Customer places an order (public). Saved alongside the WhatsApp message.
export async function onRequestPost({ request, env, waitUntil }) {
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
  rec.sw = Math.max(0, Math.min(60, parseInt(o.sw, 10) || 0));
  await env.ORDERS.put(key, JSON.stringify(rec), { expirationTtl: 60 * 60 * 24 * 120 });
  await addCap(env, day, rec.sw);
  // notify the owner's phone(s)
  const town = (rec.delName || "").replace(/^משלוח (ב|ל)?/, "") || (rec.del === "pickup" ? "איסוף עצמי" : "");
  const items = rec.lines.map(l => `${l.qty}× ${l.name}`).join(", ");
  await env.ORDERS.put("push:last", JSON.stringify({ key, day, num: n, total: rec.total, name: `${rec.first || ""} ${rec.last || ""}`.trim(), town, when: rec.when || rec.day || "", slot: rec.slot || "", items, urgent: !!rec.urgent }), { expirationTtl: 60 * 60 * 24 * 3 });
  const p = pushAll(env).catch(() => {});
  if (waitUntil) waitUntil(p); else await p;
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
