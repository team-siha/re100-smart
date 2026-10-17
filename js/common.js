// 공통 데이터 & 유틸 (localStorage 기반, 백엔드 없이 동작하는 프로토타입)

const BRAND_NAME = "RE:100 스마트";
const MASCOT_NAME = "새싹이";
const MASCOT_EMOJI = "🌱";

const USERS_KEY = "snackfarm_users"; // { 닉네임: profile }
const CURRENT_USER_KEY = "snackfarm_current_user";
const CHAT_KEY_PREFIX = "snackfarm_chat_";
const ROOM_KEY_PREFIX = "snackfarm_myroom_";

// -----------------------------------------------------------------------
// 닉네임 기반 멀티 유저 시스템
// "RE:100 스마트와 함께하기" 온보딩에서 닉네임을 입력하면
// 기존 유저면 저장된 프로필을 그대로 불러오고, 신규면 새로 생성합니다.
// -----------------------------------------------------------------------
function loadUserRegistry() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveUserRegistry(registry) {
  localStorage.setItem(USERS_KEY, JSON.stringify(registry));
}

function getCurrentNickname() {
  return localStorage.getItem(CURRENT_USER_KEY);
}

function setCurrentNickname(nickname) {
  localStorage.setItem(CURRENT_USER_KEY, nickname);
}

function nicknameExists(nickname) {
  const registry = loadUserRegistry();
  return Object.prototype.hasOwnProperty.call(registry, nickname);
}

// 닉네임으로 로그인(혹은 신규가입). 기존 유저면 저장된 정보를 그대로 불러옵니다.
// 신규 유저는 첫 화면에서 입력한 프로필(fields)로 만들어집니다.
function loginWithNickname(nickname, fields) {
  const registry = loadUserRegistry();
  const existed = !!registry[nickname];
  if (!existed) {
    registry[nickname] = Object.assign(
      {
        nickname: nickname,
        name: nickname,
        age: "",
        gender: "",
        moodId: "happy",
        moodIntensity: 60,
        snackName: "",
        plantId: null,
        plantNickname: "",
        points: 0,
        mbtiDone: false,
        createdAt: Date.now(),
      },
      fields || {}
    );
    saveUserRegistry(registry);
  }
  setCurrentNickname(nickname);
  return { isNew: !existed, profile: registry[nickname] };
}

function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// 로그아웃 확인 후 첫 화면으로 (정보는 그대로 저장돼서 같은 이름으로 다시 들어오면 이어져요)
function confirmLogout() {
  showConfirm(
    "지금까지의 정보는 그대로 저장돼요.\n같은 이름으로 다시 들어오면 이어서 할 수 있어요.",
    {
      title: "로그아웃할까요?",
      okText: "로그아웃",
      cancelText: "더 있을래요",
      onOk: () => {
        logoutUser();
        window.location.href = "index.html";
      },
    }
  );
}

// ---------------------------------------------------------------------
// 화면 정가운데 팝업 (브라우저 기본 알림창 대신 우리 디자인으로)
// type: "info"(초록) / "warn"(주황)
// ---------------------------------------------------------------------
function buildDialog(message, opts, buttons) {
  const old = document.getElementById("appDialog");
  if (old) old.remove();
  const type = opts.type || "info";
  const wrap = document.createElement("div");
  wrap.id = "appDialog";
  wrap.className = "app-dialog " + type;
  wrap.setAttribute("role", "alertdialog");
  wrap.setAttribute("aria-modal", "true");
  wrap.innerHTML =
    '<div class="ad-card">' +
    '<div class="ad-char"><img src="images/chars/' + (type === "warn" ? "sleep/cheongSangchu" : "cheongSangchu") + '.webp" alt="" /></div>' +
    '<div class="ad-title"></div><div class="ad-msg"></div><div class="ad-btns"></div></div>';
  wrap.querySelector(".ad-title").textContent = opts.title || (type === "warn" ? "잠깐만요!" : "알려드려요");
  wrap.querySelector(".ad-msg").textContent = message;
  const btnBox = wrap.querySelector(".ad-btns");
  function close() {
    wrap.classList.remove("open");
    document.removeEventListener("keydown", onKey);
    setTimeout(() => wrap.remove(), 200);
  }
  function onKey(e) {
    // Enter 는 포커스된 버튼이 처리해요
    if (e.key === "Escape") btnBox.firstChild.click();
  }
  buttons.forEach((b) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "btn" + (b.ghost ? " ghost" : "");
    el.textContent = b.text;
    el.addEventListener("click", () => {
      close();
      if (b.onClick) b.onClick();
    });
    btnBox.appendChild(el);
  });
  document.body.appendChild(wrap);
  document.addEventListener("keydown", onKey);
  requestAnimationFrame(() => wrap.classList.add("open"));
  btnBox.lastChild.focus();
}

function showAlert(message, opts) {
  opts = opts || {};
  buildDialog(message, opts, [{ text: opts.okText || "확인", onClick: opts.onOk }]);
}

function showConfirm(message, opts) {
  opts = opts || {};
  buildDialog(message, opts, [
    { text: opts.cancelText || "취소", ghost: true, onClick: opts.onCancel },
    { text: opts.okText || "확인", onClick: opts.onOk },
  ]);
}

// ---------------------------------------------------------------------
// 로딩 화면 (나를 살리는 식물 · RE100:SMART)
// 앱을 켰을 때 어느 화면으로 들어와도 한 번 보여줘요
// ---------------------------------------------------------------------
const SPLASH_KEY = "re100_splash_seen";

function splashSeen() {
  try {
    return sessionStorage.getItem(SPLASH_KEY) === "1";
  } catch (e) {
    return false;
  }
}

// onDone 이 false 를 돌려주면 (다른 화면으로 이동하는 경우) 화면을 그대로 둬요
// 글자를 한 글자씩 나눠서 차례로 등장시켜요 (--i = 순서)
function splitLetters(text, start) {
  return text
    .split("")
    .map((ch, i) => '<span class="sl" style="--i:' + (start + i) + '">' + (ch === " " ? "&nbsp;" : ch) + "</span>")
    .join("");
}

const SPLASH_MS = 4500;

// 4.5초: 캐릭터 톡 → "나를 살리는 식물" 한 글자씩 → RE100:SMART 가 오른쪽에서 천천히 쓰윽 (3.4초쯤 도착) → 사라짐
// onDone 이 false 를 돌려주면 (다른 화면으로 이동하는 경우) 화면을 그대로 둬요
function renderSplash(onDone) {
  const el = document.createElement("div");
  el.className = "splash";
  el.innerHTML =
    '<div class="splash-logo">' +
    '<span class="splash-mark"><img src="images/chars/cheongSangchu.webp" alt="" /></span>' +
    '<span class="splash-text"><span class="splash-tag">' + splitLetters("나를 살리는 식물", 0) + "</span>" +
    '<span class="splash-word"><span class="sw-re">' + splitLetters("RE100:", 0) + "</span>" +
    '<span class="sw-smart">' + splitLetters("SMART", 6) + "</span></span></span>" +
    "</div>";
  document.body.appendChild(el);
  try {
    sessionStorage.setItem(SPLASH_KEY, "1");
  } catch (e) {}

  let finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    if (onDone && onDone() === false) return;
    el.classList.add("hide");
    setTimeout(() => el.remove(), 600);
  }
  setTimeout(finish, SPLASH_MS - 600);
}

// ---------------------------------------------------------------------
// 고운 말 필터 - 욕이 들어있으면 입력하지 않은 것으로 처리해요
// ---------------------------------------------------------------------
const BAD_WORDS = ["바보", "멍청이", "개새끼", "시발", "병신", "병식", "꺼져", "장애인", "좆"];

function containsBadWord(text) {
  const compact = String(text || "").replace(/[\s.\-_~!?·,]/g, "");
  return BAD_WORDS.some((w) => compact.includes(w));
}

// 욕이 있으면 안내하고 false (입력 안 한 것으로 처리)
function checkKindWords(...texts) {
  if (texts.some(containsBadWord)) {
    showAlert("나쁜 말이 들어있어서 입력되지 않았어요.\n식물 친구들이 상처받지 않게 예쁜 말로 다시 써주세요 🌱", {
      type: "warn",
      title: "고운 말을 써주세요",
    });
    return false;
  }
  return true;
}

// 내 식물 부르는 이름 (예: 씩씩이) - 없으면 작물 이름
function getPlantCallName(profile) {
  if (!profile) return "식물";
  if (profile.plantNickname) return profile.plantNickname;
  return profile.plantId && PLANTS[profile.plantId] ? PLANTS[profile.plantId].name : "식물";
}

// 프로필 한 줄: 박시하/18세/여/포스틱/민트(씩씩이)
function formatProfileLine(p) {
  if (!p) return "";
  const plant = p.plantId && PLANTS[p.plantId] ? PLANTS[p.plantId].name : "";
  return [
    p.name || p.nickname,
    p.age ? p.age + "세" : "",
    p.gender || "",
    p.snackName || "",
    plant ? plant + (p.plantNickname ? "(" + p.plantNickname + ")" : "") : "",
  ]
    .filter(Boolean)
    .join("/");
}

// 소통방·새싹톡에 등장하는 또래 친구들 (프로토타입용 가상 유저)
const VIRTUAL_FRIENDS = {
  haneul: { name: "김하늘", age: 18, gender: "여", snackName: "양파링", plantId: "basil", plantNickname: "바질라", moodId: "happy" },
  doyun: { name: "이도윤", age: 17, gender: "남", snackName: "포카칩", plantId: "cheongSangchu", plantNickname: "상추왕", moodId: "calm" },
  seoyeon: { name: "최서연", age: 18, gender: "여", snackName: "꽃게랑", plantId: "jeokSangchu", plantNickname: "빨강이", moodId: "lonely" },
  minjun: { name: "정민준", age: 19, gender: "남", snackName: "포스틱", plantId: "romaine", plantNickname: "롬롬이", moodId: "tired" },
  jiwoo: { name: "한지우", age: 18, gender: "여", snackName: "허니버터칩", plantId: "cheonggyeongchae", plantNickname: "청이", moodId: "happy" },
  seojun: { name: "윤서준", age: 17, gender: "남", snackName: "감자깡", plantId: "mint", plantNickname: "민초", moodId: "calm" },
  yerin: { name: "강예린", age: 18, gender: "여", snackName: "자갈치", plantId: "cheongSangchu", plantNickname: "쌈쌈이", moodId: "sad" },
  hajun: { name: "오하준", age: 18, gender: "남", snackName: "바나나킥", plantId: "basil", plantNickname: "향기", moodId: "happy" },
  jia: { name: "서지아", age: 17, gender: "여", snackName: "콘초", plantId: "mint", plantNickname: "박하", moodId: "tired" },
};

// 6종 식물 데이터 (MBTI 식집사 테스트 결과 및 레시피 공용)
const PLANTS = {
  cheongSangchu: {
    id: "cheongSangchu",
    name: "청상추",
    emoji: "🥬",
    type: "무한긍정 쑥쑥형",
    desc: "쑥쑥 잘 자라는 강인한 생명력의 소유자. 초보 식집사에게 추천!",
    recipeTitle: "청상추 두부쌈 다이어트 플레이트",
    recipe: [
      "청상추를 깨끗이 씻어 물기를 뺀다.",
      "두부를 도톰하게 썰어 에어프라이어에 노릇하게 굽는다.",
      "현미밥 한 줌을 청상추에 올리고 구운 두부를 얹는다.",
      "쌈장 대신 저염 간장+참기름 소스를 살짝 곁들여 쌈처럼 싸먹는다.",
    ],
  },
  jeokSangchu: {
    id: "jeokSangchu",
    name: "적상추",
    emoji: "🍇",
    type: "힙스터 감성 인싸형",
    desc: "안토시아닌이 풍부한 보라빛 매력. 손이 좀 덜 가는 편.",
    recipeTitle: "적상추 닭가슴살 샐러드랩",
    recipe: [
      "적상추를 큼직하게 찢어 그릇에 담는다.",
      "데친 닭가슴살을 결대로 찢는다.",
      "방울토마토, 오이를 잘게 썰어 함께 섞는다.",
      "발사믹 식초+올리브오일 드레싱을 뿌려 랩처럼 돌돌 말아 먹는다.",
    ],
  },
  romaine: {
    id: "romaine",
    name: "로메인",
    emoji: "🥗",
    type: "갓생 루틴 샐러드형",
    desc: "아삭한 식감의 샐러드 단골손님. 적당한 손길만 있으면 쭉쭉 자람.",
    recipeTitle: "로메인 그릭요거트 시저샐러드",
    recipe: [
      "로메인을 한 입 크기로 썬다.",
      "그릭요거트+레몬즙+마늘가루로 저칼로리 시저 드레싱을 만든다.",
      "삶은 달걀과 구운 아몬드를 토핑으로 올린다.",
      "드레싱을 버무려 가볍게 즐긴다.",
    ],
  },
  cheonggyeongchae: {
    id: "cheonggyeongchae",
    name: "청경채",
    emoji: "🥦",
    type: "정 많은 대모형",
    desc: "손이 많이 가지만 그만큼 애정이 쌓이는 '대모' 타입 식물.",
    recipeTitle: "청경채 두부 들기름 무침",
    recipe: [
      "청경채를 끓는 물에 살짝 데친다.",
      "찬물에 헹궈 물기를 꼭 짠다.",
      "으깬 두부, 들기름, 소금 약간을 넣고 조물조물 무친다.",
      "통깨를 뿌려 마무리한다.",
    ],
  },
  basil: {
    id: "basil",
    name: "바질",
    emoji: "🌿",
    type: "향기로운 감성 힐러형",
    desc: "향긋한 힐링 식물. 보기만 해도 마음이 편안해지는 아로마 플랜트.",
    recipeTitle: "바질 닭가슴살 카프레제",
    recipe: [
      "방울토마토를 반으로 자른다.",
      "모짜렐라 치즈(저지방)를 한 입 크기로 썬다.",
      "바질 잎을 올리고 올리브오일+발사믹을 살짝 뿌린다.",
      "구운 닭가슴살을 곁들여 단백질을 보충한다.",
    ],
  },
  mint: {
    id: "mint",
    name: "민트",
    emoji: "🍃",
    type: "쿨한 독립 자취러형",
    desc: "은은한 향으로 스트레스를 날려주는 힐링계의 끝판왕.",
    recipeTitle: "민트 오이 요거트 냉스프",
    recipe: [
      "오이를 강판에 갈거나 잘게 다진다.",
      "그릭요거트와 오이를 섞는다.",
      "민트 잎을 잘게 다져 넣고 레몬즙, 소금 약간을 더한다.",
      "차갑게 식혀 수프처럼 떠먹는다.",
    ],
  },
};

// ---------------------------------------------------------------------
// 내 식물 기록 - 작물별 수확 주기 (샐러드용 / 완전체 성장)
// ---------------------------------------------------------------------
const GROWTH_PLANS = {
  cheonggyeongchae: {
    range: "약 6~7주", note: "제일 빨라요! 어린잎은 4주",
    salad: { weeks: 4, label: "어린잎 샐러드용", desc: "4주면 연한 어린잎을 따 먹을 수 있어요" },
    full: { weeks: 7, label: "완전체 성장", desc: "6~7주 동안 통통한 포기로 키워요" },
  },
  cheongSangchu: {
    range: "약 6~8주", note: "겉잎부터 따면 계속 수확 가능",
    salad: { weeks: 6, label: "겉잎 샐러드용", desc: "6주부터 겉잎을 하나씩 따 먹어요" },
    full: { weeks: 8, label: "완전체 성장", desc: "8주 동안 풍성하게 키워요" },
  },
  jeokSangchu: {
    range: "약 7~8주", note: "청상추보다 살짝 느려요",
    salad: { weeks: 7, label: "겉잎 샐러드용", desc: "7주부터 보랏빛 겉잎을 따 먹어요" },
    full: { weeks: 8, label: "완전체 성장", desc: "8주 동안 풍성하게 키워요" },
  },
  romaine: {
    range: "약 8~10주", note: "포기째 키우면 오래 걸려요",
    salad: { weeks: 8, label: "잎 샐러드용", desc: "8주부터 잎을 따서 샐러드로!" },
    full: { weeks: 10, label: "포기째 완전체", desc: "10주 동안 길쭉한 포기로 키워요" },
  },
  basil: {
    range: "약 8~10주", note: "따뜻해야 잘 커요",
    salad: { weeks: 8, label: "잎 따먹기용", desc: "8주부터 향긋한 잎을 따요" },
    full: { weeks: 10, label: "완전체 성장", desc: "10주 동안 풍성한 바질 나무로!" },
  },
  mint: {
    range: "약 10~12주", note: "씨앗은 느려요, 삽목하면 4~6주",
    salad: { weeks: 6, label: "삽목 · 잎 따먹기용", desc: "삽목으로 6주면 잎을 딸 수 있어요" },
    full: { weeks: 12, label: "씨앗부터 완전체", desc: "12주 동안 씨앗부터 천천히 키워요" },
  },
};

// ---------------------------------------------------------------------
// 내 식물 기록 - 주차별 잎 색 기준표 (1~2 / 3~4 / 5~6 / 7~8 / 9~10 / 11~12주)
// colors: 사진에서 "식물"로 인정하는 색 (lime 연두 · green 초록 · red 적갈/자주 · yellow 연노랑)
// minRatio: 사진에서 그 색이 차지해야 하는 최소 비율 (어릴수록 잎이 작아서 기준을 낮춰요)
// ---------------------------------------------------------------------
const GROWTH_LOOKS = {
  romaine: ["연두색 떡잎", "밝은 연두 본잎", "초록, 잎이 길쭉해짐", "겉잎 진초록, 속잎 연두", "진초록 + 속은 연노랑빛 (수확)", ""],
  cheonggyeongchae: ["연두색 떡잎", "연두 잎, 줄기 연한 초록", "초록 잎, 줄기 연둣빛 흰색", "진초록 잎 + 통통한 연두 줄기 (수확)", "", ""],
  basil: ["연두색 둥근 떡잎", "밝은 초록 본잎", "선명한 초록, 윤기", "진하고 윤기 나는 초록", "진초록 (수확)", ""],
  mint: ["아주 작은 연두 떡잎", "연두~초록, 아직 작음", "초록, 잎 주름 생김", "선명한 초록", "진초록, 줄기 살짝 보랏빛 가능", "진초록 (수확)"],
  cheongSangchu: ["연두색 떡잎", "밝은 연두 본잎", "연두~초록, 잎 가장자리 주름", "밝은 초록 (수확)", "", ""],
  jeokSangchu: ["연두 떡잎 (줄기 살짝 붉음)", "잎 끝부터 붉은빛 시작", "가장자리 적갈색, 안쪽 초록", "진한 적갈색~자주색, 밑동 초록 (수확)", "", ""],
};
const GROWTH_STAGE_LABELS = ["1~2주", "3~4주", "5~6주", "7~8주", "9~10주", "11~12주"];
const GROWTH_MIN_RATIO = [0.06, 0.1, 0.15, 0.18, 0.18, 0.18];

// 이번 주차의 기준 (주차가 표를 넘으면 마지막 칸을 써요)
function getGrowthLook(plantId, week) {
  const looks = GROWTH_LOOKS[plantId] || GROWTH_LOOKS.basil;
  let stage = Math.min(Math.floor((week - 1) / 2), 5);
  while (stage > 0 && !looks[stage]) stage--;
  const colors = ["lime", "green"];
  if (plantId === "jeokSangchu" || (plantId === "mint" && stage >= 4)) colors.push("red");
  if (plantId === "romaine" && stage >= 4) colors.push("yellow");
  return { stage, label: GROWTH_STAGE_LABELS[stage], text: looks[stage], colors, minRatio: GROWTH_MIN_RATIO[stage] };
}

const MOODS = [
  { id: "happy", label: "행복", emoji: "😊", color: "#ffb74d" },
  { id: "calm", label: "평온", emoji: "🙂", color: "#4caf50" },
  { id: "tired", label: "지침", emoji: "😩", color: "#9575cd" },
  { id: "lonely", label: "외로움", emoji: "🥺", color: "#5c9ce6" },
  { id: "sad", label: "우울", emoji: "😢", color: "#607d8b" },
];

// 현재 로그인한 닉네임의 프로필을 불러옵니다. 닉네임이 없으면 null.
function loadProfile() {
  const nickname = getCurrentNickname();
  if (!nickname) return null;
  const registry = loadUserRegistry();
  return registry[nickname] || null;
}

function saveProfile(profile) {
  const nickname = getCurrentNickname();
  if (!nickname) return;
  const registry = loadUserRegistry();
  registry[nickname] = profile;
  saveUserRegistry(registry);
}

function loadChat() {
  const nickname = getCurrentNickname() || "guest";
  try {
    const raw = localStorage.getItem(CHAT_KEY_PREFIX + nickname);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveChat(messages) {
  const nickname = getCurrentNickname() || "guest";
  localStorage.setItem(CHAT_KEY_PREFIX + nickname, JSON.stringify(messages));
}

// 닉네임 로그인이 안 된 상태로 내부 페이지에 접근하면 온보딩으로 돌려보냅니다.
function requireLogin() {
  if (!getCurrentNickname()) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// 프로필(MBTI 포함)을 아직 끝내지 않은 유저만 프로필 화면으로 보냅니다.
// 이미 끝낸 유저는 다시 입력할 필요가 없어요.
function requireProfile() {
  if (!requireLogin()) return false;
  const profile = loadProfile();
  if (!profile || !profile.mbtiDone) {
    window.location.href = "profile.html";
    return false;
  }
  return true;
}

// 함께한 날짜 (가입일 기준 1일째부터)
function getDaysTogether(profile) {
  if (!profile.createdAt) {
    profile.createdAt = Date.now();
    saveProfile(profile);
  }
  const start = new Date(profile.createdAt);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today - start) / 86400000) + 1;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------------------------------------
// 포인트 시스템 공통 유틸
// ---------------------------------------------------------------------
function addPoints(amount) {
  const profile = loadProfile();
  if (!profile) return null;
  profile.points = (profile.points || 0) + amount;
  saveProfile(profile);
  return profile.points;
}

function spendPoints(amount) {
  const profile = loadProfile();
  if (!profile) return false;
  if ((profile.points || 0) < amount) return false;
  profile.points -= amount;
  saveProfile(profile);
  return true;
}


// ---------------------------------------------------------------------
// ③ 식집사 자격증 퀴즈용 식물별 정답 데이터 (프로토타입용 간이 설정값)
// 문항: 물을 좋아함 / 햇빛을 좋아함 / 좋은 향기가 남 / 유럽종임 / 빨간색임
// ---------------------------------------------------------------------
const PLANT_FACTS = {
  cheongSangchu: { water: true, sun: true, scent: false, european: false, red: false },
  jeokSangchu: { water: true, sun: true, scent: false, european: false, red: true },
  romaine: { water: true, sun: true, scent: false, european: true, red: false },
  cheonggyeongchae: { water: true, sun: true, scent: false, european: false, red: false },
  basil: { water: true, sun: true, scent: true, european: true, red: false },
  mint: { water: true, sun: false, scent: true, european: true, red: false },
};

const QUIZ_QUESTIONS = [
  { key: "water", text: "Q. 내 식물은 물을 좋아하나요?" },
  { key: "sun", text: "Q. 내 식물은 햇빛을 좋아하나요?" },
  { key: "scent", text: "Q. 내 식물에게서 좋은 향기가 나나요?" },
  { key: "european", text: "Q. 내 식물은 유럽종인가요?" },
  { key: "red", text: "Q. 내 식물은 빨간색인가요?" },
];

// 8문제 기준 포인트
function scoreToPoints(correctCount) {
  if (correctCount >= 8) return 100;
  if (correctCount >= 6) return 80;
  if (correctCount >= 3) return 40;
  if (correctCount >= 1) return 10;
  return 0;
}

// 식집사 자격증 등급 - 귀엽고 웃긴 MZ 밈 칭호
function scoreToGrade(correctCount) {
  if (correctCount >= 8) {
    return { title: "찐 식집사 인정 🏆", grade: "레전드 그린썸 등급", emoji: "👑" };
  }
  if (correctCount >= 6) {
    return { title: "식집사 가능성 보임 ✨", grade: "새싹 매니저 등급", emoji: "🌿" };
  }
  if (correctCount >= 3) {
    return { title: "아직 랜선 집사 ㅋㅋ", grade: "물주기 연습생 등급", emoji: "💧" };
  }
  return { title: "식물 반모 거부당함 😭", grade: "존버 필요 등급", emoji: "🪴" };
}

// ---------------------------------------------------------------------
// ④ 식물의 방 - 화분이 집, 흙이 이불, 잎이 지붕!
// room: 방에 놓이는 꾸미기 아이템 (포인트로 바로 구매)
// goods: 실물 배송 아이템 (장바구니에 담기 - 구매는 준비중)
// ---------------------------------------------------------------------
const ROOM_ITEMS = [
  { id: "leaf_roof", kind: "room", name: "잎사귀 대지붕", cost: 500, desc: "지붕 잎이 풍성해지고 꽃이 피어요" },
  { id: "flower_blanket", kind: "room", name: "꽃무늬 흙이불", cost: 600, desc: "포근한 흙이불에 꽃 자수를 놓아요" },
  { id: "firefly_lamp", kind: "room", name: "반딧불 무드등", cost: 700, desc: "잎 지붕에 반짝반짝 불빛이 켜져요" },
  { id: "dew_mobile", kind: "room", name: "이슬방울 모빌", cost: 800, desc: "자는 동안 촉촉한 이슬을 내려줘요" },
  { id: "butterfly", kind: "room", name: "나비 친구", cost: 900, desc: "식물 곁을 팔랑팔랑 지켜줘요" },
  { id: "ceramic_pot", kind: "room", name: "도자기 화분집", cost: 1000, desc: "화분집을 반짝이는 민트 도자기로!" },
  { id: "real_nutrient", kind: "goods", name: "식물 영양제 (실물)", cost: 1200, desc: "진짜 영양제를 집으로 보내드려요" },
  { id: "real_seedkit", kind: "goods", name: "새 모종 · 씨앗 키트 (실물)", cost: 1500, desc: "다음 작물 씨앗과 흙을 보내드려요" },
];

function loadMyRoom() {
  const nickname = getCurrentNickname() || "guest";
  try {
    const raw = localStorage.getItem(ROOM_KEY_PREFIX + nickname);
    const room = raw ? JSON.parse(raw) : {};
    room.owned = room.owned || [];
    room.answers = room.answers || {};
    return room;
  } catch (e) {
    return { owned: [], answers: {} };
  }
}

function saveMyRoom(room) {
  const nickname = getCurrentNickname() || "guest";
  localStorage.setItem(ROOM_KEY_PREFIX + nickname, JSON.stringify(room));
}

// ---------------------------------------------------------------------
// 장바구니 (오른쪽 위) - 구매는 아직 준비중!
// ---------------------------------------------------------------------
const CART_KEY_PREFIX = "snackfarm_cart_";

function loadCart() {
  const nickname = getCurrentNickname() || "guest";
  try {
    return JSON.parse(localStorage.getItem(CART_KEY_PREFIX + nickname) || "[]");
  } catch (e) {
    return [];
  }
}

function saveCart(items) {
  const nickname = getCurrentNickname() || "guest";
  localStorage.setItem(CART_KEY_PREFIX + nickname, JSON.stringify(items));
}

// item: { id, name, cost, img? }
function addToCart(item) {
  const cart = loadCart();
  cart.push(Object.assign({ key: Date.now() + "_" + Math.random().toString(36).slice(2, 6), at: Date.now() }, item));
  saveCart(cart);
  if (typeof updateCartBadge === "function") updateCartBadge();
}

// ---------------------------------------------------------------------
// 내 식물 기록 (주차별 사진)
// ---------------------------------------------------------------------
const RECORD_KEY_PREFIX = "snackfarm_record_";

function loadRecord() {
  const nickname = getCurrentNickname() || "guest";
  try {
    return JSON.parse(localStorage.getItem(RECORD_KEY_PREFIX + nickname) || "null");
  } catch (e) {
    return null;
  }
}

function saveRecord(record) {
  const nickname = getCurrentNickname() || "guest";
  localStorage.setItem(RECORD_KEY_PREFIX + nickname, JSON.stringify(record));
}

// ---------------------------------------------------------------------
// ⑥ 과자 소통방 (사용자 생성 가능) - 봉지 과자만!
// ---------------------------------------------------------------------
const LOUNGE_KEY = "snackfarm_lounge_rooms";
const LOUNGE_MSG_PREFIX = "snackfarm_lounge2_msg_";

// 과자 캐릭터 (images/chars/*.webp)
const SNACK_CHARS = {
  ggotgerang: { name: "꽃게랑", color: "#ffd9c7" },
  pokachip: { name: "포카칩", color: "#d6e8ff" },
  postick: { name: "포스틱", color: "#dcdcff" },
  yangparing: { name: "양파링", color: "#dff3c8" },
  honeybutter: { name: "허니버터칩", color: "#fff1b8" },
  jagalchi: { name: "자갈치", color: "#ffd6df" },
  gamjakkang: { name: "감자깡", color: "#ffe2bf" },
  concho: { name: "콘초", color: "#eedccf" },
  bananakick: { name: "바나나킥", color: "#fff4b3" },
};

// 미리 만들어둔 기본 방 - 방마다 과자 하나가 테마예요
const DEFAULT_LOUNGE_ROOMS = [
  {
    id: "ggotgerang", name: "꽃게랑 방", charId: "ggotgerang", members: 12, builtin: true,
    seed: [
      { user: "seoyeon", text: "꽃게랑 방에 온 걸 환영해 🦀 오늘 다들 물 줬어?" },
      { user: "doyun", text: "나 방금 상추왕 새 잎 났어!! 자랑하러 옴 ㅎㅎ" },
    ],
  },
  {
    id: "pokachip", name: "포카칩 방", charId: "pokachip", members: 8, builtin: true,
    seed: [
      { user: "doyun", text: "포카칩 봉지로 화분 만든 사람 손~ 🙋" },
      { user: "haneul", text: "저요! 은박이라 그런지 흙이 촉촉하게 오래 가요" },
      { user: "jiwoo", text: "오늘 혼밥했는데 여기 오니까 덜 외롭다 💛" },
    ],
  },
  {
    id: "postick", name: "포스틱 방", charId: "postick", members: 5, builtin: true,
    seed: [{ user: "minjun", text: "포스틱 방 오픈! 길쭉한 봉지엔 로메인이 찰떡이래요 🥬" }],
  },
  {
    id: "yangparing", name: "양파링 방", charId: "yangparing", members: 15, builtin: true,
    seed: [
      { user: "haneul", text: "양파링 방 친구들 안녕 🧅 오늘 기분 어땠어?" },
      { user: "hajun", text: "학교 끝나고 바질 냄새 맡으니까 힐링됨 ㅠㅠ" },
    ],
  },
  {
    id: "honeybutter", name: "허니버터칩 방", charId: "honeybutter", members: 9, builtin: true,
    seed: [
      { user: "jiwoo", text: "허니버터칩 봉지 반짝반짝해서 화분으로 쓰니까 예뻐요 ✨" },
      { user: "seoyeon", text: "인정ㅋㅋ 빨강이랑 같이 사진 찍었어요" },
    ],
  },
  {
    id: "jagalchi", name: "자갈치 방", charId: "jagalchi", members: 7, builtin: true,
    seed: [
      { user: "yerin", text: "자갈치 방이에요 🐙 쌈쌈이 겉잎 처음 땄어요!!" },
      { user: "doyun", text: "오 축하해요! 첫 수확 쌈 싸먹었어요?" },
    ],
  },
  {
    id: "gamjakkang", name: "감자깡 방", charId: "gamjakkang", members: 11, builtin: true,
    seed: [
      { user: "seojun", text: "감자깡 봉지 생각보다 튼튼해요 🥔 민초 잘 크는 중" },
      { user: "minjun", text: "민트는 삽목하면 진짜 빨리 큰대요!" },
    ],
  },
  {
    id: "concho", name: "콘초 방", charId: "concho", members: 6, builtin: true,
    seed: [{ user: "jia", text: "콘초 방 놀러 오세요 🍫 오늘 좀 피곤해서 위로가 필요해요…" }],
  },
  {
    id: "bananakick", name: "바나나킥 방", charId: "bananakick", members: 10, builtin: true,
    seed: [
      { user: "hajun", text: "바나나킥 방 오픈 🍌 노란 봉지에 바질 심었어요" },
      { user: "haneul", text: "노랑+초록 조합 너무 귀엽다ㅠㅠ" },
    ],
  },
];

// 기본 방은 항상 최신 목록을 쓰고, 유저가 만든 방만 저장소에서 불러옵니다.
function loadLoungeRooms() {
  let custom = [];
  try {
    const raw = localStorage.getItem(LOUNGE_KEY);
    if (raw) custom = JSON.parse(raw).filter((r) => !r.builtin && SNACK_CHARS[r.charId]);
  } catch (e) {
    custom = [];
  }
  return DEFAULT_LOUNGE_ROOMS.concat(custom);
}

function saveLoungeRooms(rooms) {
  localStorage.setItem(LOUNGE_KEY, JSON.stringify(rooms.filter((r) => !r.builtin)));
}

// 처음 들어가는 기본 방에는 또래 친구들이 남긴 인사말이 미리 들어있어요.
function loadLoungeMessages(roomId) {
  try {
    const raw = localStorage.getItem(LOUNGE_MSG_PREFIX + roomId);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    return [];
  }
  const room = DEFAULT_LOUNGE_ROOMS.find((r) => r.id === roomId);
  if (!room) return [];
  const base = Date.now() - room.seed.length * 7 * 60000;
  return room.seed.map((s, i) => ({ me: false, user: s.user, text: s.text, at: base + i * 7 * 60000 }));
}

function saveLoungeMessages(roomId, messages) {
  localStorage.setItem(LOUNGE_MSG_PREFIX + roomId, JSON.stringify(messages));
}

function getLoungeReadCount(roomId) {
  const nickname = getCurrentNickname() || "guest";
  return parseInt(localStorage.getItem("snackfarm_lounge2_read_" + nickname + "_" + roomId) || "0", 10);
}

function setLoungeReadCount(roomId, count) {
  const nickname = getCurrentNickname() || "guest";
  localStorage.setItem("snackfarm_lounge2_read_" + nickname + "_" + roomId, String(count));
}

// 카톡처럼 "오전 7:44" / "어제" 형식으로 시간 표시
function formatChatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    return (h < 12 ? "오전 " : "오후 ") + (h % 12 === 0 ? 12 : h % 12) + ":" + m;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "어제";
  return d.getMonth() + 1 + "월 " + d.getDate() + "일";
}

// ---------------------------------------------------------------------
// 홈 화면 하단 공지 캐러셀 데이터
// ---------------------------------------------------------------------
// href: 누르면 바로 가는 화면
const HOME_NOTICES = [
  { title: "🌱 포대 농업 시작하기", desc: "과자봉지를 리싸이클해서 나만의 미니 스마트팜을 만들어보세요.", href: "myroom.html", cta: "식물의 방 가기" },
  { title: "📸 내 식물 기록 챌린지", desc: "매주 화분 사진을 한 번도 빠짐없이 올리면 300P를 드려요!", href: "growth.html", cta: "기록하러 가기" },
  { title: "🎓 식집사 자격증 응시", desc: "8문제로 내 식물을 얼마나 아는지 테스트하고 포인트를 받아보세요.", href: "certificate.html", cta: "시험 보러 가기" },
  { title: "🍘 과자 소통방 오픈", desc: "자갈치 · 감자깡 · 콘초 · 바나나킥 방이 새로 열렸어요.", href: "lounge.html", cta: "소통방 가기" },
];

// 첫 화면(index)이 아닌 곳으로 바로 들어와도 앱을 켤 때 한 번은 로딩 화면을 보여줘요
if (!splashSeen() && !document.querySelector(".onboard-wrap")) renderSplash();
// ---------------------------------------------------------------------
// 빠른 화면 이동
// 1) 서비스 워커: 한 번 받은 파일을 휴대폰에 저장 (https 배포 주소에서만)
// 2) 미리 불러오기: 아래 탭·메뉴 링크를 미리 받아두고, 누르는 순간 바로 열어요
// ---------------------------------------------------------------------
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

(function speedUpNavigation() {
  // 크롬(안드로이드): 화면에 있는 링크를 미리 받고, 손가락을 대면 미리 그려둬요
  if (HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")) {
    const rules = document.createElement("script");
    rules.type = "speculationrules";
    rules.textContent = JSON.stringify({
      prefetch: [{ where: { href_matches: "/*" }, eagerness: "eager" }],
      prerender: [{ where: { href_matches: "/*" }, eagerness: "moderate" }],
    });
    document.head.appendChild(rules);
    return;
  }
  // 그 밖의 브라우저: 링크에 손가락이 닿는 순간 미리 받아요
  const done = new Set();
  function warm(e) {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.origin !== location.origin || done.has(a.href)) return;
    done.add(a.href);
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = a.href;
    document.head.appendChild(link);
  }
  document.addEventListener("touchstart", warm, { passive: true });
  document.addEventListener("mouseover", warm, { passive: true });
})();