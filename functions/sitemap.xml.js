// Site map for Google: home page + every topic page that is turned on
import { loadSeo } from "./_seo.js";
export async function onRequestGet({ request, env }) {
  const origin = new URL(request.url).origin;
  const cfg = await loadSeo(env);
  const urls = [origin + "/"].concat(Object.entries(cfg.pages).filter(([, p]) => p.on).map(([k]) => `${origin}/gluten-free/${k}`));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
