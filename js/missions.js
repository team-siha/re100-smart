// 미션 퀘스트 - 미션을 하면 보상이 쌓이고, [포인트 받기]를 누르면 위 보유 포인트에 쌓여요

requireLogin();
renderTabbar("mission");

const pointEl = document.getElementById("pointUtil");
let shownPoints = (loadProfile() || {}).points || 0;
pointEl.textContent = shownPoints + "P";

// 보유 포인트 숫자가 또르륵 올라가요
function countUpTo(target) {
  const from = shownPoints;
  const start = performance.now();
  const dur = 700;
  function frame(now) {
    const t = Math.min(1, (now - start) / dur);
    shownPoints = Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3)));
    pointEl.textContent = shownPoints + "P";
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  // 애니메이션이 멈춰도 마지막엔 꼭 정확한 숫자로
  setTimeout(() => {
    shownPoints = target;
    pointEl.textContent = target + "P";
  }, dur + 100);
  const bank = document.getElementById("pointBank");
  bank.classList.remove("bump");
  void bank.offsetWidth;
  bank.classList.add("bump");
}

// "+30P"가 버튼에서 보유 포인트로 날아가요
function flyPoints(fromEl, amount) {
  const a = fromEl.getBoundingClientRect();
  const b = document.getElementById("pointBank").getBoundingClientRect();
  const fly = document.createElement("span");
  fly.className = "point-fly";
  fly.textContent = "+" + amount + "P";
  fly.style.left = a.left + a.width / 2 + "px";
  fly.style.top = a.top + a.height / 2 + "px";
  document.body.appendChild(fly);
  requestAnimationFrame(() => {
    fly.style.transform = "translate(" + (b.left + 60 - (a.left + a.width / 2)) + "px," + (b.top + b.height / 2 - (a.top + a.height / 2)) + "px) scale(0.7)";
    fly.style.opacity = "0.2";
  });
  setTimeout(() => fly.remove(), 750);
}

function claim(id, btn) {
  const amount = claimReward(id);
  if (!amount) return;
  flyPoints(btn, amount);
  setTimeout(() => countUpTo((loadProfile() || {}).points || 0), 450);
  setTimeout(render, 800);
}

// ---------------- 받을 수 있는 보상 ----------------
function renderRewards() {
  const list = document.getElementById("rewardList");
  const pending = loadRewards().pending;
  document.getElementById("claimAllBtn").style.display = pending.length >= 2 ? "inline-block" : "none";
  if (!pending.length) {
    list.innerHTML = '<div class="reward-empty">아직 받을 보상이 없어요. 아래 미션을 하면 보상이 쌓여요 🌱</div>';
    return;
  }
  list.innerHTML = "";
  pending.forEach((p) => {
    const row = document.createElement("div");
    row.className = "reward-row";
    row.innerHTML =
      '<span class="rr-gift">🎁</span><div class="rr-text"><b>' + escapeHtml(p.label) + "</b><small>+" + p.amount + "P</small></div>";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "claim-btn";
    btn.textContent = "포인트 받기";
    btn.addEventListener("click", () => {
      btn.disabled = true;
      claim(p.id, btn);
    });
    row.appendChild(btn);
    list.appendChild(row);
  });
}

document.getElementById("claimAllBtn").addEventListener("click", (e) => {
  const btn = e.currentTarget;
  const pending = loadRewards().pending;
  if (!pending.length) return;
  const total = pending.reduce((s, p) => s + claimReward(p.id), 0);
  flyPoints(btn, total);
  setTimeout(() => countUpTo((loadProfile() || {}).points || 0), 450);
  setTimeout(render, 800);
});

// ---------------- 오늘의 미션 ----------------
function photoQuest() {
  const record = loadRecord();
  const profile = loadProfile() || {};
  const active = record && record.startedAt && record.plantId === profile.plantId;
  if (!active) return { id: "", done: false };
  const week = Math.min(record.weeks, Math.floor((Date.now() - record.startedAt) / (7 * 86400000)) + 1);
  return { id: "photo-" + record.startedAt + "-" + week, done: !!record.photos[week] };
}

function quests() {
  const today = todayKey();
  const profile = loadProfile() || {};
  const photo = photoQuest();
  return [
    { id: "answer-" + today, icon: "room", href: "myroom.html", title: "내 방에서 오늘의 질문에 대답하기", desc: "내 식물이 대답을 읽고 편지를 보내줘요 💌", point: "+" + POINT_RULES.dailyAnswer + "P",
      done: !!loadMyRoom().answers[today] },
    { id: photo.id, icon: "record", href: "growth.html", title: "이번 주 내 식물 사진 올리기", desc: "주마다 " + POINT_RULES.weeklyPhoto + "P · 빠짐없이 올리면 " + POINT_RULES.streakBonus + "P 더", point: "+" + POINT_RULES.weeklyPhoto + "P",
      done: photo.done },
    { id: "quiz-" + today, icon: "cert", href: "certificate.html", title: "식집사 자격증 응시하기", desc: "매일 새 문제 · 맞춘 개수만큼", point: "최대 +100P",
      done: profile.quizRewardDay === today },
    { id: "lounge-" + today, icon: "lounge", href: "lounge.html", title: "과자 소통방에 인사하기", desc: "같은 과자봉지 친구들과 이야기해요", point: "+" + POINT_RULES.dailyLounge + "P",
      done: hasReward("lounge-" + today) },
    { id: "chat-" + today, icon: "chat", href: "chat.html", title: "내 식물에게 오늘 하루 말하기", desc: "새싹톡에서 하루를 털어놔요", point: "+" + POINT_RULES.dailyChat + "P",
      done: hasReward("chat-" + today) },
  ];
}

function renderQuests() {
  const list = document.getElementById("questList");
  const pendingIds = loadRewards().pending.map((p) => p.id);
  list.innerHTML = "";
  quests().forEach((q) => {
    const waiting = q.id && pendingIds.includes(q.id);
    const card = document.createElement("a");
    card.className = "mission-card" + (q.done ? " done" : "");
    card.href = q.href;
    const status = waiting
      ? '<div class="m-point ready">🎁 받기</div>'
      : q.done
        ? '<div class="m-point got">✅ 완료</div>'
        : '<div class="m-point">' + q.point + "</div>";
    card.innerHTML =
      '<div class="m-badge" data-icon="' + q.icon + '"></div>' +
      '<div class="m-text"><strong>' + q.title + "</strong><span>" + q.desc + "</span></div>" + status;
    // 받을 보상이 있으면 카드를 눌러도 바로 받아요
    if (waiting) {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        claim(q.id, card.querySelector(".m-point"));
      });
    }
    list.appendChild(card);
  });
  fillIcons(list);
}

function render() {
  renderRewards();
  renderQuests();
}

render();
