// Admin only: read / save the Google (SEO) settings. Saved in KV key "seo".
import { json, isAdmin, hasDb } from "./_shared.js";
import { loadSeo, cleanSeo, DEFAULTS } from "../_seo.js";

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false }, 401);
  return json({ ok: true, db: hasDb(env), seo: await loadSeo(env), defaults: DEFAULTS });
}
export async function onRequestPut({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false }, 401);
  if (!hasDb(env)) return json({ ok: false, error: "no-db" }, 503);
  let body; try { body = await request.json(); } catch (e) { return json({ ok: false, error: "bad-json" }, 400); }
  const clean = cleanSeo(body || {});
  await env.ORDERS.put("seo", JSON.stringify(clean));
  return json({ ok: true, seo: await loadSeo(env) });
}
// "Back to the original texts"
export async function onRequestDelete({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false }, 401);
  if (hasDb(env)) await env.ORDERS.delete("seo");
  return json({ ok: true, seo: await loadSeo(env) });
}
