// RE:100 스마트 - 귀엽고 동글동글한 아이콘 세트 (노랑 x 그린 파스텔)
// icon("home") 처럼 부르면 <span class="ic"><svg>…</svg></span> 를 돌려줍니다.

const ICON_BG = {
  green: ["#c8efc4", "#8fd19e"],
  yellow: ["#fff3b0", "#ffd96b"],
  mint: ["#d4f5ea", "#8edcc3"],
  peach: ["#ffe3cf", "#ffbf94"],
  lime: ["#ecf8c4", "#bfe37a"],
};

// 눈 두 개 + 볼터치 (cx, cy 기준)
function iconFace(cx, cy) {
  return (
    '<circle cx="' + (cx - 4) + '" cy="' + cy + '" r="1.6" fill="#4a4336"/>' +
    '<circle cx="' + (cx + 4) + '" cy="' + cy + '" r="1.6" fill="#4a4336"/>' +
    '<circle cx="' + (cx - 7.5) + '" cy="' + (cy + 3) + '" r="1.8" fill="#ffb4a8" opacity=".85"/>' +
    '<circle cx="' + (cx + 7.5) + '" cy="' + (cy + 3) + '" r="1.8" fill="#ffb4a8" opacity=".85"/>' +
    '<path d="M' + (cx - 2) + " " + (cy + 3) + " Q" + cx + " " + (cy + 5.2) + " " + (cx + 2) + " " + (cy + 3) +
    '" stroke="#4a4336" stroke-width="1.3" fill="none" stroke-linecap="round"/>'
  );
}

const ICON_GLYPHS = {
  // 집
  home: ["green",
    '<path d="M11 24 L24 12.5 L37 24" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect x="15" y="21" width="18" height="15" rx="5" fill="#fff"/>' +
    '<rect x="21" y="27" width="6" height="9" rx="3" fill="#ffd96b"/>' +
    '<path d="M24 13 C24 9 27 7 30 7 C30 10 27 12 24 13Z" fill="#6cbf6a"/>'],

  // 내 방 (소파)
  room: ["yellow",
    '<rect x="11" y="16" width="26" height="13" rx="6.5" fill="#fff"/>' +
    '<rect x="8" y="24" width="32" height="11" rx="5.5" fill="#a6dca6"/>' +
    '<rect x="12" y="34" width="3" height="4" rx="1.5" fill="#8a7a5c"/><rect x="33" y="34" width="3" height="4" rx="1.5" fill="#8a7a5c"/>' +
    iconFace(24, 21)],

  // 새싹톡 (말풍선 + 새싹)
  chat: ["mint",
    '<path d="M13 12 H35 A6 6 0 0 1 41 18 V27 A6 6 0 0 1 35 33 H22 L15 38 L16.5 33 H13 A6 6 0 0 1 7 27 V18 A6 6 0 0 1 13 12Z" fill="#fff"/>' +
    '<path d="M24 29 V21" stroke="#6cbf6a" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M24 23 C19 23 17.5 19.5 18 17 C21.5 17 24 19 24 23Z" fill="#8fd19e"/>' +
    '<path d="M24 21.5 C28.5 21.5 30.5 18.5 30 16 C26.5 16 24 18 24 21.5Z" fill="#ffd96b"/>'],

  // 과자 소통방 (과자봉지)
  lounge: ["peach",
    '<path d="M14 13 L34 13 L36 37 L12 37 Z" fill="#fff"/>' +
    '<path d="M14 13 L16 10 L18 13 L20 10 L22 13 L24 10 L26 13 L28 10 L30 13 L32 10 L34 13" stroke="#fff" stroke-width="2.2" fill="none" stroke-linejoin="round"/>' +
    '<rect x="13.2" y="17" width="21.6" height="4" fill="#ffd96b"/>' +
    '<rect x="12.6" y="31" width="22.8" height="3" fill="#a6dca6"/>' +
    iconFace(24, 25)],

  // 전체 메뉴
  menu: ["lime",
    '<rect x="12" y="12" width="10.5" height="10.5" rx="4" fill="#fff"/>' +
    '<rect x="25.5" y="12" width="10.5" height="10.5" rx="5.25" fill="#ffd96b"/>' +
    '<rect x="12" y="25.5" width="10.5" height="10.5" rx="5.25" fill="#8fd19e"/>' +
    '<rect x="25.5" y="25.5" width="10.5" height="10.5" rx="4" fill="#fff"/>'],

  // 미션 (체크 별)
  mission: ["yellow",
    '<path d="M24 9 L28.2 18 L38 19.2 L30.8 26 L32.8 35.8 L24 31 L15.2 35.8 L17.2 26 L10 19.2 L19.8 18 Z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M19 24 L22.5 27.5 L29 21" stroke="#6cbf6a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'],

  // 성장 타임랩스 (카메라 + 새싹)
  timelapse: ["mint",
    '<rect x="9" y="17" width="23" height="18" rx="6" fill="#fff"/>' +
    '<path d="M32 23 L39 19 V33 L32 29 Z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>' +
    '<circle cx="20.5" cy="26" r="5" fill="#8fd19e"/>' +
    '<path d="M20.5 17 V12" stroke="#6cbf6a" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path d="M20.5 13.5 C16.5 13.5 15.5 10.5 16 8.5 C19 8.5 20.5 10.5 20.5 13.5Z" fill="#ffd96b"/>'],

  // 식집사 자격증 (메달)
  cert: ["yellow",
    '<path d="M17 9 L21 22 L24 19 L27 22 L31 9" fill="#8fd19e"/>' +
    '<circle cx="24" cy="28" r="10" fill="#fff"/>' +
    '<circle cx="24" cy="28" r="6.5" fill="#ffd96b"/>' +
    '<path d="M24 24.5 L25.2 27 L27.8 27.3 L25.9 29.1 L26.4 31.7 L24 30.4 L21.6 31.7 L22.1 29.1 L20.2 27.3 L22.8 27 Z" fill="#fff"/>'],

  // 다이어트 레시피 (그릇)
  recipe: ["green",
    '<path d="M17 20 C15 14 19 10 23 12 C24 8 30 8 31 13 C35 12 37 17 33 20 Z" fill="#c8efc4"/>' +
    '<path d="M18 19 C20 14 25 14 26 18" stroke="#6cbf6a" stroke-width="2" fill="none" stroke-linecap="round"/>' +
    '<path d="M9 20 H39 C39 30 32 37 24 37 C16 37 9 30 9 20Z" fill="#fff"/>' +
    iconFace(24, 26)],

  // 프로필 · MBTI (새싹 얼굴)
  profile: ["peach",
    '<circle cx="24" cy="27" r="11" fill="#fff"/>' +
    '<path d="M24 16 V11" stroke="#6cbf6a" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M24 13 C19 13 17 9.5 17.5 7 C21 7 24 9 24 13Z" fill="#8fd19e"/>' +
    '<path d="M24 12 C28.5 12 30.5 9 30 6.5 C26.5 6.5 24 8.5 24 12Z" fill="#ffd96b"/>' +
    iconFace(24, 26)],

  // 닉네임 바꾸기 (돌아가는 화살표)
  swap: ["lime",
    '<path d="M14 21 A10 10 0 0 1 32 17" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<path d="M33.5 11 L33 18.5 L26 17" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M34 27 A10 10 0 0 1 16 31" stroke="#ffd96b" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<path d="M14.5 37 L15 29.5 L22 31" stroke="#ffd96b" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'],

  // 포인트 코인
  coin: ["yellow",
    '<circle cx="24" cy="24" r="12" fill="#fff"/>' +
    '<circle cx="24" cy="24" r="9" fill="#ffd96b"/>' +
    '<path d="M21 30 V18 H25.5 A3.6 3.6 0 0 1 25.5 25.2 H21" stroke="#fff" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'],

  // 영양제
  nutrient: ["mint",
    '<rect x="13" y="19" width="22" height="11" rx="5.5" fill="#fff" transform="rotate(-35 24 24.5)"/>' +
    '<path d="M24 24.5 L30.3 15.5 A5.5 5.5 0 0 1 35.3 25.6 L29 30" fill="#ffd96b" transform="translate(-2.2 1.8)"/>' +
    '<circle cx="34" cy="34" r="3" fill="#fff"/><circle cx="14" cy="13" r="2" fill="#fff"/>'],
};

// 장바구니
ICON_GLYPHS.cart = ["peach",
  '<path d="M10 15 H14 L17.5 31 H33 L36.5 19 H15.5" stroke="#fff" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="M17 19.5 H35 L32.5 29 H19 Z" fill="#fff"/>' +
  '<circle cx="20" cy="36" r="2.8" fill="#fff"/><circle cx="31" cy="36" r="2.8" fill="#fff"/>' +
  '<path d="M26 19 C26 14 29 12 32 12 C32 15 29.5 17.5 26 19Z" fill="#8fd19e"/>'];

// 내 식물 기록 (사진 + 화분)
ICON_GLYPHS.record = ["mint",
  '<rect x="9" y="12" width="30" height="25" rx="7" fill="#fff"/>' +
  '<path d="M18 31 H30 L28.5 35 H19.5 Z" fill="#ffbf94"/>' +
  '<path d="M24 31 V24" stroke="#6cbf6a" stroke-width="2.2" stroke-linecap="round"/>' +
  '<path d="M24 26 C19.5 26 18 22.5 18.5 20 C22 20 24 22 24 26Z" fill="#8fd19e"/>' +
  '<path d="M24 24.5 C28.5 24.5 30 21.5 29.5 19 C26 19 24 21 24 24.5Z" fill="#ffd96b"/>' +
  '<circle cx="33.5" cy="17" r="2" fill="#ffd96b"/>'];

// 로그아웃 (문 + 나가는 화살표)
ICON_GLYPHS.logout = ["peach",
  '<rect x="11" y="11" width="16" height="26" rx="4" fill="#fff"/>' +
  '<circle cx="22.5" cy="24.5" r="1.6" fill="#ffbf94"/>' +
  '<path d="M25 24 H38 M33 19 L38 24 L33 29" stroke="#fff" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'];

function icon(name, extraClass) {
  const glyph = ICON_GLYPHS[name] || ICON_GLYPHS.menu;
  const bg = ICON_BG[glyph[0]];
  return (
    '<span class="ic' + (extraClass ? " " + extraClass : "") + '">' +
    '<svg viewBox="0 0 48 48" aria-hidden="true">' +
    '<circle cx="24" cy="24" r="23" fill="' + bg[1] + '"/>' +
    '<path d="M3 22 A21 21 0 0 1 45 22 A21 16 0 0 0 3 22Z" fill="' + bg[0] + '" opacity=".75"/>' +
    '<ellipse cx="16" cy="12" rx="7" ry="4" fill="#fff" opacity=".5" transform="rotate(-25 16 12)"/>' +
    glyph[1] +
    "</svg></span>"
  );
}

// ---------------------------------------------------------------------
// 메뉴 그림: 우리 채소·과자 캐릭터로 만든 작은 장면들 (viewBox 100x100)
// ---------------------------------------------------------------------

// 캐릭터 이미지 (정사각 칸 x,y,w 안에 아래쪽 맞춤)
function artImg(id, x, y, w, extra) {
  return (
    '<image href="images/chars/' + id + '.webp" x="' + x + '" y="' + y + '" width="' + w + '" height="' + w +
    '" preserveAspectRatio="xMidYMax meet"' + (extra || "") + "/>"
  );
}

function artBg(color) {
  return '<rect width="100" height="100" rx="24" fill="' + color + '"/>';
}

const MENU_ART = {
  // MBTI 글자 옆에 상추 친구
  profile: () =>
    artBg("#ffe9e3") +
    '<g font-family="Pretendard, sans-serif" font-weight="900" font-size="27" stroke="#fff" stroke-width="3" paint-order="stroke" letter-spacing="-1">' +
    '<text x="7" y="45" fill="#5fae4a">M</text><text x="30" y="45" fill="#ffb93b">B</text>' +
    '<text x="9" y="76" fill="#ff8f6b">T</text><text x="30" y="76" fill="#45c29a">I</text></g>' +
    artImg("cheongSangchu", 44, 26, 56),

  // 성장 과정: 작은 상추 → 조금 큰 상추 → 제일 큰 상추
  record: () =>
    artBg("#e3f5ec") +
    '<rect x="0" y="86" width="100" height="14" fill="#c9a77a"/><path d="M0 86 H100" stroke="#a8845a" stroke-width="2"/>' +
    '<path d="M18 30 Q32 18 46 26 M52 22 Q66 10 80 18" stroke="#8fd19e" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-dasharray="1 5"/>' +
    '<path d="M44 22 L47 27 L41 27Z M78 14 L81 19 L75 19Z" fill="#8fd19e"/>' +
    artImg("cheongSangchu", 2, 66, 22) +
    artImg("cheongSangchu", 22, 54, 34) +
    artImg("cheongSangchu", 50, 38, 50),

  // 식집사 자격증: 신분증 카드
  cert: () =>
    artBg("#fff3c6") +
    '<defs><clipPath id="certPhoto"><rect x="14" y="40" width="28" height="36" rx="5"/></clipPath></defs>' +
    '<rect x="7" y="20" width="86" height="64" rx="9" fill="#fff" stroke="#f0cf6a" stroke-width="2.5"/>' +
    '<path d="M7 29 A9 9 0 0 1 16 20 H84 A9 9 0 0 1 93 29 V33 H7Z" fill="#7cc68a"/>' +
    '<text x="50" y="30.5" text-anchor="middle" font-family="Pretendard, sans-serif" font-weight="900" font-size="8.5" fill="#fff">식집사 자격증</text>' +
    '<rect x="14" y="40" width="28" height="36" rx="5" fill="#e8f6e2"/>' +
    '<g clip-path="url(#certPhoto)">' + artImg("cheongSangchu", 4, 38, 48) + "</g>" +
    '<g font-family="Pretendard, sans-serif" font-weight="800" fill="#3f4a3c">' +
    '<text x="47" y="46" font-size="6.5" fill="#9aa894">이름</text><text x="47" y="54" font-size="8">청상추</text>' +
    '<text x="47" y="63" font-size="6.5" fill="#9aa894">등급</text><text x="47" y="71" font-size="8" fill="#f0a020">★★★</text></g>' +
    '<g stroke="#3f4a3c" stroke-width="1"><path d="M70 66 V77 M72 66 V77 M75 66 V77 M76.5 66 V77 M79 66 V77 M82 66 V77 M83.5 66 V77 M86 66 V77"/></g>',

  // 식물의 방: 집이 되는 화분 뒤에서 상추가 빼꼼
  room: () =>
    artBg("#fff1c9") +
    '<rect x="0" y="72" width="100" height="28" fill="#c8efc4"/>' +
    '<rect x="10" y="12" width="22" height="20" rx="6" fill="#cfe3ff" stroke="#fff" stroke-width="3"/><path d="M21 12 V32 M10 22 H32" stroke="#fff" stroke-width="2"/>' +
    artImg("cheongSangchu", 40, 20, 46, ' transform="rotate(14 63 43)"') +
    '<rect x="16" y="52" width="58" height="10" rx="5" fill="#ffcfaa"/>' +
    '<path d="M20 60 H70 L64 94 H26Z" fill="#ffbf94"/>' +
    '<path d="M38 94 V82 A7 7 0 0 1 52 82 V94Z" fill="#f0a070"/>' +
    '<circle cx="30" cy="72" r="5" fill="#fff6c2" stroke="#f0a070" stroke-width="2"/><circle cx="60" cy="72" r="5" fill="#fff6c2" stroke="#f0a070" stroke-width="2"/>' +
    '<path d="M28 52 C24 40 32 34 38 40 M44 52 C44 40 52 36 56 42" stroke="#6cbf6a" stroke-width="3" fill="none" stroke-linecap="round"/>',

  // 과자 소통방: 말풍선 위에 과자 친구들이 나란히 앉아있어요
  lounge: () =>
    artBg("#e7f6d3") +
    '<path d="M18 46 H82 A12 12 0 0 1 94 58 V76 A12 12 0 0 1 82 88 H36 L22 97 L25 88 H18 A12 12 0 0 1 6 76 V58 A12 12 0 0 1 18 46Z" fill="#fff" stroke="#8fd19e" stroke-width="3"/>' +
    '<g fill="#8fd19e"><circle cx="36" cy="68" r="4.5"/><circle cx="50" cy="68" r="4.5"/><circle cx="64" cy="68" r="4.5"/></g>' +
    artImg("yangparing", 4, 20, 30) +
    artImg("pokachip", 26, 18, 30) +
    artImg("ggotgerang", 48, 18, 30) +
    artImg("bananakick", 70, 20, 28),

  // 새싹톡: 두 팔 활짝 "이리와" (손 흔드는 쪽을 거울처럼 붙여 양팔을 벌린 모습)
  chat: () =>
    artBg("#e0f5ec") +
    '<defs><clipPath id="hugHalf"><rect x="50" y="0" width="50" height="100"/></clipPath></defs>' +
    '<g clip-path="url(#hugHalf)">' + artImg("jeokSangchu", 7.1, 12, 84) + "</g>" +
    '<g transform="matrix(-1 0 0 1 100 0)"><g clip-path="url(#hugHalf)">' + artImg("jeokSangchu", 7.1, 12, 84) + "</g></g>" +
    '<g fill="#ff9c8a"><path d="M14 18 C14 14 19 13 20 17 C21 13 26 14 26 18 C26 22 20 25 20 26 C20 25 14 22 14 18Z"/>' +
    '<path d="M78 12 C78 9.5 81.5 9 82 11.5 C82.5 9 86 9.5 86 12 C86 14.5 82 16.5 82 17 C82 16.5 78 14.5 78 12Z"/></g>',

  // 오늘의 미션: 초록 과녁 + 가운데 상추 친구 + 새싹 다트
  mission: () =>
    artBg("#f2f9ea") +
    '<g fill="none" stroke-linecap="round">' +
    '<circle cx="48" cy="54" r="38" stroke="#6cbf6a" stroke-width="7" stroke-dasharray="3 2.2"/>' +
    '<circle cx="48" cy="54" r="38" stroke="#8fd19e" stroke-width="3"/>' +
    '<circle cx="48" cy="54" r="25" stroke="#5fae4a" stroke-width="7" stroke-dasharray="3 2.2"/>' +
    '<circle cx="48" cy="54" r="25" stroke="#a6dca6" stroke-width="3"/></g>' +
    artImg("cheongSangchu", 31, 36, 34) +
    '<path d="M60 40 L84 14" stroke="#f0a020" stroke-width="3.5" stroke-linecap="round"/>' +
    '<path d="M84 14 C80 6 86 2 92 4 C92 10 88 14 84 14Z" fill="#6cbf6a"/><path d="M84 14 C90 12 96 16 96 22 C90 22 86 18 84 14Z" fill="#8fd19e"/>' +
    '<path d="M60 40 L57 38 L58 43Z" fill="#3f4a3c"/>',

  // 다이어트 레시피: 왼쪽은 옆으로 넓은 상추, 오른쪽은 홀쭉한 상추
  recipe: () =>
    artBg("#fdebd8") +
    '<ellipse cx="50" cy="90" rx="44" ry="5" fill="#f3d3b3"/>' +
    '<g transform="translate(30 0) scale(1.4 1) translate(-30 0)">' + artImg("cheongSangchu", 12, 46, 40) + "</g>" +
    '<g transform="translate(76 0) scale(0.62 1) translate(-76 0)">' + artImg("cheongSangchu", 52, 34, 52) + "</g>",


  // 장바구니: 마트 바구니 안에 상추 친구들이 앉고 눕고, 손잡이에 얼굴을 걸쳐요
  cart: () =>
    artBg("#ffe9d9") +
    '<path d="M20 50 C20 16 80 16 80 50" stroke="#4f9e5f" stroke-width="6" fill="none" stroke-linecap="round"/>' +
    artImg("mint", 34, 4, 30) +
    artImg("cheongSangchu", 14, 30, 34) +
    artImg("jeokSangchu", 58, 26, 30) +
    '<path d="M10 52 H90 L82 94 H18Z" fill="#7cc68a"/>' +
    '<path d="M10 52 H90" stroke="#5fae4a" stroke-width="5" stroke-linecap="round"/>' +
    '<g fill="#5fae4a"><rect x="22" y="62" width="10" height="7" rx="3"/><rect x="38" y="62" width="10" height="7" rx="3"/><rect x="54" y="62" width="10" height="7" rx="3"/><rect x="70" y="62" width="9" height="7" rx="3"/>' +
    '<rect x="24" y="75" width="10" height="7" rx="3"/><rect x="40" y="75" width="10" height="7" rx="3"/><rect x="56" y="75" width="10" height="7" rx="3"/><rect x="70" y="75" width="7" height="7" rx="3"/></g>' +
    '<rect x="40" y="86" width="20" height="4" rx="2" fill="#fff" opacity=".6"/>' +
    artImg("basil", 54, 30, 32, ' transform="rotate(-78 70 46)"'),
};

function charIcon(name) {
  const draw = MENU_ART[name] || MENU_ART.mission;
  return '<span class="menu-art"><svg viewBox="0 0 100 100" aria-hidden="true">' + draw() + "</svg></span>";
}

// data-icon="이름" → 동글 아이콘, data-char-icon="이름" → 캐릭터 메뉴 그림
function fillIcons(root) {
  (root || document).querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = icon(el.getAttribute("data-icon"));
  });
  (root || document).querySelectorAll("[data-char-icon]").forEach((el) => {
    el.innerHTML = charIcon(el.getAttribute("data-char-icon"));
  });
}

document.addEventListener("DOMContentLoaded", () => fillIcons());
