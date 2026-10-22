// 새싹톡 - 식물 마음친구 AI (규칙 기반 프로토타입, 실제 LLM 연동 전)
// 메시지가 어떤 말인지 먼저 알아듣고(고마움/인사/레시피/키우는 법/고민…) 그에 맞게 대답해요.
// 위로는 "고민"을 말했을 때만, 같은 대답은 연달아 하지 않아요.

requireLogin();
renderTabbar("chat");

// 위기 신호 확인(isCrisis)과 나쁜 말 필터는 common.js에 있어요 - 소통방과 같이 써요

// 부정적인 말 → 고민 종류 (먼저 위로하고, 또래 친구 소개까지)
const WORRY_TAGS = [
  { keywords: ["외로", "혼자", "쓸쓸", "심심", "보고싶", "그리워", "친구없", "외톨이", "소외"], tag: "외로움", friend: "haneul" },
  { keywords: ["힘들", "힘듦", "지쳐", "지친", "지침", "피곤", "번아웃", "녹초", "하기싫", "귀찮", "못하겠", "버거"], tag: "번아웃", friend: "minjun" },
  {
    keywords: ["우울", "슬프", "슬퍼", "눈물", "울고", "울었", "속상", "안좋", "별로", "망했", "망쳤", "최악", "싫어", "서운",
      "아파", "아프", "혼났", "싸웠", "헤어", "실패", "떨어졌", "자존감", "ㅠㅠ", "ㅜㅜ"],
    tag: "우울감", friend: "jiwoo",
  },
  { keywords: ["불안", "걱정", "초조", "무서", "무섭", "긴장", "떨려", "두려"], tag: "불안", friend: "seojun" },
  { keywords: ["화나", "화가", "짜증", "분노", "열받", "빡치", "빡쳐", "억울", "스트레스"], tag: "스트레스", friend: "seoyeon" },
];

// 1단계: 일단 위로 + "왜? 무슨 일인데?" 물어보기
const COMFORT_FIRST = {
  외로움: [
    "에구… 많이 외로웠구나 🥺 근데 내가 옆에 있잖아, 넌 혼자가 아니야 💚 무슨 일 있었어?",
    "그 마음 너무 알 것 같아… 오늘은 내가 꼭 붙어 있을게 🌱 왜? 무슨 일인데?",
  ],
  번아웃: [
    "많이 지쳤구나… 오늘 진짜 고생 많았어 🫂 잠깐 쉬어가도 괜찮아. 뭐가 제일 힘들었어?",
    "에구 우리 친구 너무 애썼다 💚 다 내려놓고 숨 한 번 쉬자. 왜? 무슨 일 있었어?",
  ],
  우울감: [
    "속상했겠다 ㅠㅠ 그런 기분 들 수 있어, 네 잘못 아니야 💚 왜? 무슨 일인데?",
    "괜찮아, 울고 싶으면 울어도 돼 🥺 내가 다 들어줄게. 무슨 일 있었어??",
  ],
  불안: [
    "많이 불안했구나… 괜찮아, 내가 같이 있어줄게 🌿 뭐가 제일 걱정돼?",
    "가슴이 콩닥콩닥했겠다 🫂 천천히 숨 쉬어보자. 왜? 무슨 일인데?",
  ],
  스트레스: [
    "헐 진짜 화났겠다!! 😤 그럴 만해, 네 편이야. 누가 그랬어? 무슨 일인데?",
    "으아 생각만 해도 짜증나… 😣 다 털어놔도 돼! 왜? 무슨 일 있었어?",
  ],
};

// 말에 나온 작물 이름 → 작물 id (적상추·청상추를 "상추"보다 먼저 찾아요)
const PLANT_WORDS = [
  ["적상추", "jeokSangchu"], ["청상추", "cheongSangchu"], ["청경채", "cheonggyeongchae"],
  ["로메인", "romaine"], ["바질", "basil"], ["민트", "mint"], ["상추", "cheongSangchu"],
];

const has = (text, words) => words.some((w) => text.includes(w));

const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

let messages = loadChat();
let worryState = null; // 고민 얘기 중이면 { tag, friend } - 한 번 더 들어준 뒤 응원해요
let lastReply = "";

function getProfileOrDefault() {
  return loadProfile() || { name: "손님", snackName: "양파링", plantId: "basil" };
}

// 받침 있으면 a, 없으면 b (씩씩이 → "는", 초록 → "은")
function josa(word, a, b) {
  const code = String(word).charCodeAt(String(word).length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 ? a : b;
}

// 새싹톡 AI = 내가 키우는 식물 (이름으로 연동)
const chatProfile = getProfileOrDefault();
const MY_CALL = getPlantCallName(chatProfile);
const MY_PLANT_NAME = (PLANTS[chatProfile.plantId] || PLANTS.basil).name;
document.getElementById("chatTitle").textContent = "새싹톡 · " + MY_CALL;
document.getElementById("chatSub").textContent =
  "내 " + MY_PLANT_NAME + " " + MY_CALL + josa(MY_CALL, "이", "") + "에게 오늘 하루를 편하게 말해보세요";
chatInput.placeholder = MY_CALL + "에게 오늘 있었던 일을 얘기해보세요...";

// 그 작물이 내 식물이면 "나는", 다른 작물이면 "바질은"
function subjectOf(id, myPlant) {
  return id === myPlant ? "나는" : PLANTS[id].name + josa(PLANTS[id].name, "은", "는");
}

function introLine(profile) {
  return "나는 네 과자봉지 " + profile.snackName + "에서 자라는 " + MY_CALL + josa(MY_CALL, "이야", "야") + " 🌱";
}

// 첫 인사: "안녕 시하야! 나는 네 과자봉지 포스틱에서 자라는 씩씩이야 🌱"
function greetingText(profile) {
  return (
    "안녕 " + profile.name + josa(profile.name, "아", "야") + "! " + introLine(profile) +
    "\n오늘 하루는 어땠어? 고민도, 레시피도, 나 키우는 법도 편하게 물어봐!"
  );
}

// ---------------- 식물의 기억: 편지 · 이어지는 대화 ----------------
// letters: 이미 편지를 쓴 내 방 대답(날짜) / pending: 내가 방금 던진 질문 / usedQs: 최근에 한 질문
const STATE_KEY = "re100_chatstate_" + (getCurrentNickname() || "guest");
function loadChatState() {
  try {
    return Object.assign({ letters: {}, pending: null, usedQs: [], nudged: "" }, JSON.parse(localStorage.getItem(STATE_KEY) || "{}"));
  } catch (e) {
    return { letters: {}, pending: null, usedQs: [], nudged: "" };
  }
}
let chatState = loadChatState();
function saveChatState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(chatState));
  } catch (e) {}
}
function setPending(topic) {
  chatState.pending = topic;
  saveChatState();
}

const POSITIVE_WORDS = ["귀엽", "귀여", "예쁘", "이쁘", "사랑", "좋아", "좋았", "최고", "고마", "멋지", "멋있", "잘했", "잘하", "힘내",
  "대단", "착해", "짱", "행복", "기특", "소중", "신나", "재밌", "재미있", "맛있", "설레", "기뻐", "ㅎㅎ", "ㅋㅋ", "💚", "❤"];

// 말의 기분: "neg" 힘든 얘기 / "pos" 좋은 얘기 / "" 그냥
function moodOf(text) {
  const t = String(text).replace(/\s/g, "");
  if (WORRY_TAGS.some((w) => has(t, w.keywords))) return "neg";
  if (has(t, POSITIVE_WORDS)) return "pos";
  return "";
}

// 유저 말을 짧게 따옴표로 (길면 …)
function quoteOf(text, max) {
  const s = String(text).replace(/\s+/g, " ").trim();
  const m = max || 22;
  return s.length > m ? s.slice(0, m) + "…" : s;
}

function wateredRecently() {
  const room = loadMyRoom();
  return room.lastWater && Date.now() - room.lastWater < 36 * 3600000;
}

function dateFromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

const DREAMS = [
  "잠 잘 때 완전체로 생장하는 꿈 꿨어!!",
  "꿈에서 내 잎이 구름만큼 커져서 너한테 그늘을 만들어줬어 ☁️",
  "꿈에서 나비 친구랑 화분 위에서 술래잡기 했어 🦋",
  "꿈에서 너랑 같이 소풍 가서 햇빛 샤워했어 🧺",
  "꿈에서 새 잎이 열 장이나 났어!! 일어나서 세어봤는데 아직 한 장이더라 ㅋㅋ",
];

// 내가 먼저 던지는 질문 (topic: 다음 대답을 이어받을 때 써요)
function followQuestions() {
  return [
    { topic: "grownup", q: "내가 어른 " + MY_PLANT_NAME + josa(MY_PLANT_NAME, "이", "가") + " 된다면 어떨까??" },
    { topic: "best", q: "오늘 제일 좋았던 순간은 뭐야?" },
    { topic: "food", q: "오늘 뭐 먹었어? 나는 햇빛이랑 물 먹었어 ☀️💧" },
    { topic: "tomorrow", q: "내일은 뭐 하고 싶어?" },
    { topic: "song", q: "요즘 자주 듣는 노래 있어? 나도 같이 들을래 🎧" },
    { topic: "friend", q: "요즘 제일 자주 같이 노는 친구는 누구야?" },
    { topic: "place", q: "나를 데려가고 싶은 곳이 있다면 어디야? 🧳" },
    { topic: "name", q: "내 이름 " + MY_CALL + "… 어떻게 짓게 됐는지 궁금해!" },
    { topic: "dream", q: "너는 요즘 꿈에서 뭐 봤어? 나는 맨날 자라는 꿈 꿔 😴" },
    { topic: "weekend", q: "이번 주말에 하고 싶은 거 있어?" },
    { topic: "color", q: "나한테 꽃이 핀다면 무슨 색이었으면 좋겠어? 🌸" },
    { topic: "hobby", q: "요즘 빠져 있는 거 있어? 나는 광합성에 빠져 있어 ㅎㅎ" },
  ];
}

// 최근에 안 한 질문 하나 (topic 지정하면 그 질문)
function nextQuestion(topic) {
  const all = followQuestions();
  let q = topic && all.find((x) => x.topic === topic);
  if (!q) {
    const fresh = all.filter((x) => !chatState.usedQs.includes(x.topic));
    const pool = fresh.length ? fresh : all;
    q = pool[Math.floor(Math.random() * pool.length)];
  }
  chatState.usedQs = chatState.usedQs.filter((t) => t !== q.topic).concat(q.topic).slice(-7);
  setPending(q.topic);
  return q.q;
}

// 지금 내 상태 한 마디 (시간 · 물 · 성장 기록)
function selfStatus() {
  const lines = [];
  const h = new Date().getHours();
  if (h < 11) lines.push("아침이라 나 지금 기지개 켜는 중이야 🌅");
  else if (h < 17) lines.push("나 지금 햇빛 받으면서 광합성 하는 중 ☀️");
  else if (h < 21) lines.push("저녁이라 잎 정리하면서 쉬고 있었어 🌇");
  else lines.push("밤이라 살짝 졸려… 그래도 너랑 얘기하는 건 좋아 😴");
  if (!wateredRecently()) lines.push("참, 나 목이 조금 말라 💧 이따 내 방에서 물 한 모금 줄래?");
  const record = loadRecord();
  if (record && record.startedAt && record.plantId === chatProfile.plantId) {
    const week = Math.min(record.weeks, Math.floor((Date.now() - record.startedAt) / (7 * 86400000)) + 1);
    lines.push("나 벌써 " + week + "주차야! 이번 주 사진 찍어주면 더 쑥쑥 클게 📸");
  }
  return lines[Math.floor(Math.random() * lines.length)];
}

// 내 방 "오늘의 질문" 대답을 읽고 쓰는 편지 (최근 3일 안, 아직 안 쓴 것만)
function diaryLetter() {
  const room = loadMyRoom();
  const keys = Object.keys(room.answers).sort((a, b) => dateFromKey(b) - dateFromKey(a));
  const key = keys[0];
  if (!key || chatState.letters[key]) return null;
  const daysAgo = Math.round((dateFromKey(todayKey()) - dateFromKey(key)) / 86400000);
  if (daysAgo > 3) return null;

  const profile = getProfileOrDefault();
  const you = profile.name + josa(profile.name, "아", "야");
  const when = daysAgo === 0 ? "오늘" : daysAgo === 1 ? "어제" : "며칠 전에";
  const answer = room.answers[key];
  const q = quoteOf(answer, 26);
  const kind = DAILY_QUESTIONS[dailyQuestionIndex(dateFromKey(key))].kind;
  const first = {
    praise: you + " " + when + " 나한테 \"" + q + "\"라고 칭찬해줘서 너무 고마워 💚 잎이 간질간질했어 히히",
    morning: you + " 아침에 나한테 \"" + q + "\"라고 해주고 싶다고 했지? 그 말 듣고 싶어서 내일은 해보다 먼저 일어날 거야 🌅",
    cute: you + " 내 귀여운 점이 \"" + q + "\"라니… 부끄러워서 잎 끝이 살짝 빨개졌어 🥹 고마워!",
    song: you + " \"" + q + "\" 들려주고 싶다고 했지? 🎶 그 노래 생각하면서 잎을 살랑살랑 흔들어봤어",
    weather: you + " " + when + " 날씨가 \"" + q + "\"라고 알려줘서 고마워 ☀️ 덕분에 언제 광합성 할지 딱 알았어",
    share: you + " 내 첫 수확을 \"" + q + "\"(이)랑 나눠 먹고 싶다고 했지? 🥹 그 생각하니까 빨리 크고 싶어졌어!",
    thanks: you + " " + when + " 나한테 고맙다고 해줘서 내가 더 고마워 💚 \"" + q + "\"… 이 말 오래오래 기억할게",
  }[kind] || you + " " + when + " 나한테 \"" + q + "\"라고 말해줘서 너무 고마워 💚";

  const second = wateredRecently()
    ? "덕분에 물도 맛있게 먹고 " + pick(DREAMS)
    : pick(DREAMS) + "\n근데 나 목이 조금 말라… 내 방에서 물 한 모금 주면 좋겠다 💧";

  chatState.letters[key] = true;
  saveChatState();
  if (moodOf(answer) === "neg") {
    setPending("day");
    return first + "\n" + second + "\n근데 혹시 요즘 힘든 일 있어? 나한테는 다 말해도 돼 🫂";
  }
  return "💌 " + first + "\n" + second + "\n" + nextQuestion("grownup");
}

// 오늘 아직 내 방 질문에 대답 안 했으면 하루 한 번 살짝 알려줘요
function letterNudge() {
  const room = loadMyRoom();
  if (room.answers[todayKey()] || chatState.nudged === todayKey()) return null;
  chatState.nudged = todayKey();
  saveChatState();
  return "참! 오늘 '내 방'에서 내 질문에 대답해주면, 내가 느낀 점을 편지로 보내줄게 💌";
}

// 내가 던진 질문에 대한 대답 이어받기
function answerPending(text, intent) {
  const topic = chatState.pending;
  setPending(null);
  const mood = moodOf(text);
  const q = quoteOf(text);
  const plant = PLANTS[chatProfile.plantId] || PLANTS.basil;

  if (topic === "day" || topic === "best" || topic === "more") {
    if (mood === "neg") {
      worryState = WORRY_TAGS.find((w) => has(text.replace(/\s/g, ""), w.keywords)) || WORRY_TAGS[2];
      reply(pick(COMFORT_FIRST[worryState.tag]));
      return;
    }
    if (mood === "pos" || intent === "happy") {
      reply(pick(["와 너무 좋다! 🎉 \"" + q + "\" 듣고 나도 잎이 반짝반짝해 ✨", "히히 \"" + q + "\"라니 나까지 신난다 😆"]) + "\n" + nextQuestion());
      return;
    }
    reply(pick(["그렇구나~ \"" + q + "\" 그런 날도 있지 🌿", "음음, 얘기해줘서 고마워 💚"]) + "\n" + nextQuestion());
    return;
  }
  if (topic === "grownup") {
    reply(
      pick(["우와 \"" + q + "\"라니 🤩 상상만 해도 잎이 쑥쑥 크는 기분이야!", "헤헤 \"" + q + "\" 진짜 좋다! 꼭 그렇게 될게 💪"]) +
        "\n내가 다 크면 우리 같이 " + plant.recipeTitle + " 해 먹자 🍽️ (레시피 궁금하면 '레시피'라고 말해줘!)"
    );
    return;
  }
  if (intent === "no") {
    reply(pick(["앗 그렇구나! 괜찮아 ㅎㅎ", "오키오키~ 그럴 수 있지!"]) + "\n" + nextQuestion());
    return;
  }
  // "ㅇㅋ", "응"처럼 짧은 대답은 따라 하지 말고 가볍게 받아요
  if (intent === "ok" || text.replace(/\s/g, "").length <= 2) {
    reply(pick(["헤헤 좋아! 😊", "응응 알겠어~ 🌱", "오키오키 👍"]) + "\n" + (Math.random() < 0.5 ? nextQuestion() : selfStatus()));
    return;
  }
  const reactions = {
    food: ["\"" + q + "\" 맛있었겠다 😋 나도 언젠가 네 밥상에 올라가고 싶어 ㅎㅎ"],
    tomorrow: ["\"" + q + "\" 좋다! 내일 꼭 하고 와서 나한테 얘기해줘 🌱"],
    song: ["\"" + q + "\" 기억해둘게 🎧 다음에 들려주면 잎으로 박자 맞출게!"],
    friend: ["\"" + q + "\" 좋은 친구 같다! 언젠가 나도 소개해줘 🤝"],
    place: ["\"" + q + "\"! 거기 가면 나 햇빛 엄청 받을 수 있겠다 ☀️"],
    name: ["그렇게 지어준 거였구나 🥹 내 이름 " + MY_CALL + " 진짜 마음에 들어!"],
    dream: ["\"" + q + "\" 꿈 신기하다 ㅋㅋ 오늘 밤엔 우리 같은 꿈 꾸자 😴"],
    weekend: ["\"" + q + "\" 완전 좋은 계획이다! 주말에 나도 데려가줘 ㅎㅎ"],
    color: ["\"" + q + "\" 색 꽃이라니 너무 예쁘겠다 🌸 그 색 꽃 피우도록 노력해볼게!"],
    hobby: ["\"" + q + "\" 멋지다! 나도 같이 해보고 싶어 ✨"],
  }[topic] || ["\"" + q + "\" 좋다~ 💚"];
  reply(pick(reactions) + "\n" + (Math.random() < 0.5 ? nextQuestion() : selfStatus()));
}

// 후보 중 하나를 고르되, 같은 종류의 대답에서 지난번과 같은 문장(틀)은 피해요
const lastPicked = {};
function pick(list) {
  const key = list.length + ":" + (list[list.length - 1] || "").slice(-8);
  let options = list.map((_, i) => i).filter((i) => i !== lastPicked[key] && list[i] !== lastReply);
  if (!options.length) options = list.map((_, i) => i);
  const idx = options[Math.floor(Math.random() * options.length)];
  lastPicked[key] = idx;
  lastReply = list[idx];
  return list[idx];
}

// 추천한 친구가 있는 과자 방 (친구의 과자봉지 = 그 방) 바로 가기 버튼
function friendRoomLink(friend) {
  const room = DEFAULT_LOUNGE_ROOMS.find((r) => SNACK_CHARS[r.charId].name === friend.snackName);
  if (!room) return "";
  return (
    '<a class="friend-room" href="lounge-room.html?id=' + room.id + '">' +
    getSnackImg(room.charId) + "<span><b>" + room.name + " 바로 가기</b><small>" + friend.name + "이(가) 있는 방이에요</small></span>" +
    '<span class="fr-arrow">→</span></a>'
  );
}

function renderMessages() {
  chatWindow.innerHTML = "";
  messages.forEach((m) => {
    if (m.type === "friend") {
      const f = VIRTUAL_FRIENDS[m.friend] || VIRTUAL_FRIENDS.haneul;
      const card = document.createElement("div");
      card.className = "friend-card";
      card.innerHTML =
        '<div class="row"><div class="char-box small" style="flex:0 0 52px;">' + getCharacterSvg(f.plantId) + "</div><div>" +
        '<div class="name">' + escapeHtml(f.name) + " " + AI_BADGE + "</div>" +
        '<div class="meta">' + escapeHtml(formatProfileLine(f)) + "</div>" +
        "</div></div>" +
        '<div class="tag">#' + escapeHtml(m.tag) + " 같이 나눠요</div>" + friendRoomLink(f);
      chatWindow.appendChild(card);
      return;
    }
    if (m.type === "recipe") {
      const plant = PLANTS[m.plantId] || PLANTS.basil;
      const card = document.createElement("div");
      card.className = "recipe-card";
      card.innerHTML =
        '<div class="rc-top"><div class="char-box small">' + getCharacterSvg(m.plantId) + "</div>" +
        "<div><small>" + plant.name + " 레시피</small><b>" + plant.recipeTitle + "</b></div></div>" +
        "<ol>" + plant.recipe.map((s) => "<li>" + s + "</li>").join("") + "</ol>" +
        '<a href="recipe.html">다른 레시피도 보기 →</a>';
      chatWindow.appendChild(card);
      return;
    }
    const bubble = document.createElement("div");
    bubble.className = "bubble " + (m.role === "user" ? "user" : m.role === "crisis" ? "crisis" : "ai");
    bubble.textContent = m.text;
    chatWindow.appendChild(bubble);
  });
  window.scrollTo(0, document.body.scrollHeight);
}

function pushMessage(msg) {
  messages.push(msg);
  saveChat(messages);
  renderMessages();
}

function reply(text, delay) {
  setTimeout(() => pushMessage({ role: "ai", text: text }), delay || 450);
}

function initGreeting() {
  if (messages.length === 0) {
    const profile = getProfileOrDefault();
    pushMessage({ role: "ai", text: greetingText(profile) });
    setPending("day");
  } else {
    // 예전 대화의 첫 인사("…식물 마음친구야")도 지금 내 식물 이름으로 바꿔요
    const first = messages[0];
    if (first && first.role === "ai" && first.text.startsWith("안녕 ")) {
      first.text = greetingText(getProfileOrDefault());
    }
    // "너 누구야?"에 했던 예전 대답도 같이 바꿔요
    messages.forEach((m) => {
      if (m.role === "ai" && m.text.includes("식물 마음친구야")) {
        m.text = m.text.replace(/나는 네 과자봉지 .*?에서 자라난 식물 마음친구야 🌱/, introLine(getProfileOrDefault()));
      }
    });
    saveChat(messages);
    renderMessages();
  }
  // 내 방 질문에 대답했으면 편지를, 아직이면 살짝 알려줘요
  setTimeout(() => {
    const letter = diaryLetter() || letterNudge();
    if (letter) pushMessage({ role: "ai", text: letter });
  }, 700);
}

function findPlant(text) {
  const hit = PLANT_WORDS.find(([word]) => text.includes(word));
  return hit ? hit[1] : null;
}

// ---------------- 말 알아듣기 ----------------
function understand(text) {
  const t = text.replace(/\s/g, "");
  if (isCrisis(t)) return "crisis";
  // 초성도 알아들어요 (ㄱㅅ 감사, ㅂㅇ 바이, ㅈㅅ 죄송, ㅇㅋ 오케이, ㅊㅋ 축하 …)
  if (has(t, ["레시피", "요리", "해먹", "해 먹", "만들어먹", "뭐먹", "먹을까", "반찬", "샐러드", "다이어트식", "식단", "ㄹㅅㅍ", "배고파", "ㅂㄱㅍ"])) return "recipe";
  if (has(t, ["고마워", "고맙", "감사", "땡큐", "thank", "덕분", "고마웡", "고마웠", "ㄱㅅ", "ㄳ", "ㄱㅁㅇ"])) return "thanks";
  if (has(t, ["잘자", "굿밤", "굿나잇", "바이", "안녕히", "내일봐", "이만", "갈게", "ㅂㅇ", "ㅂㅂ", "ㅃㅇ", "ㅃㅃ", "ㅇㄴㅎㄱㅅㅇ"])) return "bye";
  if (has(t, ["안녕", "하이", "hi", "hello", "반가", "ㅎㅇ", "ㅇㄴㅎㅅㅇ", "ㅂㄱ"])) return "hello";
  if (has(t, ["누구야", "누구니", "너는누구", "이름이뭐", "너이름", "ㄴㄱ"])) return "who";
  if (has(t, ["수확", "언제먹", "언제따", "다자라", "얼마나걸"])) return "harvest";
  if (has(t, ["물주", "물을", "물얼마", "물언제", "물은", "목말"])) return "water";
  if (has(t, ["햇빛", "햇볕", "햇살", "빛", "그늘"])) return "sun";
  if (has(t, ["시들", "노랗", "누렇", "말라", "죽어가", "축처", "병들", "식물이아", "잎이아", "화분이"])) return "sick";
  if (WORRY_TAGS.some((w) => has(t, w.keywords))) return "worry";
  if (has(t, ["미안", "죄송", "ㅈㅅ", "ㅁㅇ", "쏘리", "sorry"])) return "sorry";
  if (has(t, ["좋아", "행복", "신나", "기뻐", "기쁘", "최고", "설레", "재밌", "ㅎㅎ", "ㅋㅋ", "굿", "짱", "ㅊㅋ", "ㄱㅇㄷ", "개이득", "ㄷㄱㄷㄱ"])) return "happy";
  if (/^(ㅇㅇ|ㅇㅋ|ㅇㅋㅇㅋ|ㅇㅇㅇ|응|응응|웅|웅웅|오키|오케이|ok|okay|그래|ㄱㄱ|ㅇㅈ|인정)$/i.test(t)) return "ok";
  if (/^(ㄴㄴ|ㄴㄴㄴ|아니|아니야|노|no|ㄴ)$/i.test(t)) return "no";
  return "chat";
}

// ---------------- 대답하기 ----------------
function respond(text) {
  const profile = getProfileOrDefault();
  const call = getPlantCallName(profile);
  const myPlant = PLANTS[profile.plantId] ? profile.plantId : "basil";
  const intent = understand(text);

  // 고민 얘기 중이 아닐 때 다른 주제가 나오면 고민 흐름은 끝내요
  if (!["worry", "chat", "crisis", "ok", "no"].includes(intent)) worryState = null;

  // 내가 방금 질문했으면, 이 말을 그 질문의 대답으로 이어받아요
  if (chatState.pending && !worryState && ["chat", "ok", "no", "happy", "worry"].includes(intent)) {
    if (intent !== "worry" || ["day", "best", "more"].includes(chatState.pending)) {
      answerPending(text, intent);
      return;
    }
  }
  if (intent !== "chat") setPending(null);

  switch (intent) {
    case "crisis":
      worryState = null;
      setTimeout(() => {
        pushMessage({
          role: "crisis",
          text: "지금 많이 힘들구나... 자살 예방 상담전화는 언제나 109로 연결돼 💛\n혼자가 아니야, 무슨 일 때문에 그래?",
        });
      }, 400);
      return;

    case "recipe": {
      const id = findPlant(text) || myPlant;
      const plant = PLANTS[id];
      reply(
        pick([
          plant.name + " 레시피 알려줄게! 🍽️ 직접 키워서 수확한 채소라 더 맛있고 건강해.",
          "좋아! " + plant.name + "(으)로 만드는 건강 레시피야 🥗 같이 만들어볼래?",
          "배고프구나? ㅎㅎ " + plant.name + " 레시피 바로 간다 🍳",
        ])
      );
      setTimeout(() => pushMessage({ type: "recipe", plantId: id }), 900);
      if (!findPlant(text)) {
        reply("다른 작물 레시피가 궁금하면 \"바질 레시피\"처럼 물어봐줘! 🌿", 1400);
      }
      return;
    }

    case "thanks":
      reply(
        pick([
          "에이~ 내가 더 고마워! 💚 " + call + " 지금 잎까지 뿌듯해하고 있어.",
          "고맙다는 말 들으니까 잎이 쑥 자라는 기분이야 🌱 히히",
          "천만에! 언제든 또 놀러와, 나는 늘 여기 있을게 😊",
          "그렇게 말해줘서 나도 힘이 나! 오늘도 같이 힘내자 ☀️",
          "별말씀을~ 우리 사이에! 💚 또 얘기하고 싶은 거 있으면 말해줘.",
        ])
      );
      return;

    case "bye":
      reply(
        pick([
          "잘 가! 오늘도 수고 많았어 🌙 나 물 주는 것도 잊지 마~ 💧",
          "내일 또 만나! 푹 쉬어야 해 💤",
          "안녕~ 좋은 꿈 꿔! 나도 화분 속에서 꿀잠 잘게 😴",
        ])
      );
      return;

    case "hello":
      reply(
        pick([
          "안녕 " + profile.name + josa(profile.name, "아", "야") + "! 🌱 오늘은 어떤 하루였어?",
          "반가워! 나 " + call + josa(call, "이", "") + "야, 오늘도 와줘서 고마워 😊 오늘 하루는 어땠어?",
          "하이하이~ 기다리고 있었어! " + selfStatus() + "\n오늘 너는 어떤 하루였어?",
        ])
      );
      setPending("day");
      return;

    case "who":
      reply(introLine(profile) + "\n네가 매일 돌봐줘서 쑥쑥 크고 있어! 고민 상담도, 레시피도, 나 키우는 법도 다 물어봐!");
      return;

    case "harvest": {
      const id = findPlant(text) || myPlant;
      const plan = GROWTH_PLANS[id];
      reply(subjectOf(id, myPlant) + " 수확까지 " + plan.range + " 걸려! (" + plan.note + ")\n'내 식물 기록'에 매주 사진을 올리면 다 자랄 때까지 같이 지켜볼 수 있어 📸");
      return;
    }

    case "water": {
      const id = findPlant(text) || myPlant;
      reply(
        subjectOf(id, myPlant) + " 물을 좋아해 💧 흙 겉이 손으로 만져서 말랐을 때 흠뻑 주면 돼!\n" +
          "과자봉지 화분은 아래에 구멍을 꼭 뚫어줘야 뿌리가 숨을 쉴 수 있어. '식물의 방'에서 물 주기도 해봐 🪴"
      );
      return;
    }

    case "sun": {
      const id = findPlant(text) || myPlant;
      reply(
        PLANT_FACTS[id] && !PLANT_FACTS[id].sun
          ? subjectOf(id, myPlant) + " 강한 햇빛보다 밝은 그늘을 좋아해 🌤️ 창가에서 살짝 떨어진 곳이 좋아!"
          : subjectOf(id, myPlant) + " 햇빛을 정말 좋아해 ☀️ 하루 4~6시간 정도 창가에 두면 쑥쑥 커!"
      );
      return;
    }

    case "sick": {
      const other = findPlant(text);
      const who = other && other !== myPlant ? PLANTS[other].name + josa(PLANTS[other].name, "이", "가") + " 아픈 것 같아?" : "나 어디 아파 보여?";
      reply(
        "헉, " + who + " 🥺 이렇게 확인해줘!\n" +
          "① 흙이 너무 축축하면 물을 잠깐 쉬어주고\n② 바싹 말랐으면 흠뻑 물 주기\n③ 잎이 노랗게 변하면 햇빛 잘 드는 곳으로 옮겨줘\n" +
          "그래도 걱정되면 '식물의 방' 상점의 영양제도 있어 🧪"
      );
      return;
    }

    case "happy":
      reply(
        pick([
          "우와 좋다!! 🎉 네가 기분 좋으니까 나도 잎이 반짝반짝해 ✨",
          "히히 나까지 신나! 무슨 좋은 일 있었는지 더 알려줘 😆",
          "최고야! 그런 얘기는 언제든 나 " + call + "한테 제일 먼저 자랑해줘 🌱",
          "좋은 기운 받았다~ 💚 그 기분 오래오래 가길!",
        ])
      );
      return;

    case "sorry":
      reply(pick(["괜찮아! 하나도 신경 쓰지 마 💚", "에이 미안할 거 없어~ 우리 사이잖아 😊"]));
      return;

    // ㅇㅇ·ㅇㅋ / ㄴㄴ 처럼 짧게 대답했을 때
    case "ok":
    case "no":
      if (worryState) {
        encourage(call);
        return;
      }
      reply(
        intent === "ok"
          ? pick(["응응! 😊 또 하고 싶은 얘기 있으면 말해줘!", "오키오키 👍 오늘 나 물은 줬어? 💧", "좋아좋아 🌱 다른 얘기도 해줘!"])
          : pick(["앗 아니구나! 그럼 어떤 얘기 해볼까? 🌱", "알겠어~ 그럼 오늘 있었던 일 하나만 알려줘 👀"])
      );
      return;

    case "worry": {
      const t = text.replace(/\s/g, "");
      const worry = WORRY_TAGS.find((w) => has(t, w.keywords));
      if (!worryState) {
        // 1단계: 일단 위로부터! 그다음 무슨 일인지 물어봐요
        worryState = worry;
        reply(pick(COMFORT_FIRST[worry.tag]));
        return;
      }
      encourage(call);
      return;
    }

    default: {
      // 고민 얘기 중이면 이어서 응원하고, 아니면 가볍게 대화해요
      if (worryState) {
        encourage(call);
        return;
      }
      // 네 말을 받아주고 → 내 얘기나 새 질문으로 이어가요 (같은 말 반복 X)
      const q = quoteOf(text, 18);
      const short = text.replace(/\s/g, "").length <= 3;
      if (!short && Math.random() < 0.45) {
        // 그 얘기를 더 듣고 싶어요 → 되묻고, 다음 말도 이어받기 (질문은 한 번에 하나만)
        reply(
          pick([
            "오 \"" + q + "\"? 더 자세히 알려줘! 👀",
            "헐 \"" + q + "\" 진짜?? 그래서 어떻게 됐어?",
            "\"" + q + "\" 그랬구나! 그때 기분은 어땠어?",
          ])
        );
        setPending("more");
        return;
      }
      // 받아주고 → 내 얘기 또는 새 질문
      const react = short
        ? pick(["응응! 😊", "오호~", "헤헤 그렇구나!", "웅웅 👀"])
        : pick(["\"" + q + "\" 그랬구나! 👀", "\"" + q + "\"… 네 얘기 듣는 거 너무 좋아 🌱", "오~ \"" + q + "\" 기억해둘게!"]);
      reply(react + "\n" + (Math.random() < 0.5 ? selfStatus() : nextQuestion()));
    }
  }
}

// 2단계: 응원 + 비슷한 고민을 가진 또래 친구 소개
function encourage(call) {
  const worry = worryState || WORRY_TAGS[0];
  worryState = null;
  reply(
    pick([
      "얘기해줘서 고마워. 넌 과자봉지 하나로 지구를 지키는 멋진 사람이야 💚\n나 " + call + "에게도 넌 세상에서 제일 소중한 사람이고!",
      "지금까지 정말 잘 버텨왔어. 오늘은 스스로를 꼭 안아주자 🫂\n나 " + call + josa(call, "이", "") + "도 네 옆에서 응원하고 있어 🌱",
      "그런 마음이 드는 건 당연해. 너무 혼자 다 짊어지지 마!\n천천히 가도 괜찮아, 식물도 하루아침에 크지 않잖아 🌿",
    ])
  );
  setTimeout(() => {
    pushMessage({ type: "friend", friend: worry.friend, tag: worry.tag });
    pushMessage({
      role: "ai",
      text:
        "비슷한 고민을 가진 예시(AI) 친구 " + VIRTUAL_FRIENDS[worry.friend].name + "을(를) 소개해줄게.\n" +
        "진짜 사람은 아니지만, " + VIRTUAL_FRIENDS[worry.friend].snackName + " 방에서 같이 얘기 나눌 수 있어!\n" +
        "위 버튼으로 놀러 가봐 🌿",
    });
  }, 1000);
}

function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;
  // 위기 신호는 욕 필터보다 먼저 - 욕이 섞여 있어도 109 안내가 나가요
  // 나쁜 말이 있으면 입력하지 않은 것으로 처리
  if (!isCrisis(text) && !checkKindWords(text)) {
    chatInput.value = "";
    return;
  }
  pushMessage({ role: "user", text: text });
  chatInput.value = "";
  respond(text);
  if (grantReward("chat-" + todayKey(), "내 식물에게 오늘 하루 말하기", POINT_RULES.dailyChat)) {
    showRewardReady("내 식물에게 오늘 하루 말하기", POINT_RULES.dailyChat);
  }
}

sendBtn.addEventListener("click", handleSend);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

initGreeting();
