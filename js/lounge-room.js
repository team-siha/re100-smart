// 과자 소통방 - 개별 방 채팅 (프로토타입: 또래 친구들이 대답해줘요)
// 위에는 이 방의 과자 캐릭터 하나만 테마로, 침대 위로 슬로우모션 털썩!

requireProfile();

const params = new URLSearchParams(window.location.search);
const roomId = params.get("id");
const rooms = loadLoungeRooms();
const room = rooms.find((r) => r.id === roomId) || { id: roomId, name: "소통방", charId: "yangparing", members: 1 };
const hostId = SNACK_CHARS[room.charId] ? room.charId : "yangparing";

document.getElementById("roomTitle").textContent = room.name;
document.getElementById("roomMembers").textContent = room.members || 1;
document.getElementById("stageName").textContent = SNACK_CHARS[hostId].name + " 방";
document.title = "RE100:SMART | " + room.name;
document.getElementById("roomChat").style.setProperty("--room-color", SNACK_CHARS[hostId].color);

// 같은 과자 캐릭터 셋이 시간차로 침대에 떨어져요
document.getElementById("fallers").innerHTML = [0, 1, 2]
  .map((i) => '<span class="faller f' + i + '">' + getSnackImg(hostId) + "</span>")
  .join("");

const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

let messages = loadLoungeMessages(roomId);

function renderMessages() {
  chatWindow.innerHTML =
    '<div class="rc-notice">' + escapeHtml(room.name) + "에 오신 걸 환영해요! 프로필을 누르면 친구 정보를 볼 수 있어요 🌱</div>";
  messages.forEach((m) => {
    const row = document.createElement("div");
    const time = '<span class="rc-time">' + formatChatTime(m.at) + "</span>";
    if (m.me) {
      row.className = "rc-row me";
      row.innerHTML = time + '<div class="rc-bubble">' + escapeHtml(m.text) + "</div>";
    } else {
      const friend = VIRTUAL_FRIENDS[m.user] || VIRTUAL_FRIENDS.haneul;
      row.className = "rc-row";
      row.innerHTML =
        '<button class="rc-avatar" data-user="' + (m.user || "haneul") + '" aria-label="' + friend.name + ' 프로필">' +
        getCharacterSvg(friend.plantId) + "</button>" +
        '<div class="rc-col"><span class="rc-name">' + friend.name +
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
  const f = VIRTUAL_FRIENDS[btn.dataset.user];
  if (!f) return;
  const mood = MOODS.find((m) => m.id === f.moodId) || MOODS[0];
  document.getElementById("pmChar").innerHTML = getCharacterSvg(f.plantId);
  document.getElementById("pmName").textContent = f.name;
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
  // 나쁜 말이 있으면 보내지 않아요
  if (!checkKindWords(text)) {
    chatInput.value = "";
    return;
  }
  pushMessage({ me: true, text: text });
  chatInput.value = "";

  const ids = Object.keys(VIRTUAL_FRIENDS);
  const user = ids[Math.floor(Math.random() * ids.length)];
  const f = VIRTUAL_FRIENDS[user];
  const replies = [
    "저도 요즘 비슷한 생각 많이 해요 :)",
    "오늘 우리 " + f.plantNickname + " 새 잎 났어요! 같이 축하해주세요~",
    "여기 계신 분들이랑 얘기하니까 덜 외롭네요 ㅎㅎ",
    "저도 " + f.snackName + " 봉지로 화분 만들었는데 반가워요!",
    "물 주는 거 까먹지 마세요~ 💧",
  ];
  setTimeout(() => {
    pushMessage({ me: false, user: user, text: replies[Math.floor(Math.random() * replies.length)] });
  }, 700);
}

sendBtn.addEventListener("click", handleSend);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

renderMessages();
