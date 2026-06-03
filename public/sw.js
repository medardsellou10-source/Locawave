// Service worker Locawave — cache "app shell" léger + offline fallback.
// Stratégie : network-first pour la navigation (HTML), cache-first pour les assets statiques.
const CACHE = "locawave-v1"
const OFFLINE_ASSETS = ["/", "/offline.html", "/icons/icon-512.svg"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(OFFLINE_ASSETS)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  // Ne jamais mettre en cache les appels API/Supabase
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/auth")) return

  // Navigation : network-first, fallback cache puis page offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
          return res
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/offline.html")))
    )
    return
  }

  // Assets statiques : cache-first
  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icons") || url.pathname === "/icon.svg") {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
          return res
        })
      )
    )
  }
})
