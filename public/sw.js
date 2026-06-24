// 檔案路徑：public/sw.js
const CACHE_NAME = "ai-note-pwa-v1";

// 我們要預先快取的核心靜態資源
const urlsToCache = ["/", "/manifest.json"];

// 1. 安裝階段：將基礎資源寫入快取
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Service Worker: 開啟快取");
            return cache.addAll(urlsToCache);
        }),
    );
    self.skipWaiting(); // 強制立即接管
});

// 2. 啟動階段：清除舊版快取
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log("Service Worker: 清除舊快取", cacheName);
                        return caches.delete(cacheName);
                    }
                }),
            );
        }),
    );
    self.clients.claim();
});

// 3. 攔截網路請求 (Fetch)：網路優先，失敗則退回快取 (Network First strategy)
self.addEventListener("fetch", (event) => {
    // 只攔截 GET 請求
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 如果網路成功，順便把新的回應存進快取
                if (
                    response &&
                    response.status === 200 &&
                    response.type === "basic"
                ) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // 如果網路斷線，則從快取中尋找
                return caches.match(event.request);
            }),
    );
});
