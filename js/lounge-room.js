// 과자 소통방 - 개별 방 채팅 (프로토타입: 또래 친구들이 대답해줘요)
// 위에는 이 방의 과자 캐릭터 하나만 테마로, 침대 위로 슬로우모션 털썩!

requireProfile();

const params = new URLSearchParams(window.location.search);
const roomId = params.get("id");
const rooms = loadLoungeRooms();
const room = rooms.find((r) => r.id === roomId) || { id: roomId, name: "소통방", charId: "yangparing", members: 1 };
const hostId = SNACK_CHARS[room.charId] ? room.charId : "yangparing";

// 방 = 같은 과자봉지로 키우는 친구들의 모임! 이 방 친구들은 모두 이 방 과자봉지를 써요
const ROOM_SNACK = SNACK_CHARS[hostId].name;
function roomFriend(id) {
  return Object.assign({}, VIRTUAL_FRIENDS[id] || VIRTUAL_FRIENDS.haneul, { snackName: ROOM_SNACK });
}

document.getElementById("roomTitle").textContent = room.name;
document.getElementById("roomMembers").textContent = (room.builtin ? "AI 친구 " : "") + (room.members || 1);
document.getElementById("stageName").textContent = SNACK_CHARS[hostId].name + " 방";
document.title = "RE100:SMART | " + room.name;
// 과자봉지 색 그대로 화면 전체 배경 (진한 봉지면 이름·시간 글자는 흰색)
const roomChatEl = document.getElementById("roomChat");
roomChatEl.style.setProperty("--room-bag", SNACK_CHARS[hostId].bag);
roomChatEl.classList.toggle("dark-bag", !!SNACK_CHARS[hostId].dark);
document.body.style.background = SNACK_CHARS[hostId].bag;

// 과자 캐릭터들이 뒤에 빼곡히 모여 응원해요 (방 주인 과자는 가운데 크게)
const others = Object.keys(SNACK_CHARS).filter((id) => id !== hostId);
const crowdIds = others.slice(0, 4).concat(hostId, others.slice(4));
document.getElementById("crowd").innerHTML = crowdIds
  .map((id, i) => '<span class="cw' + (id === hostId ? " host" : "") + '" style="--i:' + i + '">' + getSnackImg(id) + "</span>")
  .join("");

// 상추들이 손잡고 뛰어놀아요 (캐릭터 사이사이 맞잡은 손)
const DANCERS = ["cheongSangchu", "basil", "jeokSangchu", "mint", "romaine"];
document.getElementById("dance").innerHTML = DANCERS.map(
  (id, i) =>
    (i ? '<span class="hand" style="--i:' + i + '"></span>' : "") +
    '<span class="dancer" style="--i:' + i + '"><img src="images/chars/' + id + '.webp" alt="" /></span>'
).join("");

const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

let messages = loadLoungeMessages(roomId);

function renderMessages() {
  chatWindow.innerHTML =
    '<div class="rc-notice">' + escapeHtml(room.name) + "에 오신 걸 환영해요! 프로필을 누르면 친구 정보를 볼 수 있어요 🌱</div>" +
    '<div class="ai-notice">🤖 이 방의 친구들은 미리 만들어둔 <b>예시(AI) 친구</b>예요. 진짜 사람이 아니에요.<br />' +
    "내 나이·성별 같은 정보는 이 방에 나오지 않아요.</div>";
  messages.forEach((m) => {
    const row = document.createElement("div");
    const time = '<span class="rc-time">' + formatChatTime(m.at) + "</span>";
    if (m.crisis) {
      row.className = "rc-crisis";
      row.innerHTML =
        "<b>📞 혼자 견디지 않아도 돼요</b>" + escapeHtml(CRISIS_HELP_TEXT) +
        '<a href="tel:109">109 전화하기</a>';
    } else if (m.me) {
      row.className = "rc-row me";
      row.innerHTML = time + '<div class="rc-bubble">' + escapeHtml(m.text) + "</div>";
    } else {
      const friend = roomFriend(m.user);
      row.className = "rc-row";
      row.innerHTML =
        '<button class="rc-avatar" data-user="' + (m.user || "haneul") + '" aria-label="' + friend.name + ' 프로필">' +
        getCharacterSvg(friend.plantId) + "</button>" +
        '<div class="rc-col"><span class="rc-name">' + friend.name + " " + AI_BADGE +
        ' <small>' + escapeHtml(formatProfileLine(friend).split("/").slice(1).join("/")) + "</small></span>" +
        '<div class="rc-line"><div class="rc-bubble">' + escapeHtml(m.text) + "</div>" + time + "</div></div>";
    }
    chatWindow.appendChild(row);
  });
  setLoungeReadCount(roomId, messages.length);
  window.scrollTo(0, document.body.scrollHeight);
}

// 프로필 팝업
chatWindow.addEventListener("click", (e) => {
  const btn = e.target.closest(".rc-avatar");
  if (!btn) return;
  if (!VIRTUAL_FRIENDS[btn.dataset.user]) return;
  const f = roomFriend(btn.dataset.user);
  const mood = MOODS.find((m) => m.id === f.moodId) || MOODS[0];
  document.getElementById("pmChar").innerHTML = getCharacterSvg(f.plantId);
  document.getElementById("pmName").innerHTML = escapeHtml(f.name) + " " + AI_BADGE;
  document.getElementById("pmLine").textContent = formatProfileLine(f);
  document.getElementById("pmMood").textContent = "오늘 상태 " + mood.emoji + " " + mood.label;
  document.getElementById("profileModal").classList.add("open");
});
document.getElementById("pmClose").addEventListener("click", () => document.getElementById("profileModal").classList.remove("open"));
document.getElementById("profileModal").addEventListener("click", (e) => {
  if (e.target.id === "profileModal") e.target.classList.remove("open");
});

function pushMessage(msg) {
  msg.at = Date.now();
  messages.push(msg);
  saveLoungeMessages(roomId, messages);
  renderMessages();
}

function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;
  // 위기 신호는 욕 필터보다 먼저 - 욕이 섞여 있어도 109 안내가 나가요
  if (isCrisis(text)) {
    pushMessage({ me: true, text: text });
    chatInput.value = "";
    replyCrisis();
    return;
  }
  // 나쁜 말이 있으면 보내지 않아요
  if (!checkKindWords(text)) {
    chatInput.value = "";
    return;
  }
  pushMessage({ me: true, text: text });
  chatInput.value = "";
  replyTo(text);
  if (grantReward("lounge-" + todayKey(), "소통방 인사하기", POINT_RULES.dailyLounge)) {
    showRewardReady("소통방 인사하기", POINT_RULES.dailyLounge);
  }
}

// 죽음·자살 얘기 → 109 안내 카드 + 친구들이 곁에 있어줘요
function replyCrisis() {
  setTimeout(() => pushMessage({ crisis: true }), 400);
  const user = pickFriend();
  say(user, pick([
    myName + "님… 그런 마음이 들 만큼 힘들었구나요. 여기 다 같이 있어요 🫂",
    "말해줘서 정말 고마워요 " + myName + "님. 혼자 견디지 마요, 109에 전화하면 바로 이야기 들어줘요 💛",
  ]), 1200);
  say(pickFriend([user]), pick(["무슨 일 있었는지 천천히 얘기해줘요. 들을게요", myName + "님 곁에 있을게요 💚"]), 1300);
}

// ---------------------------------------------------------------------
// 또래 친구들의 대답: 내 말을 듣고 맞춰서 반응해요
// ---------------------------------------------------------------------
const FRIEND_IDS = Object.keys(VIRTUAL_FRIENDS);
const myName = getCurrentNickname() || "친구";
const CHEERS = [
  "오오 축하축하~~ 🎉",
  "와 대박 축하해요!! 👏👏",
  "축하축하 🌱 사진도 보여주세요!",
  "우와 부럽다… 진짜 축하해요 ㅎㅎ",
  "축하합니다~~ 🥳 저도 힘내서 키워야지",
];
const ASK_RE = /축하해\s*주세요|축하해줘|같이 축하/;
const CONGRATS_RE = /축하|추카|ㅊㅋ|축하축하|대박|짱|멋지|부럽/;

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// 바로 전에 말한 친구들은 빼고 골라요
function pickFriend(exclude) {
  const recent = messages.slice(-3).filter((m) => !m.me).map((m) => m.user);
  const pool = FRIEND_IDS.filter((id) => !(exclude || []).includes(id) && !recent.includes(id));
  return pick(pool.length ? pool : FRIEND_IDS.filter((id) => !(exclude || []).includes(id)));
}

// 친구가 '입력 중…'인 것처럼 조금 기다렸다가 말해요
let replyChain = Promise.resolve();
function say(user, text, delay) {
  replyChain = replyChain.then(
    () =>
      new Promise((resolve) => {
        setTimeout(() => {
          pushMessage({ me: false, user: user, text: text });
          resolve();
        }, delay);
      })
  );
}

// 아직 다 축하받지 못한 '축하해주세요' 글 (최근 메시지 중)
function openCelebration() {
  for (let i = messages.length - 1; i >= Math.max(0, messages.length - 8); i--) {
    const m = messages[i];
    if (m.celebrated) return null;
    if (!m.me && ASK_RE.test(m.text)) return { user: m.user, index: i };
  }
  return null;
}

// 친구가 축하해달라고 하면 다른 친구들이 먼저 "오오 축하축하~~" 하며 분위기를 띄워요
function askCelebration(user, text) {
  say(user, text, 900);
  const first = pickFriend([user]);
  say(first, pick(CHEERS), 1300);
  say(pickFriend([user, first]), pick(CHEERS.filter((c) => c !== CHEERS[0])), 1100);
}

function replyTo(text) {
  const t = text.replace(/\s+/g, " ");
  const party = openCelebration();

  // 1) 내가 축하해주면 → 축하받은 친구가 고마워해요
  if (party && CONGRATS_RE.test(t)) {
    const f = roomFriend(party.user);
    say(
      party.user,
      pick([
        myName + "님 고마워요!! 🥹 " + f.plantNickname + "도 기뻐할 거예요",
        "헉 " + myName + "님까지 축하해주시다니 ㅠㅠ 감동이에요 💚",
        "고마워요 " + myName + "님!! 다음엔 " + myName + "님 식물 소식도 들려주세요 ㅎㅎ",
      ]),
      900
    );
    if (Math.random() < 0.5) say(pickFriend([party.user]), pick(["역시 이 방 분위기 최고 👍", "다 같이 축하하니까 좋다 ㅎㅎ", "저도 언젠간 축하받고 싶다 🌱"]), 1400);
    // 축하가 끝났으니 표시를 지워요 (같은 친구가 계속 고마워하지 않게)
    messages[party.index].celebrated = true;
    saveLoungeMessages(roomId, messages);
    return;
  }

  const user = pickFriend();
  const f = roomFriend(user);

  // 2) 내 좋은 소식 → 친구들이 축하해줘요
  if (/새 잎|싹|수확|자랐|컸|피었|성공|합격|생일|해냈/.test(t) && !/\?|안 |못 /.test(t)) {
    say(user, pick(["오오 " + myName + "님 축하해요!! 🎉", "와 진짜요? 축하축하~~ 👏"]), 900);
    say(pickFriend([user]), pick(CHEERS), 1200);
    return;
  }
  // 3) 힘들다고 하면 → 먼저 위로해요
  if (/힘들|우울|외로|피곤|슬퍼|슬프|지쳐|지친|속상|짜증|불안|스트레스|ㅠ|ㅜ/.test(t)) {
    say(user, pick([
      myName + "님 오늘 많이 힘드셨구나… 여기선 편하게 얘기해도 돼요 🫂",
      "토닥토닥… 무슨 일 있었어요? 들어줄게요",
      "저도 그런 날 있어요. 그럴 땐 " + f.plantNickname + " 물 주면서 잠깐 쉬어요 🌱",
    ]), 1000);
    if (Math.random() < 0.5) say(pickFriend([user]), pick(["힘내요 " + myName + "님!! 💚", "오늘은 푹 자요, 내일은 더 나을 거예요"]), 1300);
    return;
  }
  // 4) 인사
  if (/안녕|하이|ㅎㅇ|반가|처음|왔어요|들어왔/.test(t)) {
    say(user, pick(["안녕하세요 " + myName + "님!! 반가워요 👋", "오 " + myName + "님 어서 와요~ 🌱 뭐 키우세요?"]), 800);
    const other = pickFriend([user]);
    if (Math.random() < 0.6) say(other, "반가워요! 저도 " + ROOM_SNACK + " 봉지에 " + VIRTUAL_FRIENDS[other].plantNickname + " 키워요 ㅎㅎ 같은 봉지 친구네요!", 1200);
    return;
  }
  // 5) 고맙다고 하면
  if (/고마|감사|땡큐|ㄱㅅ/.test(t)) {
    say(user, pick(["에이 별말씀을요 ㅎㅎ", "언제든지요!! 😊", "저희끼리 돕고 살아야죠 💚"]), 800);
    return;
  }
  // 6) 질문하면 → 아는 만큼 대답해요
  if (/\?|어떻게|뭐|왜|언제|어디|얼마나|몇/.test(t)) {
    say(user, pick([
      "음 저는 해 잘 드는 창가에 두고 흙 마르면 물 줘요!",
      "좋은 질문! 저도 궁금했는데 새싹톡한테 물어보니까 잘 알려주던데요 ㅎㅎ",
      "저도 " + f.snackName + " 봉지에 키우는데 매일 조금씩 크는 게 보여서 신기해요 ㅎㅎ",
      "그거 저도 궁금해요!! 아시는 분~? 🙋",
    ]), 1000);
    return;
  }
  // 7) 웃으면 같이 웃어요
  if (/ㅋㅋ|ㅎㅎ|웃기|재밌/.test(t)) {
    say(user, pick(["ㅋㅋㅋㅋ 공감", "ㅎㅎㅎ 이 방 너무 웃겨요", "ㅋㅋㅋ " + myName + "님 텐션 좋다"]), 800);
    return;
  }

  // 8) 그 밖에는 맞장구 + 가끔 친구가 자기 소식을 꺼내요
  say(user, pick([
    "오 " + myName + "님 말 공감돼요 :)",
    "맞아요 저도 그렇게 생각해요!",
    "헐 그랬구나… 더 얘기해줘요 ㅎㅎ",
    "여기서 얘기하니까 덜 외롭네요 ㅎㅎ",
  ]), 900);
  const r = Math.random();
  if (r < 0.35) {
    const asker = pickFriend([user]);
    const a = roomFriend(asker);
    askCelebration(asker, pick([
      "저 오늘 " + a.plantNickname + " 새 잎 났어요!! 축하해주세요 🌱",
      "드디어 " + a.plantNickname + " 첫 수확했어요 ㅠㅠ 축하해주세요!",
      a.snackName + " 봉지 화분 3주차인데 키가 두 배 됐어요! 같이 축하해줘요~",
    ]));
  } else if (r < 0.55) {
    say(pickFriend([user]), "물 주는 거 까먹지 마세요~ 💧", 1500);
  }
}

sendBtn.addEventListener("click", handleSend);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

renderMessages();
