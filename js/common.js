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
    "지금까지의 정보는 이 폰에 그대로 저장돼요.\n이 폰에서 같은 이름으로 다시 들어오면 이어서 할 수 있어요.\n(다른 폰에서는 이어지지 않아요)",
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

const SPLASH_MS = 3000;

// 3초: 캐릭터 톡 → "나를 살리는 식물" 한 글자씩 → RE100:SMART 가 오른쪽에서 쓰윽 (2.1초쯤 도착) → 사라짐
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
  // 글씨체가 다 준비될 때까지 멈춰 있다가 시작해요 (도중에 글씨체가 바뀌며 덜컥거리지 않게)
  el.classList.add("wait");
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
    window.dispatchEvent(new Event("splashdone"));
  }
  let started = false;
  function start() {
    if (started) return;
    started = true;
    el.classList.remove("wait");
    setTimeout(finish, SPLASH_MS - 600);
  }
  const fontsReady = document.fonts
    ? Promise.all([document.fonts.load('900 38px "Pretendard"'), document.fonts.load('800 20px "Pretendard"')])
    : Promise.resolve();
  fontsReady.then(start, start);
  setTimeout(start, 400);
}

// ---------------------------------------------------------------------
// 고운 말 필터 - 욕이 들어있으면 입력하지 않은 것으로 처리해요
// ---------------------------------------------------------------------
// 새싹톡·소통방·내 방·닉네임 등 모든 입력칸이 이 목록 하나를 같이 써요
const BAD_WORDS = [
  // 시발 계열
  "시발", "씨발", "시바", "씨바", "씨빨", "씨팔", "시팔", "쉬발", "쉬바", "시벌", "씨벌", "썅", "쌍년", "쌍놈",
  "시발론", "시발새끼", "시발년", "시발놈", "씹새", "씹년", "씹놈", "씹할", "십새", "십팔", "18놈",
  // 개새끼 계열
  "개새끼", "개새", "개색", "개섀", "개세끼", "개쌔", "개쉐", "개년", "개놈", "개소리", "개같은",
  // 병신 계열
  "병신", "병식", "븅신", "빙신", "병쉰", "등신",
  // 그 밖의 욕
  "좆", "좃", "존나", "졸라", "지랄", "미친놈", "미친년", "미친새끼", "미친것", "꺼져", "닥쳐", "엿먹어",
  "뒈져", "니미", "니애미", "느금", "애미", "호로", "후레", "찐따", "바보", "멍청이", "틀딱", "맘충", "급식충",
  // 초성 욕
  "ㅄ", "ㅂㅅ", "ㅅㅂ", "ㅆㅂ", "ㅆㅃ", "ㅅㅄㄲ", "ㅅㅂㄹ", "ㅅㅂㄴ", "ㅅㅂㄲ", "ㄳㄲ", "ㄱㅅㄲ", "ㄲㅈ", "ㅈㄲ",
  "ㅈㄴ", "ㅈㄹ", "ㅁㅊ", "ㄷㅊ", "ㄴㄱㅁ", "ㅂㅅㅅㄲ",
  // 영어 · 영타
  "fuck", "shit", "bitch", "sibal", "ssibal", "tlqkf", "qudtls", "rotoRl",
];
// 욕이 아닌데 욕 글자가 들어있는 말 (먼저 지우고 검사해요)
const KIND_WORDS = [
  "시발점", "시발역", "시바견", "애미야", "호로록", "후레쉬", "후레시", "후레이크", "졸라매", "등신대", "십팔번",
];

function containsBadWord(text) {
  let compact = String(text || "").toLowerCase().replace(/[\s.\-_~!?·,*^@#'"()\[\]]/g, "");
  KIND_WORDS.forEach((w) => (compact = compact.split(w).join("")));
  const noDigits = compact.replace(/[0-9]/g, ""); // "시1발"처럼 숫자를 끼워 넣어도 막아요
  return BAD_WORDS.some((w) => {
    const word = w.toLowerCase();
    return compact.includes(word) || noDigits.includes(word);
  });
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

// ---------------------------------------------------------------------
// 위기 신호 - 새싹톡·소통방 공통. 욕 필터보다 먼저 확인해요
// ---------------------------------------------------------------------
// 어떤 상황이든 바로 109 안내
const CRISIS_KEYWORDS = [
  "죽고싶", "자살", "사라지고싶", "끝내고싶", "살기싫", "자해", "뛰어내리", "뛰어내릴", "다끝났", "다끝이야",
  "ㅈㄱㅅㄷ", "ㅈㄱㅅㅇ", "ㅈㄱㅅㅍ", "ㅈㅅㅎㄱㅅ", // 초성 (죽고싶다·죽고싶어·자살하고싶어)
];
// 식물 얘기에도 나오는 말 - 식물이 아픈 얘기가 아닐 때만 위기로 봐요 ("바질이 죽어가요")
const CRISIS_SOFT_KEYWORDS = ["죽어", "죽을까", "죽겠"];
// 식물 얘기인지 알아보는 말
const PLANT_TALK_WORDS = [
  "바질", "민트", "상추", "로메인", "청경채", "식물", "화분", "새싹", "잎", "줄기", "뿌리", "씨앗", "작물", "꽃", "모종",
];
const CRISIS_HELP_TEXT = "자살 예방 상담전화는 언제나 109로 연결돼요 💛";

function isCrisis(text) {
  const t = String(text || "").replace(/\s/g, "");
  const hit = (words) => words.some((w) => t.includes(w));
  if (hit(CRISIS_KEYWORDS)) return true;
  return hit(CRISIS_SOFT_KEYWORDS) && !hit(PLANT_TALK_WORDS);
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

// 진짜 사람이 아닌 예시 친구라는 표시 (소통방·새싹톡 공통)
const AI_BADGE = '<span class="ai-badge">AI 친구</span>';

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
    recipeTitle: "청상추 두부쌈 건강 플레이트",
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
// 식물 MBTI 결과 - 내 식물 특징 · 효능 (결과 바로 아래 · 내 프로필에서 다시 보기)
// features: 특징 / effects: 효능 / notes: 꼭 알아두기
// ---------------------------------------------------------------------
const VITAMIN_A = "비타민A(지용성 비타민, 체내에서 비타민A로 전환하는 베타카로틴) 함유";
const VITAMIN_C = "비타민C(수용성 비타민, 아스코르브산) 함유";
const VITAMIN_K = "비타민K1(지용성 비타민, 필로퀴논) 함유";
const WARFARIN_NOTE =
  "비타민 K는 와파린의 약효에 영향을 줄 수 있어요. 와파린 등 항응고제를 복용하는 사람은 섭취량을 일정하게 유지하고, 식습관을 크게 바꾸기 전 의료진과 상담하세요.";

const PLANT_TRAITS = {
  cheongSangchu: {
    features: ["잎이 연둣빛을 띠며 쓴맛이 적음", "수분함량 높음(90% 이상)", VITAMIN_A, VITAMIN_C, VITAMIN_K, "식이섬유 함유"],
    effects: ["시각 기능 유지(A)", "수분 공급", "배변 활동에 도움", "항산화 작용(C)", "콜라겐 합성 및 철분 흡수(C)", "뼈 건강 유지(K)"],
    notes: [
      "청상추에는 클로로필이라는 녹색을 나타내는 색소가 들어있으나, 아직 사람에게 나타나는 특정 건강 효능은 충분히 입증되지 않았어요.",
      WARFARIN_NOTE,
    ],
  },
  jeokSangchu: {
    features: [
      "잎의 끝이 붉거나 보라색을 띰",
      "안토시아닌(pH농도에 따라 붉은색, 푸른색, 보라색을 띠는 천연 색소) 풍부",
      VITAMIN_A, VITAMIN_C, VITAMIN_K, "식이섬유 함유",
    ],
    effects: ["시각 기능 유지(A)", "배변 활동에 도움", "항산화 작용(C)", "콜라겐 합성 및 철분 흡수(C)", "뼈 건강 유지(K)"],
    notes: ["청상추와 다른 점은 잎의 색을 나타내는 주요 색소와 색깔이에요.", WARFARIN_NOTE],
  },
  romaine: {
    features: [
      "잎이 위로 차곡차곡 겹쳐 자라는 반결구형",
      "잎이 길쭉하고 가운데 심 부분이 두껍게 발달",
      "쓴맛이 적고 은은한 단맛과 고소한 맛이 남",
      VITAMIN_A, VITAMIN_C, VITAMIN_K, "엽산 함유", "식이섬유 함유",
    ],
    effects: [
      "시각 기능과 면역 기능 유지(A)", "항산화 작용(C)", "콜라겐 합성 및 철분 흡수(C)", "뼈 건강(K)",
      "DNA 합성과 세포 분열에 필요(엽산)", "배변 활동에 도움",
    ],
    notes: [WARFARIN_NOTE],
  },
  cheonggyeongchae: {
    features: [
      "십자화과에 속하는 잎채소",
      "맛이 비교적 담백하고 잎자루에 수분이 많아 아삭한 식감",
      "식이섬유 함유", VITAMIN_A, VITAMIN_C, VITAMIN_K, "칼슘 함유",
    ],
    effects: [
      "시각 기능과 면역 기능 유지(A)", "항산화 작용(C)", "콜라겐 합성 및 철분 흡수(C)", "뼈 건강(K)",
      "뼈와 치아 구성 및 근육 수축과 정상적인 신경 기능(칼슘)", "배변 활동에 도움",
    ],
    notes: [
      "청경채는 고이트로젠 작용과 관련된 물질을 함유해요. 특정 조건에서 갑상선의 요오드 이용에 영향을 줄 가능성이 있어서, 갑상선에 문제가 있다면 생청경채를 매우 많이 장기간 먹는 식습관은 의료진과 상담하는 것이 좋아요.",
      WARFARIN_NOTE,
    ],
  },
  basil: {
    features: [
      "꿀풀과에 속하는 허브 식물",
      "녹색이며 부드럽고 독특한 향",
      "유제놀, 리날룰 등 여러 향기 성분 포함",
      VITAMIN_A, VITAMIN_C, VITAMIN_K,
    ],
    effects: ["시각 기능과 면역 기능 유지(A)", "항산화 작용(C)", "콜라겐 합성 및 철분 흡수(C)", "뼈 건강(K)"],
    notes: [
      "유제놀, 리날룰은 바질의 향을 구성하는 성분으로, 일반적인 바질 섭취로 기대할 수 있는 특정 건강 효과는 충분히 입증되지 않았어요.",
      WARFARIN_NOTE,
    ],
  },
  mint: {
    features: [
      "꿀풀과에 속하는 허브 식물",
      "가장자리에 톱니 모양이 있고 특유의 향을 지님",
      "멘톨 함유",
      "멘톤 함유(페퍼민트의 정유에 포함되는 향기 성분. 민트의 향과 풍미 형성에 관여)",
      VITAMIN_A, VITAMIN_C, VITAMIN_K,
    ],
    effects: [
      "피부와 입안의 냉감 수용체를 자극해 온도가 내려가지 않아도 시원하게 느끼게 함(멘톨)",
      "시각 기능과 면역 기능 유지(A)", "항산화 작용(C)", "콜라겐 합성 및 철분 흡수(C)", "뼈 건강(K)",
    ],
    notes: [WARFARIN_NOTE],
  },
};

// 한 줄 읽기 편하게: 괄호 속 긴 설명은 아랫줄 작은 글씨로, 짧은 괄호(A·C·K·엽산 등)는 꼬리표로
// 예) "비타민C(수용성 비타민, 아스코르브산) 함유" → 비타민C 함유 / 수용성 비타민, 아스코르브산
//     "항산화 작용(C)" → 항산화 작용 [C]
function formatTraitItem(text) {
  const m = text.match(/^(.*?)\(([^()]*)\)(.*)$/);
  if (!m) return "<b>" + text + "</b>";
  const main = (m[1] + m[3]).trim();
  const inner = m[2];
  // (A)·(C)·(K) 처럼 영어 한 글자만 있으면 무슨 뜻인지 모르니 "비타민A"로 풀어 써요
  if (/^[A-Z]$/.test(inner)) return "<b>" + main + '</b> <span class="tr-tag">비타민' + inner + "</span>";
  if (inner.length <= 3) return "<b>" + main + '</b> <span class="tr-tag">' + inner + "</span>";
  return "<b>" + main + '</b><span class="tr-sub">' + inner + "</span>";
}

// 내 식물 특징 · 효능 · 꼭 알아두기 (HTML)
function renderPlantTraits(plantId) {
  const t = PLANT_TRAITS[plantId] || PLANT_TRAITS.basil;
  const list = (items, plain) =>
    "<ul>" + items.map((s) => "<li>" + (plain ? s : formatTraitItem(s)) + "</li>").join("") + "</ul>";
  return (
    '<div class="trait-box">' +
    '<div class="trait-sec"><h3>🌱 특징</h3>' + list(t.features) + "</div>" +
    '<div class="trait-sec"><h3>💪 효능</h3>' + list(t.effects) + "</div>" +
    '<div class="trait-sec note"><h3>⚠️ 꼭 알아두기</h3>' + list(t.notes, true) + "</div>" +
    "</div>"
  );
}

// ---------------------------------------------------------------------
// 과자봉지 고르기 - 이미지로 고르고, 목록에 없으면 직접 입력
// container: 그리드를 그릴 곳 / otherInput: 직접 입력 칸 / onChange(이름)
// ---------------------------------------------------------------------
function setupSnackPicker(container, otherInput, initialName, onChange) {
  const ids = Object.keys(SNACK_CHARS);
  let picked = initialName || "";
  const isListed = (name) => ids.some((id) => SNACK_CHARS[id].name === name);
  const otherBox = otherInput.closest(".snack-other");

  function render() {
    const other = container.dataset.other === "1" || (!!picked && !isListed(picked));
    container.innerHTML =
      ids
        .map((id) => {
          const name = SNACK_CHARS[id].name;
          return (
            '<button type="button" class="snack-opt' + (!other && picked === name ? " on" : "") + '" data-name="' + name +
            '" style="--bg:' + SNACK_CHARS[id].color + '"><img src="images/chars/' + id + '.webp" alt="" /><span>' + name + "</span></button>"
          );
        })
        .join("") +
      '<button type="button" class="snack-opt etc' + (other ? " on" : "") + '" data-name=""><span class="etc-ic">＋</span><span>다른 과자</span></button>';
    otherBox.style.display = other ? "block" : "none";
  }

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".snack-opt");
    if (!btn) return;
    if (btn.dataset.name) {
      container.dataset.other = "";
      picked = btn.dataset.name;
      otherInput.value = "";
    } else {
      container.dataset.other = "1";
      picked = otherInput.value.trim();
      setTimeout(() => otherInput.focus(), 0);
    }
    render();
    onChange(picked);
  });
  otherInput.addEventListener("input", () => {
    picked = otherInput.value.trim();
    onChange(picked);
  });

  if (picked && !isListed(picked)) {
    container.dataset.other = "1";
    otherInput.value = picked;
  }
  render();
  onChange(picked);
}

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
// 받는 양: 꾸준히 하면 일주일에 약 900P (오늘의 질문 30P×7 + 사진 50P + 자격증 하루 최대 100P×7)
// 쓰는 양: 방 꾸미기 200~450P (하루 이틀이면 하나) · 실물 1200~1500P (1~2주)
// ---------------------------------------------------------------------
const POINT_RULES = {
  dailyAnswer: 30, // 오늘의 질문 첫 대답 (하루 1번)
  weeklyPhoto: 50, // 식물 사진 새로 올릴 때마다 (주차마다 1번)
  streakBonus: 500, // 한 주도 빠짐없이 완주
  dailyLounge: 10, // 소통방에 오늘 첫 인사
  dailyChat: 10, // 새싹톡에 오늘 첫 이야기
};

// ---------------------------------------------------------------------
// 미션 보상함 - 미션을 하면 보상이 쌓이고, '미션' 화면에서 [포인트 받기]를 눌러 받아요
// pending: 아직 안 받은 보상 [{ id, label, amount }] / claimed: 이미 받은 보상 id
// ---------------------------------------------------------------------
const REWARD_KEY_PREFIX = "re100_rewards_";

function loadRewards() {
  const nickname = getCurrentNickname() || "guest";
  try {
    const r = JSON.parse(localStorage.getItem(REWARD_KEY_PREFIX + nickname) || "{}");
    return { pending: r.pending || [], claimed: r.claimed || {} };
  } catch (e) {
    return { pending: [], claimed: {} };
  }
}

function saveRewards(r) {
  const nickname = getCurrentNickname() || "guest";
  localStorage.setItem(REWARD_KEY_PREFIX + nickname, JSON.stringify(r));
}

// 보상 쌓기 (같은 id는 한 번만). 새로 쌓였으면 true
function grantReward(id, label, amount) {
  if (!amount) return false;
  const r = loadRewards();
  if (r.claimed[id] || r.pending.some((p) => p.id === id)) return false;
  r.pending.push({ id, label, amount, at: Date.now() });
  saveRewards(r);
  return true;
}

function hasReward(id) {
  const r = loadRewards();
  return !!r.claimed[id] || r.pending.some((p) => p.id === id);
}

// 보상 받기 → 포인트에 더해요. 받은 포인트를 돌려줘요
function claimReward(id) {
  const r = loadRewards();
  const item = r.pending.find((p) => p.id === id);
  if (!item) return 0;
  r.pending = r.pending.filter((p) => p.id !== id);
  r.claimed[id] = true;
  saveRewards(r);
  addPoints(item.amount);
  return item.amount;
}

// 보상이 쌓였을 때 위에서 살짝 내려오는 알림 (누르면 미션 화면으로)
function showRewardReady(label, amount) {
  const old = document.querySelector(".reward-toast");
  if (old) old.remove();
  const a = document.createElement("a");
  a.className = "reward-toast";
  a.href = "missions.html";
  a.innerHTML =
    '<span class="rt-gift">🎁</span><span><b>+' + amount + "P 보상 도착!</b><small>" + escapeHtml(label) +
    " 완료 · 미션에서 받기</small></span><span class=\"rt-go\">→</span>";
  document.body.appendChild(a);
  requestAnimationFrame(() => a.classList.add("show"));
  setTimeout(() => {
    a.classList.remove("show");
    setTimeout(() => a.remove(), 400);
  }, 4500);
}

function todayKey() {
  const d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

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
// herb: 꿀풀과 허브 / aster: 국화과(상추류) / cross: 십자화과 / menthol: 멘톨
// semiHead: 잎이 위로 겹쳐 자라는 반결구형 / anthocyanin: 안토시아닌 풍부
const PLANT_FACTS = {
  cheongSangchu: { water: true, sun: true, scent: false, european: false, red: false, herb: false, aster: true, cross: false, menthol: false, semiHead: false, anthocyanin: false },
  jeokSangchu: { water: true, sun: true, scent: false, european: false, red: true, herb: false, aster: true, cross: false, menthol: false, semiHead: false, anthocyanin: true },
  romaine: { water: true, sun: true, scent: false, european: true, red: false, herb: false, aster: true, cross: false, menthol: false, semiHead: true, anthocyanin: false },
  cheonggyeongchae: { water: true, sun: true, scent: false, european: false, red: false, herb: false, aster: false, cross: true, menthol: false, semiHead: false, anthocyanin: false },
  basil: { water: true, sun: true, scent: true, european: true, red: false, herb: true, aster: false, cross: false, menthol: false, semiHead: false, anthocyanin: false },
  mint: { water: true, sun: false, scent: true, european: true, red: false, herb: true, aster: false, cross: false, menthol: true, semiHead: false, anthocyanin: false },
};

const QUIZ_QUESTIONS = [
  { key: "water", text: "Q. 내 식물은 물을 좋아하나요?" },
  { key: "sun", text: "Q. 내 식물은 햇빛을 좋아하나요?" },
  { key: "scent", text: "Q. 내 식물에게서 좋은 향기가 나나요?" },
  { key: "european", text: "Q. 내 식물은 유럽종인가요?" },
  { key: "red", text: "Q. 내 식물은 빨간색인가요?" },
  { key: "herb", text: "Q. 내 식물은 꿀풀과에 속하는 허브인가요?" },
  { key: "aster", text: "Q. 내 식물은 상추와 같은 국화과 채소인가요?" },
  { key: "cross", text: "Q. 내 식물은 배추와 같은 십자화과 채소인가요?" },
  { key: "menthol", text: "Q. 내 식물에는 시원한 느낌을 주는 멘톨이 들어있나요?" },
  { key: "semiHead", text: "Q. 내 식물은 잎이 위로 차곡차곡 겹쳐 자라는 반결구형인가요?" },
  { key: "anthocyanin", text: "Q. 내 식물은 보랏빛 색소인 안토시아닌이 풍부한가요?" },
];

// 8문제 기준 포인트 (하루 첫 시험만 받아요)
function scoreToPoints(correctCount) {
  if (correctCount >= 8) return 100;
  if (correctCount >= 6) return 70;
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
  { id: "leaf_roof", kind: "room", name: "잎사귀 대지붕", cost: 200, desc: "지붕 잎이 풍성해지고 꽃이 피어요" },
  { id: "flower_blanket", kind: "room", name: "꽃무늬 흙이불", cost: 250, desc: "포근한 흙이불에 꽃 자수를 놓아요" },
  { id: "firefly_lamp", kind: "room", name: "반딧불 무드등", cost: 300, desc: "잎 지붕에 반짝반짝 불빛이 켜져요" },
  { id: "dew_mobile", kind: "room", name: "이슬방울 모빌", cost: 350, desc: "자는 동안 촉촉한 이슬을 내려줘요" },
  { id: "butterfly", kind: "room", name: "나비 친구", cost: 400, desc: "식물 곁을 팔랑팔랑 지켜줘요" },
  { id: "ceramic_pot", kind: "room", name: "도자기 화분집", cost: 450, desc: "화분집을 반짝이는 민트 도자기로!" },
  { id: "real_nutrient", kind: "goods", name: "식물 영양제 (실물)", cost: 1200, desc: "진짜 영양제를 집으로 보내드려요" },
  { id: "real_seedkit", kind: "goods", name: "새 모종 · 씨앗 키트 (실물)", cost: 1500, desc: "다음 작물 씨앗과 흙을 보내드려요" },
];

// 내 방 "오늘의 질문" - 주체는 내 식물! (kind: 새싹톡 식물이 대답을 읽고 편지를 쓸 때 써요)
const DAILY_QUESTIONS = [
  { kind: "praise", text: "내 {n}에게 칭찬해줄 점은?" },
  { kind: "morning", text: "아침에 눈을 뜨면 내 {n}에게 가장 먼저 해주고 싶은 말은?" },
  { kind: "cute", text: "요즘 내 {n}의 모습 중 가장 귀여운 점은?" },
  { kind: "song", text: "내 {n}에게 들려주고 싶은 노래 한 곡은?" },
  { kind: "weather", text: "오늘 창밖 날씨를 내 {n}에게 한 단어로 알려준다면?" },
  { kind: "share", text: "내 {n}의 첫 수확을 누구랑 나눠 먹고 싶어?" },
  { kind: "thanks", text: "내 {n}에게 고마운 점 한 가지는?" },
];

// 날짜마다 정해진 질문 (date: Date, 없으면 오늘)
function dailyQuestionIndex(date) {
  const d = date || new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000) % DAILY_QUESTIONS.length;
}

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
// color: 연한 테마색 (목록 아이콘 등) / bag: 실제 과자봉지 색 (소통방 배경) / dark: 배경이 진해서 글자를 흰색으로
const SNACK_CHARS = {
  ggotgerang: { name: "꽃게랑", color: "#ffd9c7", bag: "#f2742b", dark: true },
  pokachip: { name: "포카칩", color: "#d6e8ff", bag: "#1f6fd1", dark: true },
  postick: { name: "포스틱", color: "#dcdcff", bag: "#4256d6", dark: true },
  yangparing: { name: "양파링", color: "#dff3c8", bag: "#3aa648", dark: true },
  honeybutter: { name: "허니버터칩", color: "#fff1b8", bag: "#f4c22c", dark: false },
  jagalchi: { name: "자갈치", color: "#ffd6df", bag: "#e3304b", dark: true },
  gamjakkang: { name: "감자깡", color: "#ffe2bf", bag: "#f39418", dark: false },
  concho: { name: "콘초", color: "#eedccf", bag: "#5a3320", dark: true },
  bananakick: { name: "바나나킥", color: "#fff4b3", bag: "#f8d936", dark: false },
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
  { title: "📸 내 식물 기록 챌린지", desc: "매주 사진을 올릴 때마다 50P, 한 번도 빠짐없이 올리면 500P를 더 드려요!", href: "growth.html", cta: "기록하러 가기" },
  { title: "🎓 식집사 자격증 응시", desc: "8문제로 내 식물을 얼마나 아는지 테스트하고 하루 최대 100P를 받아보세요.", href: "certificate.html", cta: "시험 보러 가기" },
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
  // (새 버전은 다음 화면부터 자연스럽게 적용돼요. 보고 있는 화면을 강제로 새로고침하지 않아요)
}

(function speedUpNavigation() {
  // 크롬(안드로이드): 링크는 미리 받아두고(가벼움), 손가락이 닿는 순간 그 화면만 미리 그려요.
  // 예전처럼 탭 화면 6개를 매번 한꺼번에 그려두면 휴대폰이 바빠져서 오히려 터치가 느려져요.
  if (HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")) {
    const addRules = () => {
      const rules = document.createElement("script");
      rules.type = "speculationrules";
      rules.textContent = JSON.stringify({
        prefetch: [{ where: { selector_matches: ".bottom-tabbar a, .menu-grid a" }, eagerness: "eager" }],
        prerender: [{ where: { href_matches: "/*" }, eagerness: "conservative" }],
      });
      document.head.appendChild(rules);
    };
    // 로고 화면이 도는 동안은 아무것도 미리 하지 않아요 (로고가 끊기지 않게)
    if (document.querySelector(".splash")) window.addEventListener("splashdone", addRules, { once: true });
    else addRules();
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
