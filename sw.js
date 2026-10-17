// RE100:SMART 서비스 워커 - 한 번 받은 파일을 휴대폰에 저장해서 화면 이동을 바로바로!
// 새 버전을 올릴 때는 CACHE 이름의 숫자를 올려주세요 (예: v2 → v3)
const CACHE = "re100-v2";

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
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 저장된 게 있으면 바로 보여주고, 뒤에서 최신 파일로 바꿔둬요 (stale-while-revalidate)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === "cdn.jsdelivr.net" && url.pathname.endsWith(".woff2");
  if (!sameOrigin && !isFont) return;

  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req, { ignoreSearch: sameOrigin }).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        // 글씨체는 바뀌지 않으니 저장본만 써요
        if (cached && isFont) return cached;
        return cached || network;
      })
    )
  );
});