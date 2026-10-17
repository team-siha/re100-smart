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

// data-icon="이름" 이 붙은 요소에 아이콘을 채워 넣습니다.
function fillIcons(root) {
  (root || document).querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = icon(el.getAttribute("data-icon"));
  });
}

document.addEventListener("DOMContentLoaded", () => fillIcons());
