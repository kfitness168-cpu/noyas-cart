// Free Web Push for the owner's phone (no paid service).
// VAPID keys are created automatically on first use and kept in KV ("vapid").
// Pushes carry no payload; the service worker (/sw.js) fetches /api/orders/latest to show the details.

const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64uStr = s => b64u(new TextEncoder().encode(s));

export async function getVapid(env) {
  let v = await env.ORDERS.get("vapid", "json");
  if (!v) {
    const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    const priv = await crypto.subtle.exportKey("jwk", kp.privateKey);
    const pub = await crypto.subtle.exportKey("raw", kp.publicKey);
    v = { priv, pub: b64u(pub) };
    await env.ORDERS.put("vapid", JSON.stringify(v));
  }
  return v;
}

async function vapidAuth(v, endpoint) {
  const aud = new URL(endpoint).origin;
  const head = b64uStr(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const body = b64uStr(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: "https://noya-cart.pages.dev" }));
  const key = await crypto.subtle.importKey("jwk", v.priv, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(head + "." + body));
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${v.pub}`;
}

export async function getSubs(env) { return (await env.ORDERS.get("push:subs", "json")) || []; }

// Ping every saved device. Expired subscriptions are removed.
export async function pushAll(env) {
  const subs = await getSubs(env);
  if (!subs.length) return { sent: 0 };
  const v = await getVapid(env);
  const keep = [];
  let sent = 0;
  await Promise.all(subs.map(async s => {
    try {
      const r = await fetch(s.endpoint, { method: "POST", headers: { TTL: "86400", Urgency: "high", Authorization: await vapidAuth(v, s.endpoint), "Content-Length": "0" } });
      if (r.status === 404 || r.status === 410) return;
      if (r.ok) sent++;
      keep.push(s);
    } catch { keep.push(s); }
  }));
  if (keep.length !== subs.length) await env.ORDERS.put("push:subs", JSON.stringify(keep));
  return { sent };
}
