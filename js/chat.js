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
          "안녕 " + profile.name + "! 🌱 오늘은 어떤 하루였어?",
          "반가워! 나 " + call + josa(call, "이", "") + "야, 오늘도 와줘서 고마워 😊",
          "하이하이~ 기다리고 있었어! 무슨 얘기 해볼까?",
        ])
      );
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
      // 맹하게 맞장구치지 말고, 궁금해하면서 물어봐요
      reply(
        pick([
          "왜? 무슨 일인데?? 👀",
          "오 진짜? 그래서 어떻게 됐어?",
          "헐 대박! 왜 그런 거야?",
          "엥? 그게 무슨 말이야? 자세히 알려줘!",
          "오~ 언제 그랬어? 더 말해줘 ㅎㅎ",
          "그래서 너는 어땠는데? 기분은 괜찮아?",
          "근데 오늘 나 물은 줬어? 💧 ㅎㅎ",
        ])
      );
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
}

sendBtn.addEventListener("click", handleSend);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

initGreeting();
