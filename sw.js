// RE100:SMART 서비스 워커 - 모든 화면·그림·글씨체를 휴대폰 저장본에서 바로 꺼내요 (누르자마자 열리게)
// 새 버전은 CACHE 이름이 바뀔 때 통째로 새로 받아요.
// ⚠️ 배포 전에 항상 tools/update-sw.ps1 을 실행하세요 (목록과 버전을 자동으로 바꿔줘요)
const CACHE = "re100-20261017-164326";

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
  "images/recipes/basil.jpg",
  "images/recipes/cheonggyeongchae.jpg",
  "images/recipes/cheongSangchu.jpg",
  "images/recipes/jeokSangchu.jpg",
  "images/recipes/mint.jpg",
  "images/recipes/romaine.jpg",
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

const FONT_CACHE = "re100-fonts";

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
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === "cdn.jsdelivr.net" && url.pathname.endsWith(".woff2");
  if (!sameOrigin && !isFont) return;

  // 화면 주소의 ?id= 같은 꼬리는 무시하고 같은 화면 저장본을 써요
  const isPage = req.mode === "navigate";
  event.respondWith(
    // 글씨체는 업데이트해도 지우지 않는 따로 된 저장소에 둬요 (매번 다시 받느라 느려지지 않게)
    caches.open(isFont ? FONT_CACHE : CACHE).then((cache) =>
      cache.match(req, { ignoreSearch: isPage }).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
            return res;
          })
      )
    )
  );
});
