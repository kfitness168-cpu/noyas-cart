// Home page: apply the Google settings saved in the admin (title, description, text, links, business card).
// If anything fails, the page is served exactly as it is in index.html.
import { loadSeo, businessLd, esc } from "./_seo.js";

export async function onRequestGet({ request, env, next }) {
  const res = await next();
  try {
    if (!(res.headers.get("content-type") || "").includes("text/html")) return res;
    const cfg = await loadSeo(env);
    const origin = new URL(request.url).origin;
    const h = cfg.home;
    const attr = (name, value) => ({ element(e) { e.setAttribute(name, value); } });
    const links = Object.entries(cfg.pages).filter(([, p]) => p.on)
      .map(([k, p]) => `<a href="/gluten-free/${k}">${esc(p.label)}</a>`).join("");
    return new HTMLRewriter()
      .on("title", { element(e) { e.setInnerContent(h.title); } })
      .on('meta[name="description"]', attr("content", h.desc))
      .on('meta[property="og:title"]', attr("content", h.title))
      .on('meta[property="og:description"]', attr("content", h.desc))
      .on('meta[property="og:url"]', attr("content", origin + "/"))
      .on('meta[property="og:image"]', attr("content", origin + "/img/sh-tray.jpg"))
      .on('link[rel="canonical"]', attr("href", origin + "/"))
      .on("script#ld", { element(e) { e.setInnerContent(JSON.stringify(businessLd(origin, cfg)).replace(/</g, "\\u003c"), { html: true }); } })
      .on("#seo-text", { element(e) { e.setInnerContent(h.text); } })
      .on("#seo-links", { element(e) { e.setInnerContent(links, { html: true }); } })
      .transform(res);
  } catch (e) {
    return res;
  }
}
