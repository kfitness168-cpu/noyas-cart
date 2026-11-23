// HTML for the Google topic pages (/gluten-free/<page>)
import { esc, textToHtml, TOWNS } from "./_seo.js";

const CSS = `:root{--honey:#F2B544;--leaf:#5BA36B;--leaf-btn:#3A7548;--cream:#FFF8EE;--cream2:#FBEBD3;--brown:#3B2A20;--brown2:#6E5547;--coral:#F28C7A}
*{box-sizing:border-box}html,body{margin:0}
body{background:var(--cream);color:var(--brown);font-family:"Heebo","Rubik",Arial,sans-serif;font-size:17px;line-height:1.65}
a{color:var(--leaf-btn)}
.top{display:flex;align-items:center;gap:10px;padding:12px 16px;background:#fff;border-bottom:1px solid var(--cream2)}
.top img{width:44px;height:44px;border-radius:50%}
.top b{font-family:"Rubik","Heebo",Arial,sans-serif;font-weight:900;font-size:18px;display:block;line-height:1.1;color:var(--brown)}
.top small{color:var(--leaf-btn);font-weight:700;font-size:13px}
.top a{text-decoration:none;display:flex;align-items:center;gap:10px}
main{max-width:640px;margin:0 auto;padding:18px 16px 40px}
.badge{display:inline-block;background:var(--leaf-btn);color:#fff;border-radius:99px;padding:3px 12px;font-weight:700;font-size:14px}
h1{font-family:"Rubik","Heebo",Arial,sans-serif;font-weight:900;font-size:30px;line-height:1.2;margin:10px 0 12px}
h2{font-family:"Rubik","Heebo",Arial,sans-serif;font-weight:800;font-size:21px;margin:22px 0 6px}
.hero{width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:20px;display:block;margin:0 0 14px;background:var(--cream2)}
ul{padding-inline-start:22px;margin:6px 0}li{margin:3px 0}
blockquote{margin:14px 0;padding:10px 14px;border-inline-start:4px solid var(--coral);background:#fff;border-radius:12px;font-weight:700}
.cta{display:block;text-align:center;background:var(--leaf-btn);color:#fff;text-decoration:none;font-family:"Rubik","Heebo",Arial,sans-serif;font-weight:800;font-size:19px;border-radius:16px;padding:15px;margin:22px 0 8px}
.more{margin-top:26px;background:#fff;border-radius:18px;padding:12px 16px;border:1.5px solid var(--cream2)}
.more a{display:inline-block;margin:4px 0 4px 14px;font-weight:700}
footer{text-align:center;color:var(--brown2);font-size:14px;padding:10px 16px 30px}`;

export function renderPage(origin, cfg, slug) {
  const p = cfg.pages[slug];
  const url = `${origin}/gluten-free/${slug}`;
  const img = p.img ? origin + p.img : origin + "/img/sh-tray.jpg";
  const others = Object.entries(cfg.pages).filter(([k, x]) => x.on && k !== slug)
    .map(([k, x]) => `<a href="/gluten-free/${k}">${esc(x.label)}</a>`).join("");
  const crumbs = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "העגלה של נויה", item: origin + "/" },
      { "@type": "ListItem", position: 2, name: p.label, item: url }
    ]
  };
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website"><meta property="og:locale" content="he_IL">
<meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(img)}">
<meta name="theme-color" content="#3A7548"><link rel="icon" href="/img/logo.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@700;800;900&family=Heebo:wght@400;700&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(crumbs).replace(/</g, "\\u003c")}</script>
<style>${CSS}</style></head><body>
<header class="top"><a href="/"><img src="/img/logo.jpg" alt="" width="44" height="44"><span><b>העגלה של נויה</b><small>100% ללא גלוטן · חדרה והסביבה</small></span></a></header>
<main>
<span class="badge">100% ללא גלוטן</span>
<h1>${esc(p.h1)}</h1>
${p.img ? `<img class="hero" src="${esc(p.img)}" alt="${esc(p.h1)}" width="640" height="400">` : ""}
${textToHtml(p.text)}
<a class="cta" href="${esc(p.cta || "/")}">${slug === "catering" ? "לבקשת הצעה לאירוע 🎉" : "להזמנה באתר 🥪"}</a>
<nav class="more" aria-label="עוד באתר"><b>עוד אצלנו:</b><br>${others}</nav>
</main>
<footer>העגלה של נויה · מטבח 100% ללא גלוטן בחדרה<br>משלוחים ל${TOWNS.join(", ")}<br>הזמנות בוואטסאפ: <a href="https://wa.me/972525621989" dir="ltr">052-562-1989</a></footer>
</body></html>`;
}

export function notFound() {
  return new Response(`<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="robots" content="noindex"><title>העמוד לא נמצא</title><body style="font-family:Arial;text-align:center;padding:40px;background:#FFF8EE;color:#3B2A20"><h1>העמוד לא נמצא</h1><p><a href="/">לאתר העגלה של נויה</a></p></body></html>`, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
}
