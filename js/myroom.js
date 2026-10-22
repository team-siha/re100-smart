// ④ 식물의 방 - 화분이 집, 흙이 이불, 잎이 지붕! 내 작물 캐릭터가 그 안에서 쿨쿨 자요.
// 위: 식물의 방 / 가운데: 오늘의 질문 / 아래: 200~1500P 상점 (꾸미기는 바로 구매, 실물은 장바구니)

requireProfile();
renderTabbar("room");

const VB = 'viewBox="0 0 360 420" preserveAspectRatio="none"';

// 방 뒤쪽: 벽, 창문(밤하늘), 잎 지붕, 반딧불, 이슬 모빌, 화분 안쪽
function buildBack(owned) {
  const has = (id) => owned.includes(id);
  let s = '<svg ' + VB + ' aria-hidden="true">';
  // 벽 + 바닥
  s += '<rect width="360" height="420" fill="#fff8dc"/>';
  s += '<g fill="#fff" opacity=".9"><circle cx="40" cy="190" r="3"/><circle cx="320" cy="200" r="3"/><circle cx="70" cy="300" r="2.5"/><circle cx="300" cy="310" r="2.5"/><circle cx="25" cy="250" r="2"/><circle cx="338" cy="260" r="2"/></g>';
  s += '<path d="M0 360 C80 350 280 350 360 360 V420 H0Z" fill="#dcf3df"/>';
  s += '<ellipse cx="180" cy="410" rx="140" ry="14" fill="#c8efc4"/>';
  // 밤하늘 창문 (자는 시간)
  s += '<g transform="translate(22 26)"><rect width="74" height="64" rx="16" fill="#cfe3ff" stroke="#fff" stroke-width="6"/>' +
    '<circle cx="50" cy="22" r="11" fill="#fff6c2"/><circle cx="55" cy="18" r="10" fill="#cfe3ff"/>' +
    '<g fill="#fff"><circle cx="18" cy="16" r="2"/><circle cx="28" cy="40" r="1.6"/><circle cx="58" cy="48" r="1.8"/></g>' +
    '<path d="M37 0 V64 M0 32 H74" stroke="#fff" stroke-width="3"/></g>';

  // 잎 지붕 (화분 양쪽에서 올라와 아치를 만들어요)
  s += '<path d="M72 262 C40 190 70 90 175 70 C120 110 100 180 110 262 Z" fill="#7cc68a"/>';
  s += '<path d="M288 262 C320 190 290 90 185 70 C240 110 260 180 250 262 Z" fill="#8fd19e"/>';
  s += '<path d="M90 250 C80 190 110 120 170 84" stroke="#5fae6f" stroke-width="3" fill="none" stroke-linecap="round"/>';
  s += '<path d="M270 250 C280 190 250 120 190 84" stroke="#6cbf6a" stroke-width="3" fill="none" stroke-linecap="round"/>';
  s += '<path d="M180 40 C150 52 148 82 180 96 C212 82 210 52 180 40Z" fill="#a6dca6"/><path d="M180 46 V92" stroke="#6cbf6a" stroke-width="2.5"/>';

  if (has("leaf_roof")) {
    s += '<path d="M60 200 C20 170 30 120 70 110 C70 150 70 175 60 200Z" fill="#a6dca6"/>';
    s += '<path d="M300 200 C340 170 330 120 290 110 C290 150 290 175 300 200Z" fill="#7cc68a"/>';
    s += '<path d="M120 90 C100 60 120 30 150 30 C145 55 140 75 120 90Z" fill="#8fd19e"/>';
    s += '<path d="M240 90 C260 60 240 30 210 30 C215 55 220 75 240 90Z" fill="#a6dca6"/>';
    [[96, 150], [264, 150], [150, 70], [214, 70], [180, 38]].forEach(([x, y]) => {
      s += '<g transform="translate(' + x + " " + y + ')" fill="#fff"><circle cx="0" cy="-5" r="4.5"/><circle cx="5" cy="-1" r="4.5"/><circle cx="3" cy="5" r="4.5"/><circle cx="-3" cy="5" r="4.5"/><circle cx="-5" cy="-1" r="4.5"/><circle r="3" fill="#ffd96b"/></g>';
    });
  }
  if (has("firefly_lamp")) {
    s += '<path d="M96 170 Q180 120 264 170" stroke="#8a7a5c" stroke-width="1.5" fill="none"/>';
    [[110, 160], [135, 147], [160, 140], [185, 139], [210, 142], [235, 150], [255, 162]].forEach(([x, y], i) => {
      s += '<circle class="firefly" style="animation-delay:' + i * 0.3 + 's" cx="' + x + '" cy="' + (y + 6) + '" r="5" fill="' + (i % 2 ? "#ffd96b" : "#fff3b0") + '"/>';
    });
  }
  if (has("dew_mobile")) {
    s += '<g class="mobile"><path d="M180 96 V112 M150 112 H210 M150 112 V130 M180 112 V140 M210 112 V126" stroke="#a87b52" stroke-width="1.5" fill="none"/>' +
      '<path d="M150 130 C146 138 146 142 150 144 C154 142 154 138 150 130Z" fill="#8edcc3"/>' +
      '<path d="M180 140 C175 149 175 154 180 156 C185 154 185 149 180 140Z" fill="#b8ecff"/>' +
      '<path d="M210 126 C206 134 206 138 210 140 C214 138 214 134 210 126Z" fill="#8edcc3"/></g>';
  }
  // 화분 안쪽 (뒤 테두리)
  s += '<ellipse cx="180" cy="258" rx="128" ry="20" fill="#8a6440"/>';
  s += "</svg>";
  return s;
}

// 방 앞쪽: 흙 이불 + 화분 집(문, 창문, 문패)
function buildFront(owned, callName) {
  const has = (id) => owned.includes(id);
  const ceramic = has("ceramic_pot");
  const pot = ceramic ? "#8edcc3" : "#ffbf94";
  const potDark = ceramic ? "#5fbfa2" : "#f0a070";
  const rim = ceramic ? "#a8e8d4" : "#ffcfaa";
  let s = '<svg ' + VB + ' aria-hidden="true">';
  if (has("flower_blanket")) {
    s += '<defs><pattern id="quilt" width="26" height="26" patternUnits="userSpaceOnUse">' +
      '<rect width="26" height="26" fill="#b98a5c"/><rect width="13" height="13" fill="#c99b6d"/><rect x="13" y="13" width="13" height="13" fill="#c99b6d"/>' +
      '<g fill="#fff"><circle cx="6.5" cy="4.5" r="2"/><circle cx="9" cy="6.5" r="2"/><circle cx="6.5" cy="9" r="2"/><circle cx="4" cy="6.5" r="2"/></g><circle cx="6.5" cy="6.5" r="1.4" fill="#ffd96b"/></pattern></defs>';
  }
  // 흙 이불 (캐릭터 가슴까지 덮어줘요)
  s += '<path d="M54 262 C62 240 92 232 124 238 C146 242 160 232 182 234 C206 236 226 228 252 234 C280 240 300 244 306 262 Z" fill="' + (has("flower_blanket") ? "url(#quilt)" : "#a87b52") + '"/>';
  s += '<path d="M62 250 C92 238 120 244 140 244" stroke="#d8ad7e" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="' + (has("flower_blanket") ? "6 5" : "0") + '"/>';
  if (!has("flower_blanket")) {
    s += '<g fill="#8a6440"><circle cx="110" cy="250" r="3"/><circle cx="200" cy="246" r="2.5"/><circle cx="250" cy="252" r="3"/><circle cx="160" cy="254" r="2"/></g>';
  }
  // 화분 테두리 + 몸통 (= 집)
  s += '<rect x="48" y="256" width="264" height="26" rx="13" fill="' + rim + '"/>';
  s += '<path d="M64 280 H296 L270 404 Q268 412 258 412 H102 Q92 412 90 404 Z" fill="' + pot + '"/>';
  if (ceramic) {
    s += '<g fill="#fff" opacity=".55"><circle cx="100" cy="300" r="4"/><circle cx="260" cy="300" r="4"/><circle cx="120" cy="390" r="3"/><circle cx="240" cy="390" r="3"/><circle cx="180" cy="300" r="3"/></g>';
    s += '<path d="M80 340 Q180 356 282 340" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>';
  }
  // 창문 두 개 + 아치 문
  s += '<g><circle cx="116" cy="336" r="16" fill="#fff6c2" stroke="' + potDark + '" stroke-width="4"/><path d="M116 320 V352 M100 336 H132" stroke="' + potDark + '" stroke-width="3"/></g>';
  s += '<g><circle cx="244" cy="336" r="16" fill="#fff6c2" stroke="' + potDark + '" stroke-width="4"/><path d="M244 320 V352 M228 336 H260" stroke="' + potDark + '" stroke-width="3"/></g>';
  s += '<path d="M160 412 V378 A20 20 0 0 1 200 378 V412 Z" fill="' + potDark + '"/><circle cx="192" cy="394" r="2.5" fill="#fff6c2"/>';
  // 문패
  s += '<rect x="126" y="292" width="108" height="24" rx="12" fill="#fff"/>';
  s += '<text x="180" y="309" text-anchor="middle" font-size="13" font-weight="800" fill="#2f7a45" font-family="Pretendard, sans-serif">' + escapeHtml(callName) + "네 집</text>";
  s += "</svg>";
  return s;
}

// 상점 썸네일
const ITEM_ART = {
  leaf_roof: '<svg viewBox="0 0 60 60"><path d="M8 50 C2 30 14 10 30 8 C22 22 20 36 22 50Z" fill="#7cc68a"/><path d="M52 50 C58 30 46 10 30 8 C38 22 40 36 38 50Z" fill="#a6dca6"/><g transform="translate(30 20)" fill="#fff"><circle cy="-4" r="4"/><circle cx="4" cy="0" r="4"/><circle cx="2" cy="5" r="4"/><circle cx="-2" cy="5" r="4"/><circle cx="-4" cy="0" r="4"/><circle r="2.6" fill="#ffd96b"/></g></svg>',
  flower_blanket: '<svg viewBox="0 0 60 60"><path d="M6 40 C10 26 22 22 30 26 C38 22 50 26 54 40 Z" fill="#c99b6d"/><path d="M6 40 H54 L52 48 H8Z" fill="#b98a5c"/><g fill="#fff"><circle cx="20" cy="33" r="2.6"/><circle cx="23" cy="35" r="2.6"/><circle cx="20" cy="37" r="2.6"/><circle cx="17" cy="35" r="2.6"/><circle cx="38" cy="32" r="2.6"/><circle cx="41" cy="34" r="2.6"/><circle cx="38" cy="36" r="2.6"/><circle cx="35" cy="34" r="2.6"/></g><circle cx="20" cy="35" r="1.6" fill="#ffd96b"/><circle cx="38" cy="34" r="1.6" fill="#ffd96b"/></svg>',
  firefly_lamp: '<svg viewBox="0 0 60 60"><path d="M4 18 Q30 40 56 18" stroke="#8a7a5c" stroke-width="2" fill="none"/><g><circle cx="12" cy="26" r="5" fill="#ffd96b"/><circle cx="24" cy="31" r="5" fill="#fff3b0"/><circle cx="36" cy="31" r="5" fill="#ffd96b"/><circle cx="48" cy="26" r="5" fill="#fff3b0"/></g><circle cx="24" cy="31" r="10" fill="#ffd96b" opacity=".25"/></svg>',
  dew_mobile: '<svg viewBox="0 0 60 60"><path d="M30 4 V14 M12 14 H48 M12 14 V30 M30 14 V38 M48 14 V26" stroke="#a87b52" stroke-width="2" fill="none"/><path d="M12 30 C7 39 7 44 12 46 C17 44 17 39 12 30Z" fill="#8edcc3"/><path d="M30 38 C25 47 25 52 30 54 C35 52 35 47 30 38Z" fill="#b8ecff"/><path d="M48 26 C43 35 43 40 48 42 C53 40 53 35 48 26Z" fill="#8edcc3"/></svg>',
  butterfly: '<svg viewBox="0 0 60 60"><ellipse cx="19" cy="24" rx="14" ry="12" fill="#ffbf94"/><ellipse cx="41" cy="24" rx="14" ry="12" fill="#ffd96b"/><ellipse cx="21" cy="40" rx="9" ry="8" fill="#ffd96b"/><ellipse cx="39" cy="40" rx="9" ry="8" fill="#ffbf94"/><rect x="28" y="16" width="4" height="30" rx="2" fill="#6b5a3a"/></svg>',
  ceramic_pot: '<svg viewBox="0 0 60 60"><rect x="8" y="14" width="44" height="9" rx="4.5" fill="#a8e8d4"/><path d="M11 22 H49 L44 52 H16Z" fill="#8edcc3"/><path d="M14 34 Q30 39 46 34" stroke="#fff" stroke-width="2.5" fill="none"/><g fill="#fff"><circle cx="20" cy="28" r="2"/><circle cx="40" cy="28" r="2"/><circle cx="30" cy="45" r="2"/></g></svg>',
  real_nutrient: '<svg viewBox="0 0 60 60"><rect x="22" y="6" width="16" height="8" rx="3" fill="#ffbf94"/><path d="M20 14 H40 V22 L46 30 V50 A4 4 0 0 1 42 54 H18 A4 4 0 0 1 14 50 V30 L20 22Z" fill="#8edcc3"/><rect x="18" y="32" width="24" height="14" rx="4" fill="#fff"/><path d="M30 44 V36" stroke="#6cbf6a" stroke-width="2.4" stroke-linecap="round"/><path d="M30 38 C26 38 25 35 25.5 33 C28.5 33 30 35 30 38Z" fill="#8fd19e"/></svg>',
  real_seedkit: '<svg viewBox="0 0 60 60"><path d="M14 8 H46 V52 H14Z" fill="#ffd96b"/><path d="M14 8 L18 4 L22 8 L26 4 L30 8 L34 4 L38 8 L42 4 L46 8" fill="none" stroke="#ffd96b" stroke-width="2"/><circle cx="30" cy="28" r="11" fill="#fff"/><path d="M30 36 V26" stroke="#6cbf6a" stroke-width="2.4" stroke-linecap="round"/><path d="M30 29 C25 29 24 25 24.5 23 C28 23 30 25 30 29Z" fill="#8fd19e"/><path d="M30 27 C35 27 36 23 35.5 21 C32 21 30 23 30 27Z" fill="#7cc68a"/><rect x="20" y="42" width="20" height="4" rx="2" fill="#fff"/></svg>',
};

function getPoints() {
  const profile = loadProfile();
  return profile ? profile.points || 0 : 0;
}

function refreshHeader() {
  document.getElementById("headerPoints").textContent = getPoints();
}

function renderStatus() {
  const profile = loadProfile();
  const call = getPlantCallName(profile);
  document.getElementById("rsTitle").textContent = call + "의 방";
  document.getElementById("rsName").textContent = profile.name || getCurrentNickname();
  document.getElementById("rsPlant").textContent = call;
  document.getElementById("rsDays").textContent = getDaysTogether(profile);
}

function renderRoom() {
  const room = loadMyRoom();
  const profile = loadProfile();
  document.getElementById("roomBack").innerHTML = buildBack(room.owned);
  document.getElementById("roomFront").innerHTML = buildFront(room.owned, getPlantCallName(profile));
  document.getElementById("roomChar").innerHTML = getSleepingImg(profile.plantId);
  document.getElementById("butterfly").style.display = room.owned.includes("butterfly") ? "block" : "none";
}

let popTimer = null;
function showPop(text) {
  const pop = document.getElementById("roomPop");
  pop.textContent = text;
  pop.classList.add("show");
  clearTimeout(popTimer);
  popTimer = setTimeout(() => pop.classList.remove("show"), 1800);
}

function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

// 자는 식물을 누르면 쉿!
document.getElementById("roomChar").addEventListener("click", () => {
  replay(document.getElementById("roomChar"), "wiggle");
  showPop("쿨쿨… " + getPlantCallName(loadProfile()) + " 자는 중이에요. 쉿! 🤫");
});

// ---------------- 깨우기 (무료) ----------------
// 깨우면 화분에서 나와 옆에 서서 "안뇽!" 하고 말을 걸어요
let awake = false;
let sayTimer = null;

const AWAKE_LINES = [
  "안뇽! 나야 나, {n}! 👋",
  "으음~ 잘 잤다! 안뇽! ☀️",
  "안뇽! 오늘도 와줘서 고마워 💚",
  "안뇽! 나 어제보다 쑥 컸지? 🌱",
  "안뇽! 물 한 모금 줄래? 💧",
];

function say(text, keep) {
  const bubble = document.getElementById("awakeSay");
  bubble.textContent = text;
  replay(bubble, "show");
  clearTimeout(sayTimer);
  if (!keep) sayTimer = setTimeout(() => bubble.classList.remove("show"), 2600);
}

function renderAwake() {
  const profile = loadProfile();
  const room = document.getElementById("plantRoom");
  room.classList.toggle("is-awake", awake);
  document.getElementById("wakeIc").textContent = awake ? "🌙" : "☀️";
  document.getElementById("wakeLabel").textContent = awake ? "다시 재우기" : "깨우기";
  document.getElementById("wakeSub").textContent = awake ? getPlantCallName(profile) + " 깨어있어요" : "쿨쿨 자는 중";
  document.getElementById("awakeChar").innerHTML = getCharacterSvg(profile.plantId);
}

document.getElementById("wakeBtn").addEventListener("click", () => {
  awake = !awake;
  renderAwake();
  const call = getPlantCallName(loadProfile());
  if (awake) {
    replay(document.getElementById("awakeChar"), "hop-out");
    const line = AWAKE_LINES[Math.floor(Math.random() * AWAKE_LINES.length)].replace("{n}", call);
    setTimeout(() => say(line, true), 450);
  } else {
    document.getElementById("awakeSay").classList.remove("show");
    showPop("잘 자, " + call + " 🌙");
  }
});

// 깨어있는 식물을 누르면 또 말을 걸어요
document.getElementById("awakeChar").addEventListener("click", () => {
  const call = getPlantCallName(loadProfile());
  const lines = ["간지러워~ 히히 😆", "안뇽! 또 왔네? 🌿", call + " 기분 최고야!", "같이 햇빛 쬘래? ☀️"];
  replay(document.getElementById("awakeChar"), "hop");
  say(lines[Math.floor(Math.random() * lines.length)]);
});

// ---------------- 물 주기 (무료) ----------------
// 마지막으로 물 준 뒤 1시간마다 촉촉함이 4%씩 줄어요
function waterLevel(room) {
  if (!room.lastWater) return 20;
  const hours = (Date.now() - room.lastWater) / 3600000;
  return Math.max(0, Math.round(100 - hours * 4));
}

function renderWater() {
  const level = waterLevel(loadMyRoom());
  const gauge = document.getElementById("waterGauge");
  gauge.style.width = level + "%";
  gauge.style.background = level > 50 ? "#8edcc3" : level > 20 ? "#ffd96b" : "#ffbf94";
  document.getElementById("waterLevelText").textContent =
    "촉촉함 " + level + "%" + (level < 30 ? " · 목말라요!" : "");
}

let watering = false;
document.getElementById("waterBtn").addEventListener("click", () => {
  if (watering) return;
  watering = true;
  const room = loadMyRoom();
  const wasFull = waterLevel(room) >= 95;
  room.lastWater = Date.now();
  saveMyRoom(room);

  const plantRoom = document.getElementById("plantRoom");
  replay(plantRoom, "watering");
  const call = getPlantCallName(loadProfile());
  setTimeout(() => {
    renderWater();
    if (awake) say(wasFull ? "배불러~ 그래도 고마워! 😋" : "시원하다~ 고마워! 💧");
    else showPop(wasFull ? "이미 촉촉해요! " + call + " 배불러요 😋" : "꿀꺽꿀꺽~ " + call + " 물 마셨어요 💧");
  }, 1300);
  setTimeout(() => {
    plantRoom.classList.remove("watering");
    watering = false;
  }, 2200);
});

function renderQuestion() {
  const room = loadMyRoom();
  const call = getPlantCallName(loadProfile());
  document.getElementById("questionText").textContent = DAILY_QUESTIONS[dailyQuestionIndex()].text.replace("{n}", call);

  const answer = room.answers[todayKey()];
  const view = document.getElementById("answerView");
  view.style.display = answer ? "block" : "none";
  view.textContent = answer ? "💬 " + answer : "";
  document.getElementById("answerInput").placeholder = answer
    ? "대답을 바꾸고 싶다면 다시 적어주세요"
    : "내 " + call + "에게 대답해주세요 (오늘 첫 대답 +" + POINT_RULES.dailyAnswer + "P)";
}

document.getElementById("answerBtn").addEventListener("click", () => {
  const input = document.getElementById("answerInput");
  const text = input.value.trim();
  if (!text) return;
  // 나쁜 말이 있으면 입력하지 않은 것으로 처리
  if (!checkKindWords(text)) {
    input.value = "";
    return;
  }
  const room = loadMyRoom();
  const first = !room.answers[todayKey()];
  room.answers[todayKey()] = text;
  saveMyRoom(room);
  if (first && grantReward("answer-" + todayKey(), "오늘의 질문 대답", POINT_RULES.dailyAnswer)) {
    showRewardReady("오늘의 질문 대답", POINT_RULES.dailyAnswer);
  }
  input.value = "";
  refreshHeader();
  renderQuestion();
  renderShop();
});

function renderShop() {
  const grid = document.getElementById("shopGrid");
  const room = loadMyRoom();
  const points = getPoints();
  grid.innerHTML = "";

  ROOM_ITEMS.forEach((item) => {
    const owned = item.kind === "room" && room.owned.includes(item.id);
    const card = document.createElement("div");
    card.className = "shop-card" + (owned ? " owned" : "") + (item.kind === "goods" ? " goods" : "");
    card.innerHTML =
      (item.kind === "goods" ? '<span class="sc-tag">실물 배송</span>' : "") +
      '<div class="sc-art">' + ITEM_ART[item.id] + "</div>" +
      '<div class="sc-name">' + item.name + "</div>" +
      '<div class="sc-desc">' + item.desc + "</div>" +
      '<div class="sc-cost">' + item.cost.toLocaleString() + "P</div>";

    const btn = document.createElement("button");
    btn.className = "shop-buy-btn";
    if (item.kind === "goods") {
      btn.textContent = "장바구니 담기";
      btn.addEventListener("click", () => {
        addToCart({ id: item.id, name: item.name, cost: item.cost, icon: item.id === "real_seedkit" ? "record" : "nutrient" });
        btn.textContent = "담았어요 🛒";
        setTimeout(() => (btn.textContent = "장바구니 담기"), 1400);
      });
    } else if (owned) {
      btn.textContent = "방에 놓였어요";
      btn.disabled = true;
    } else {
      btn.textContent = points >= item.cost ? "구매하기" : item.cost - points + "P 부족";
      btn.classList.toggle("short", points < item.cost);
      btn.addEventListener("click", () => {
        if (spendPoints(item.cost)) {
          room.owned.push(item.id);
          saveMyRoom(room);
          refreshHeader();
          renderRoom();
          renderShop();
          document.getElementById("plantRoom").scrollIntoView({ behavior: "smooth" });
        } else {
          showAlert("필요: " + item.cost + "P / 보유: " + getPoints() + "P\n오늘의 질문 · 식물 사진 · 자격증으로 포인트를 모아보세요 🌱", { type: "warn", title: "포인트가 부족해요" });
        }
      });
    }
    card.appendChild(btn);
    grid.appendChild(card);
  });
}

renderStatus();
refreshHeader();
renderRoom();
renderAwake();
renderWater();
renderQuestion();
renderShop();
