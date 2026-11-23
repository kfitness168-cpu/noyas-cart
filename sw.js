// Service worker for the owner's order notifications (only registered from /admin.html).
const KEYCACHE = "noya-admin";
async function adminKey() {
  try { const c = await caches.open(KEYCACHE); const r = await c.match("/__admkey"); return r ? await r.text() : ""; } catch (e) { return ""; }
}
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("push", e => {
  e.waitUntil((async () => {
    let title = "🥪 הזמנה חדשה באתר", body = "לחצו לפתיחת ההזמנות", url = "/admin.html", tag = "noya-order";
    try {
      const k = await adminKey();
      const r = await fetch("/api/orders/latest", { headers: { "X-Admin-Key": k }, cache: "no-store" });
      const j = await r.json();
      const o = j && j.last;
      if (o && o.test) { title = "✅ התראות פועלות!"; body = "ככה תקבל הודעה על כל הזמנה חדשה."; tag = "noya-test"; }
      else if (o) {
        title = `${o.urgent ? "🚨 דחופה · " : "🥪 "}הזמנה חדשה #${o.num} · ₪${o.total}`;
        body = [o.name, o.town, o.when ? (o.when + (o.slot ? " " + o.slot : "")) : ""].filter(Boolean).join(" · ") + (o.items ? "\n" + o.items : "");
        url = "/admin.html#o=" + encodeURIComponent(o.key);
        tag = "noya-" + o.num;
      }
    } catch (err) {}
    await self.registration.showNotification(title, { body, tag, icon: "/admin-icon-192.png", badge: "/admin-icon-192.png", data: { url }, dir: "rtl", lang: "he" });
  })());
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/admin.html";
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) { if (c.url.includes("/admin.html")) { await c.focus(); c.navigate(url).catch(() => {}); return; } }
    await self.clients.openWindow(url);
  })());
});
