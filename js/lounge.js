// ⑥ 과자 소통방 목록 - 카톡 채팅 목록 스타일 (기본 방 4개 + 유저가 만든 방)

requireProfile();
renderTabbar("lounge");

let currentFilter = "all";
let pickedChar = "yangparing";

function roomSummary(room) {
  const messages = loadLoungeMessages(room.id);
  const last = messages[messages.length - 1];
  const unread = Math.max(0, messages.length - getLoungeReadCount(room.id));
  let preview = "아직 대화가 없어요. 먼저 인사해보세요!";
  if (last) {
    const friend = VIRTUAL_FRIENDS[last.user];
    preview = (last.me ? "나: " : friend ? friend.name + "(AI): " : "") + last.text;
  }
  return { last, unread, preview };
}

function renderRoomList() {
  const rooms = loadLoungeRooms();
  const list = document.getElementById("roomList");
  list.innerHTML = "";

  let unreadTotal = 0;
  const rows = rooms.map((room) => ({ room, s: roomSummary(room) }));
  rows.forEach((r) => (unreadTotal += r.s.unread));
  document.getElementById("unreadTotal").textContent = unreadTotal;

  // 최근 대화 순으로 정렬
  rows.sort((a, b) => ((b.s.last && b.s.last.at) || 0) - ((a.s.last && a.s.last.at) || 0));

  rows
    .filter((r) => currentFilter === "all" || (currentFilter === "unread" ? r.s.unread > 0 : !r.room.builtin))
    .forEach(({ room, s }) => {
      const charId = room.charId || "yangparing";
      const li = document.createElement("li");
      li.innerHTML =
        '<a class="talk-row" href="lounge-room.html?id=' + encodeURIComponent(room.id) + '">' +
        '<span class="talk-avatar" style="background:' + SNACK_CHARS[charId].color + '">' + getSnackImg(charId) + "</span>" +
        '<span class="talk-body"><span class="talk-name">' + escapeHtml(room.name) +
        ' <em>' + (room.builtin ? "AI 친구 " : "") + (room.members || 1) + "</em></span>" +
        '<span class="talk-preview">' + escapeHtml(s.preview) + "</span></span>" +
        '<span class="talk-meta"><span class="talk-time">' + formatChatTime(s.last && s.last.at) + "</span>" +
        (s.unread ? '<span class="talk-badge">' + s.unread + "</span>" : "") + "</span>" +
        "</a>";
      list.appendChild(li);
    });

  if (!list.children.length) {
    list.innerHTML = '<li class="talk-empty">' + (currentFilter === "mine" ? "아직 만든 방이 없어요. ＋ 를 눌러 만들어보세요!" : "모두 읽었어요 🌿") + "</li>";
  }
}

document.getElementById("filters").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  document.querySelectorAll("#filters button").forEach((b) => b.classList.toggle("on", b === btn));
  renderRoomList();
});

function renderCharPicker() {
  const picker = document.getElementById("charPicker");
  picker.innerHTML = "";
  Object.keys(SNACK_CHARS).forEach((id) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tc-char" + (id === pickedChar ? " on" : "");
    b.style.background = SNACK_CHARS[id].color;
    b.innerHTML = getSnackImg(id) + "<span>" + SNACK_CHARS[id].name + "</span>";
    b.addEventListener("click", () => {
      pickedChar = id;
      renderCharPicker();
    });
    picker.appendChild(b);
  });
}

document.getElementById("openCreateBtn").addEventListener("click", () => {
  document.getElementById("createPanel").classList.toggle("open");
});

document.getElementById("createRoomBtn").addEventListener("click", () => {
  const nameInput = document.getElementById("newRoomName");
  const name = nameInput.value.trim();
  if (!name) {
    showAlert("새로 만들 과자 방의 이름을 입력해주세요!", { title: "방 이름이 비어있어요" });
    return;
  }
  if (!checkKindWords(name)) {
    nameInput.value = "";
    return;
  }
  const rooms = loadLoungeRooms();
  rooms.push({ id: "room_" + Date.now(), name, charId: pickedChar, members: 1, builtin: false });
  saveLoungeRooms(rooms);

  nameInput.value = "";
  document.getElementById("createPanel").classList.remove("open");
  renderRoomList();
});

renderCharPicker();
renderRoomList();
