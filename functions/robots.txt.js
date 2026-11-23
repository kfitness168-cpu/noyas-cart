export function onRequestGet({ request }) {
  const origin = new URL(request.url).origin;
  return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin.html\nDisallow: /admin-seo.html\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`,
    { headers: { "content-type": "text/plain; charset=utf-8" } });
}
