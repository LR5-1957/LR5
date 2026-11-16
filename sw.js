/* Service worker : permet de jouer même sans réseau (dans le train, à la montagne…).
 * Stratégie « réseau d'abord » : quand Internet marche, on prend TOUJOURS la version en ligne
 * (donc tes modifications sur GitHub arrivent tout de suite) ; sinon on sert la copie gardée.
 * La liste et la version ci-dessous sont remplies par le script de préparation du site.
 * Pas besoin d'y toucher quand on corrige une question : la version en ligne passe toujours en premier. */
var VERSION = "lr5-17c287ecef";
var CACHE = "quiz-" + VERSION;
var FICHIERS = [
  "./",
  "index.html",
  "parents.html",
  "404.html",
  "manifest.webmanifest",
  "css/style.css",
  "css/theme.css",
  "js/app.js",
  "js/config.js",
  "js/flags.js",
  "js/memory.js",
  "js/parents.js",
  "js/penalty.js",
  "data/espace.js",
  "data/football.js",
  "data/geographie.js",
  "assets/favicon.svg",
  "assets/icon-180.png",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/icon-maskable-512.png",
  "assets/mascotte.svg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FICHIERS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf("quiz-") === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.ok && res.type === "basic") { var copie = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copie); }); }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (r) {
      return r || (req.mode === "navigate" ? caches.match("./index.html") : Response.error());
    });
  }));
});
