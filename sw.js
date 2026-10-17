// RE100:SMART 서비스 워커
// - 화면(html) · 코드(js/css): 항상 서버에서 최신 버전을 먼저 확인해요 (인터넷이 없거나 느리면 저장본)
// - 그림 · 글씨체: 휴대폰에 저장된 걸 바로 써요 (그래서 화면 이동이 빨라요)
// 파일을 추가/삭제하면 PRECACHE 목록을 다시 만들고 CACHE 숫자를 올려주세요 (v3 → v4)
const CACHE = "re100-v4";
const NETWORK_TIMEOUT = 2500;

const PRECACHE = [
  "./",
  "cart.html",
  "certificate.html",
  "chat.html",
  "css/style.css",
  "growth.html",
  "home.html",
  "images/chars/bananakick.webp",
  "images/chars/basil.webp",
  "images/chars/cheonggyeongchae.webp",
  "images/chars/cheongSangchu.webp",
  "images/chars/concho.webp",
  "images/chars/gamjakkang.webp",
  "images/chars/ggotgerang.webp",
  "images/chars/honeybutter.webp",
  "images/chars/jagalchi.webp",
  "images/chars/jeokSangchu.webp",
  "images/chars/mint.webp",
  "images/chars/pokachip.webp",
  "images/chars/postick.webp",
  "images/chars/ppaepparo.webp",
  "images/chars/romaine.webp",
  "images/chars/sleep/basil.webp",
  "images/chars/sleep/cheonggyeongchae.webp",
  "images/chars/sleep/cheongSangchu.webp",
  "images/chars/sleep/jeokSangchu.webp",
  "images/chars/sleep/mint.webp",
  "images/chars/sleep/romaine.webp",
  "images/chars/yangparing.webp",
  "images/icons/icon-180.png",
  "images/icons/icon-192.png",
  "images/icons/icon-512.png",
  "index.html",
  "js/cart.js",
  "js/certificate.js",
  "js/characters.js",
  "js/chat.js",
  "js/common.js",
  "js/growth.js",
  "js/home.js",
  "js/icons.js",
  "js/lounge.js",
  "js/lounge-room.js",
  "js/menu.js",
  "js/missions.js",
  "js/myroom.js",
  "js/profile.js",
  "js/recipe.js",
  "js/tabbar.js",
  "js/welcome.js",
  "lounge.html",
  "lounge-room.html",
  "manifest.json",
  "menu.html",
  "missions.html",
  "myroom.html",
  "profile.html",
  "recipe.html",
];

self.addEventListener("install", (event) => {
  // cache: "reload" → 휴대폰에 남은 예전 파일 말고 서버의 최신 파일로 저장
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isStatic(url) {
  return /\.(webp|png|woff2|json)$/.test(url.pathname);
}

// 최신 먼저: 서버에 물어보고(no-cache), 너무 늦거나 안 되면 저장본
function networkFirst(req, cache) {
  return new Promise((resolve) => {
    let settled = false;
    const fallback = () =>
      cache.match(req, { ignoreSearch: true }).then((cached) => {
        if (!settled && cached) {
          settled = true;
          resolve(cached);
        }
        return cached;
      });
    const timer = setTimeout(fallback, NETWORK_TIMEOUT);
    fetch(req, { cache: "no-cache" })
      .then((res) => {
        clearTimeout(timer);
        if (res && res.ok) cache.put(req, res.clone());
        if (!settled) {
          settled = true;
          resolve(res);
        }
      })
      .catch(() => {
        clearTimeout(timer);
        fallback().then((cached) => {
          if (!settled) {
            settled = true;
            resolve(cached || Response.error());
          }
        });
      });
  });
}

// 저장본 먼저: 그림 · 글씨체
function cacheFirst(req, cache) {
  return cache.match(req).then(
    (cached) =>
      cached ||
      fetch(req).then((res) => {
        if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
        return res;
      })
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === "cdn.jsdelivr.net" && url.pathname.endsWith(".woff2");
  if (!sameOrigin && !isFont) return;

  event.respondWith(
    caches.open(CACHE).then((cache) => (isFont || isStatic(url) ? cacheFirst(req, cache) : networkFirst(req, cache)))
  );
});