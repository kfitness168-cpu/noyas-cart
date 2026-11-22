import { json, isAdmin, hasDb } from "./_shared.js";
export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false }, 401);
  return json({ ok: true, db: hasDb(env) });
}
