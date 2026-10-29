/* R7VA 2026 – service worker : application disponible hors-ligne */
const SHELL = "r7va26-shell-v4", FONTS = "r7va26-fonts";
const FILES = ["./", "index.html", "engages.js", "commerces.js", "confidentialite.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("r7va26-shell") && k !== SHELL).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const u = new URL(req.url);
  // Application : réseau d'abord (pour recevoir les mises à jour), cache si hors-ligne
  if (u.origin === location.origin) {
    e.respondWith(fetch(new Request(req.url, { cache: "no-cache", credentials: "same-origin" })).then(r => { const c = r.clone(); if (r.ok) caches.open(SHELL).then(ca => ca.put(req, c)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("index.html"))));
    return;
  }
  // Polices
  if (u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FONTS).then(ca => ca.match(req).then(hit => hit || fetch(req).then(r => { ca.put(req, r.clone()); return r; }))));
  }
  // Météo et prix des carburants : directement par le réseau
});
