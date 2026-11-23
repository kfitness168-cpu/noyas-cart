// Google topic pages: /gluten-free/sandwiches, /gluten-free/breakfast ... (text editable in /admin-seo.html)
import { loadSeo } from "../_seo.js";
import { renderPage, notFound } from "../_page.js";

export async function onRequestGet({ request, env, params }) {
  const slug = String(params.page || "");
  const cfg = await loadSeo(env);
  const p = cfg.pages[slug];
  if (!p || !p.on) return notFound();
  const origin = new URL(request.url).origin;
  return new Response(renderPage(origin, cfg, slug), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" }
  });
}
