const CACHE_NAME = "learning-everyday-shell-v42";
const APP_CACHE_PREFIX = "learning-everyday-";
const APP_SHELL = ["./", "./index.html", "./writing-lab.html", "./writing-lab-core.js", "./writing-lab-unicode.js", "./styles.css", "./app.js", "./learning-core.js", "./dictionary.js", "./local-state.js", "./pdf-import.js", "./curriculum.js", "./curriculum-ui.js", "./speaking.js", "./speaking-data.js", "./cursive-paths.js", "./progress-state.js", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(APP_CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const isPinnedPdfAsset = url.origin === "https://cdn.jsdelivr.net"
    && /^\/npm\/pdfjs-dist@4\.10\.38\/build\/pdf(?:\.worker)?\.min\.mjs$/.test(url.pathname);
  if (url.origin !== self.location.origin && !isPinnedPdfAsset) return;
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Cache only same-origin app files and the two explicitly pinned PDF.js assets.
        if (response.ok && (response.type === "basic" || (isPinnedPdfAsset && response.type === "cors"))) {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => {
        if (request.mode === "navigate") return caches.match("./index.html");
        return new Response("Offline and this resource is not cached.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      });
    })
  );
});
