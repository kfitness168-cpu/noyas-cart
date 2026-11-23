import { json, isAdmin, hasDb } from "../_shared.js";
import { getVapid, getSubs, pushAll } from "../_push.js";

// Admin: get the public key for subscribing
export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false }, 401);
  if (!hasDb(env)) return json({ ok: false, error: "no-db" }, 503);
  const v = await getVapid(env);
  return json({ ok: true, key: v.pub, devices: (await getSubs(env)).length });
}

// Admin: save this phone's subscription ({sub}) or send a test ping ({test:true})
export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false }, 401);
  if (!hasDb(env)) return json({ ok: false, error: "no-db" }, 503);
  const b = await request.json().catch(() => ({}));
  if (b.test) {
    await env.ORDERS.put("push:last", JSON.stringify({ test: true, at: new Date().toISOString() }), { expirationTtl: 3600 });
    return json({ ok: true, ...(await pushAll(env)) });
  }
  const s = b.sub;
  if (!s || typeof s.endpoint !== "string" || !/^https:\/\//.test(s.endpoint)) return json({ ok: false, error: "bad-sub" }, 400);
  const subs = (await getSubs(env)).filter(x => x.endpoint !== s.endpoint);
  subs.push({ endpoint: s.endpoint, at: new Date().toISOString() });
  await env.ORDERS.put("push:subs", JSON.stringify(subs.slice(-10)));
  return json({ ok: true, devices: subs.length });
}
