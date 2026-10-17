// ② 내 식물 기록하기 - 목적(샐러드용/완전체) 선택 → 주차별 사진 → 빠짐없이 올리면 300P → 성장 영상 → 다음 작물(장바구니)

requireProfile();
renderTabbar("record");

const DAY = 86400000;
const STREAK_REWARD = 300;
let pickedPurpose = null;

function show(id) {
  ["step-setup", "step-weeks", "step-done"].forEach(
    (s) => (document.getElementById(s).style.display = s === id ? "block" : "none")
  );
}

// 지금 시각 (기록 주차 계산용)
function nowFor(record) {
  return Date.now();
}

// 지금 몇 주차인지 (기록 기간이 끝났으면 weeks + 1)
function currentWeek(record) {
  const w = Math.floor((nowFor(record) - record.startedAt) / (7 * DAY)) + 1;
  return Math.min(Math.max(w, 1), record.weeks + 1);
}

function weekStatus(record, w) {
  if (record.photos[w]) return "done";
  const cur = currentWeek(record);
  if (w < cur) return "missed";
  if (w === cur) return "open";
  return "locked";
}

function isFinished(record) {
  const allDone = Object.keys(record.photos).length >= record.weeks;
  return allDone || currentWeek(record) > record.weeks;
}

// ---------------- 1. 목적 고르기 ----------------
function renderSetup() {
  const profile = loadProfile();
  const plan = GROWTH_PLANS[profile.plantId];
  const plant = PLANTS[profile.plantId];
  document.getElementById("setupChar").innerHTML = getCharacterSvg(profile.plantId);
  document.getElementById("setupTitle").textContent = "내 " + getPlantCallName(profile) + "의 성장 기록을 시작해요";
  document.getElementById("setupRange").textContent = plant.name + " · 수확까지 " + plan.range + " · " + plan.note;

  const grid = document.getElementById("purposeGrid");
  grid.innerHTML = "";
  ["salad", "full"].forEach((key) => {
    const opt = plan[key];
    const b = document.createElement("button");
    b.type = "button";
    b.className = "purpose-card" + (pickedPurpose === key ? " on" : "");
    b.innerHTML =
      '<span class="pc-emoji">' + (key === "salad" ? "🥗" : "🌳") + "</span>" +
      "<b>" + opt.label + "</b><span class=\"pc-weeks\">" + opt.weeks + "주</span><span class=\"pc-desc\">" + opt.desc + "</span>";
    b.addEventListener("click", () => {
      pickedPurpose = key;
      document.getElementById("startRecordBtn").disabled = false;
      document.getElementById("startRecordBtn").textContent = opt.weeks + "주 기록 시작하기";
      renderSetup();
    });
    grid.appendChild(b);
  });

  document.getElementById("harvestRows").innerHTML = Object.keys(GROWTH_PLANS)
    .map((id) => {
      const p = GROWTH_PLANS[id];
      return "<tr" + (id === profile.plantId ? ' class="me"' : "") + "><td>" + PLANTS[id].name + "</td><td>" + p.range + "</td><td>" + p.note + "</td></tr>";
    })
    .join("");
  show("step-setup");
}

document.getElementById("startRecordBtn").addEventListener("click", () => {
  if (!pickedPurpose) return;
  const profile = loadProfile();
  const plan = GROWTH_PLANS[profile.plantId][pickedPurpose];
  const old = loadRecord();
  saveRecord({
    plantId: profile.plantId,
    plantNickname: getPlantCallName(profile),
    purpose: pickedPurpose,
    purposeLabel: plan.label,
    weeks: plan.weeks,
    startedAt: Date.now(),
    photos: {},
    rewarded: false,
    history: (old && old.history) || [],
  });
  render();
});

// ---------------- 2. 주차별 기록 ----------------
function renderWeeks(record) {
  const cur = currentWeek(record);
  const name = record.plantNickname;
  document.getElementById("recPlan").textContent =
    PLANTS[record.plantId].name + " · " + record.purposeLabel + " · 총 " + record.weeks + "주";
  document.getElementById("weekTitle").textContent = cur + "주차의 내 " + name + "의 모습";
  const look = getGrowthLook(record.plantId, cur);
  document.getElementById("weekLook").innerHTML =
    "📋 <b>이번 주 기준 (" + look.label + ")</b> " + PLANTS[record.plantId].name + ": " + look.text;

  const preview = document.getElementById("photoPreview");
  const empty = document.getElementById("photoEmpty");
  const photo = record.photos[cur];
  preview.src = photo || "";
  preview.style.display = photo ? "block" : "none";
  empty.style.display = photo ? "none" : "flex";
  const endsAt = record.startedAt + cur * 7 * DAY;
  const daysLeft = Math.max(1, Math.ceil((endsAt - Date.now()) / DAY));
  document.getElementById("weekHint").textContent = photo
    ? "✅ " + cur + "주차 기록 완료! 사진을 누르면 바꾸기 · 돌리기 · 삭제를 할 수 있어요."
    : "📸 이번 주 사진을 올려주세요 (" + daysLeft + "일 남았어요)";

  // 기준표 (내 작물 줄은 강조)
  document.getElementById("lookTable").innerHTML =
    "<thead><tr><th>작물</th>" + GROWTH_STAGE_LABELS.map((l) => "<th>" + l + "</th>").join("") + "</tr></thead><tbody>" +
    Object.keys(GROWTH_LOOKS)
      .map(
        (id) =>
          "<tr" + (id === record.plantId ? ' class="me"' : "") + "><td>" + PLANTS[id].name + "</td>" +
          GROWTH_LOOKS[id].map((t, i) => "<td" + (id === record.plantId && i === look.stage ? ' class="now"' : "") + ">" + (t || "-") + "</td>").join("") +
          "</tr>"
      )
      .join("") +
    "</tbody>";

  const grid = document.getElementById("weekGrid");
  grid.innerHTML = "";
  let missed = 0;
  for (let w = 1; w <= record.weeks; w++) {
    const st = weekStatus(record, w);
    if (st === "missed") missed++;
    const cell = document.createElement("div");
    cell.className = "week-cell " + st;
    cell.dataset.week = w;
    cell.innerHTML =
      (st === "done" ? '<img src="' + record.photos[w] + '" alt="" />' : '<span class="wc-ic">' + (st === "missed" ? "💧" : st === "open" ? "📸" : "🔒") + "</span>") +
      '<span class="wc-label">' + w + "주차</span>";
    grid.appendChild(cell);
  }
  const done = Object.keys(record.photos).length;
  document.getElementById("streakText").innerHTML = missed
    ? "아쉽게도 " + missed + "주를 놓쳤어요 🥲 그래도 끝까지 기록해서 영상을 만들어요!"
    : "🔥 <b>" + done + "주 연속</b> 기록 중! " + (record.weeks - done) + "주만 더 올리면 300P!";
  show("step-weeks");
}

// 사진 속 잎 색 비율 재기 (작게 줄여서 픽셀마다 색상을 분류)
// lime 연두 · green 초록 · red 적갈/자주 · yellow 연노랑
function measureColors(img) {
  const size = 80;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  const count = { lime: 0, green: 0, red: 0, yellow: 0 };
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const v = max;
    const s = max === 0 ? 0 : (max - min) / max;
    if (s < 0.2 || v < 0.15) continue; // 흰색·회색·검정은 빼요
    let h;
    if (max === r) h = (60 * ((g - b) / (max - min)) + 360) % 360;
    else if (max === g) h = 60 * ((b - r) / (max - min)) + 120;
    else h = 60 * ((r - g) / (max - min)) + 240;
    if (h >= 62 && h < 95) count.lime++;
    else if (h >= 95 && h < 175) count.green++;
    else if ((h >= 290 || h < 14) && s > 0.3 && v < 0.85) count.red++; // 적갈·자주 (주황빛 갈색은 제외)
    else if (h >= 45 && h < 62 && v > 0.55) count.yellow++;
  }
  const total = size * size;
  return { lime: count.lime / total, green: count.green / total, red: count.red / total, yellow: count.yellow / total };
}

// 사진은 작게 줄여서 저장해요 (휴대폰 저장 공간 아끼기)
function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 640;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve({ dataUrl: c.toDataURL("image/jpeg", 0.75), colors: measureColors(img) });
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------------- 사진 수정 (크게 보기 · 바꾸기 · 돌리기 · 삭제) ----------------
let editingWeek = null; // 사진 바꾸기 중인 주차 (없으면 이번 주)
let viewingWeek = null;

function openViewer(week) {
  const record = loadRecord();
  if (!record.photos[week]) return;
  viewingWeek = week;
  const isNow = week === currentWeek(record);
  document.getElementById("pvTitle").textContent = week + "주차의 내 " + record.plantNickname + "의 모습";
  document.getElementById("pvImg").src = record.photos[week];
  // 지난 주 사진은 지우면 "빠짐없이" 기록이 끊겨서, 삭제는 이번 주만 돼요
  document.getElementById("pvDelete").style.display = isNow ? "block" : "none";
  document.getElementById("pvNote").textContent = isNow
    ? "이번 주 사진은 바꾸거나 지울 수 있어요."
    : "지난 주 사진은 바꾸거나 돌릴 수만 있어요 (기록이 끊기지 않게 삭제는 안 돼요).";
  document.getElementById("photoModal").classList.add("open");
}

function closeViewer() {
  document.getElementById("photoModal").classList.remove("open");
  viewingWeek = null;
}

// 사진을 오른쪽으로 90도 돌려요
function rotatePhoto(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.height;
      c.height = img.width;
      const ctx = c.getContext("2d");
      ctx.translate(c.width / 2, c.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.src = dataUrl;
  });
}

document.getElementById("photoDrop").addEventListener("click", (e) => {
  const record = loadRecord();
  const cur = currentWeek(record);
  // 이번 주 사진이 이미 있으면 사진 고르기 대신 크게 보기 창을 열어요
  if (record.photos[cur]) {
    e.preventDefault();
    openViewer(cur);
  } else {
    editingWeek = null;
  }
});

document.getElementById("weekGrid").addEventListener("click", (e) => {
  const cell = e.target.closest(".week-cell.done");
  if (cell) openViewer(Number(cell.dataset.week));
});

document.getElementById("pvReplace").addEventListener("click", () => {
  editingWeek = viewingWeek;
  document.getElementById("photoInput").click();
});

document.getElementById("pvRotate").addEventListener("click", async () => {
  const record = loadRecord();
  const week = viewingWeek;
  record.photos[week] = await rotatePhoto(record.photos[week]);
  saveRecord(record);
  document.getElementById("pvImg").src = record.photos[week];
  renderWeeks(record);
});

document.getElementById("pvDelete").addEventListener("click", () => {
  const week = viewingWeek;
  showConfirm("이번 주 사진을 지우면 다시 올려야 기록으로 인정돼요.", {
    type: "warn",
    title: week + "주차 사진을 지울까요?",
    okText: "지우기",
    cancelText: "그대로 둘래요",
    onOk: () => {
      const record = loadRecord();
      delete record.photos[week];
      saveRecord(record);
      closeViewer();
      render();
    },
  });
});

document.getElementById("pvClose").addEventListener("click", closeViewer);
document.getElementById("photoModal").addEventListener("click", (e) => {
  if (e.target.id === "photoModal") closeViewer();
});

document.getElementById("photoInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  const record = loadRecord();
  const now = currentWeek(record);
  // 바꾸기: 이미 올린 주차만 / 새로 올리기: 이번 주만
  const cur = editingWeek && record.photos[editingWeek] ? editingWeek : now;
  editingWeek = null;
  if (!file) return;
  if (cur > record.weeks) return;
  const replacing = !!record.photos[cur];
  let shot;
  try {
    shot = await shrinkImage(file);
  } catch (err) {
    showAlert("다른 사진으로 다시 시도해주세요!", { type: "warn", title: "사진을 불러오지 못했어요" });
    return;
  }
  // 기준표: 이번 주에 나와야 할 잎 색이 충분히 있어야 인정돼요
  const look = getGrowthLook(record.plantId, cur);
  const plantRatio = look.colors.reduce((sum, k) => sum + shot.colors[k], 0);
  // 적상추처럼 붉은 잎도, 밑동·안쪽 초록은 꼭 보여야 해요 (갈색 과자 사진 통과 방지)
  const greenRatio = shot.colors.lime + shot.colors.green;
  if (plantRatio < look.minRatio || greenRatio < look.minRatio * 0.4) {
    showAlert(
      "이건 식물 사진이 아니에요, 다시 보내주세요 🌱\n\n이번 주(" + look.label + ") " + PLANTS[record.plantId].name + "는\n'" + look.text + "' 모습이에요.\n잎이 화면에 크게 나오도록 화분을 가까이 찍어주세요.",
      { type: "warn", title: "식물 사진이 아니에요" }
    );
    return;
  }
  record.photos[cur] = shot.dataUrl;
  saveRecord(record);
  closeViewer();
  render();
  showAlert(
    cur + "주차 " + record.plantNickname + " 사진이 " + (replacing ? "바뀌었어요" : "기록됐어요") + "! 📸\n잎 색 " + Math.round(plantRatio * 100) + "% 확인 완료",
    { title: replacing ? "사진 수정 완료" : "기록 완료" }
  );
});

// ---------------- 3. 완성: 성장 영상 + 다음 작물 ----------------
function loadImages(srcs) {
  return Promise.all(
    srcs.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        })
    )
  );
}

let playing = null;

// 사진을 한 장씩 부드럽게 넘기며 보여주고, 마지막엔 축하 문구!
async function playGrowthVideo(record, onFrame) {
  const canvas = document.getElementById("growthCanvas");
  const ctx = canvas.getContext("2d");
  const weeks = Object.keys(record.photos).map(Number).sort((a, b) => a - b);
  const imgs = await loadImages(weeks.map((w) => record.photos[w]));
  const charImg = (await loadImages(["images/chars/" + record.plantId + ".webp"]))[0];
  const W = canvas.width;
  const H = canvas.height;
  const per = 1300;
  const outro = 3200;
  const total = weeks.length * per + outro;
  const token = {};
  playing = token;

  function cover(img, alpha) {
    if (!img) return;
    const s = Math.max(W / img.width, H / img.height);
    const w = img.width * s;
    const h = img.height * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    ctx.globalAlpha = 1;
  }

  function pill(text, y) {
    ctx.font = "800 26px Pretendard, sans-serif";
    const tw = ctx.measureText(text).width + 36;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect((W - tw) / 2, y - 24, tw, 44, 22);
    else ctx.rect((W - tw) / 2, y - 24, tw, 44);
    ctx.fill();
    ctx.fillStyle = "#2f7a45";
    ctx.textAlign = "center";
    ctx.fillText(text, W / 2, y + 7);
  }

  return new Promise((resolve) => {
    const start = performance.now();
    function frame(t) {
      if (playing !== token) return resolve();
      const el = t - start;
      ctx.fillStyle = "#eefaea";
      ctx.fillRect(0, 0, W, H);
      if (el < weeks.length * per) {
        const i = Math.floor(el / per);
        const k = (el % per) / per;
        cover(imgs[i], 1);
        if (k > 0.75 && imgs[i + 1]) cover(imgs[i + 1], (k - 0.75) / 0.25);
        pill(weeks[i] + "주차의 " + record.plantNickname, H - 46);
      } else {
        cover(imgs[imgs.length - 1], 0.35);
        if (charImg) {
          const cw = 190;
          const ch = (charImg.height / charImg.width) * cw;
          ctx.drawImage(charImg, (W - cw) / 2, 70 + Math.sin(el / 250) * 6, cw, ch);
        }
        const name = loadProfile().name || "유저";
        pill(name + "님의 식물이 이만큼 자랐어요", H - 120);
        pill("뿌듯하죠?? 🌱", H - 62);
      }
      if (onFrame) onFrame(el / total);
      if (el < total) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

function renderDone(record) {
  const profile = loadProfile();
  const plantName = PLANTS[record.plantId].name;
  const count = Object.keys(record.photos).length;
  const perfect = count >= record.weeks;

  if (perfect && !record.rewarded) {
    record.rewarded = true;
    saveRecord(record);
    addPoints(STREAK_REWARD);
    updateCartBadge();
  }
  document.getElementById("doneMsg").innerHTML =
    "<b>" + escapeHtml(profile.name) + "님의 식물이 이만큼 자랐어요! 뿌듯하죠?? 🌱</b><br />" +
    (perfect
      ? "한 주도 빠짐없이 " + record.weeks + "주를 기록해서 <b>" + STREAK_REWARD + "P</b>를 받았어요 🎉"
      : record.weeks + "주 중 " + count + "주를 기록했어요. 다음엔 빠짐없이 도전해봐요!");
  document.getElementById("nextTitle").textContent = plantName + " 잘 키우셨네요!! 🎉";
  document.getElementById("saveVideoBtn").style.display = count && window.MediaRecorder ? "block" : "none";

  const grid = document.getElementById("nextGrid");
  grid.innerHTML = "";
  VEGGIE_IDS.forEach((id) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "char-tile";
    tile.innerHTML = '<div class="char-box small">' + getCharacterSvg(id) + '</div><div class="name">' + PLANTS[id].name + "</div>";
    tile.addEventListener("click", () => chooseNext(id));
    grid.appendChild(tile);
  });
  show("step-done");
  if (count) playGrowthVideo(record);
}

// 다음 작물 고르기 → 장바구니에 담고, 새 기록 시작 준비
function chooseNext(id) {
  const plant = PLANTS[id];
  addToCart({ id: "seed_" + id, name: plant.name + " 모종 키트", cost: 1500, img: "images/chars/" + id + ".webp" });
  const box = document.getElementById("nextConfirm");
  box.innerHTML =
    '<div class="nc-bubble">' + plant.name + " 알겠습니다! 🛒 장바구니에 넣어뒀어요.<br /><small>(구매는 아직 준비중!)</small></div>" +
    '<div class="field"><label for="newPlantName">새 ' + plant.name + '의 이름을 지어주세요</label>' +
    '<input type="text" id="newPlantName" maxlength="8" placeholder="예) 씩씩이" /></div>' +
    '<button class="btn" id="startNextBtn">' + plant.name + " 새 기록 시작하기</button>";
  document.getElementById("startNextBtn").addEventListener("click", () => {
    const input = document.getElementById("newPlantName");
    const newName = input.value.trim();
    if (!newName) {
      showAlert("새로 키울 식물에게 예쁜 이름을 지어주세요 🌱", { title: "이름을 지어주세요" });
      return;
    }
    if (!checkKindWords(newName)) {
      input.value = "";
      return;
    }
    const record = loadRecord();
    const history = record.history || [];
    history.push({ plantId: record.plantId, plantNickname: record.plantNickname, weeks: record.weeks, done: Object.keys(record.photos).length, endedAt: Date.now() });
    saveRecord({ history: history, pending: true });
    const profile = loadProfile();
    profile.plantId = id;
    profile.plantNickname = newName;
    saveProfile(profile);
    pickedPurpose = null;
    render();
  });
  box.scrollIntoView({ behavior: "smooth" });
}

document.getElementById("playVideoBtn").addEventListener("click", () => playGrowthVideo(loadRecord()));

// 캔버스를 녹화해서 webm 영상 파일로 저장
document.getElementById("saveVideoBtn").addEventListener("click", async () => {
  const btn = document.getElementById("saveVideoBtn");
  const canvas = document.getElementById("growthCanvas");
  const chunks = [];
  let recorder;
  try {
    recorder = new MediaRecorder(canvas.captureStream(30), { mimeType: "video/webm" });
  } catch (e) {
    showAlert("이 브라우저에서는 영상 저장이 안 돼요.\n화면 녹화로 저장해주세요!", { type: "warn", title: "영상 저장이 안 돼요" });
    return;
  }
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  recorder.onstop = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(chunks, { type: "video/webm" }));
    a.download = "내식물_성장영상.webm";
    a.click();
    btn.disabled = false;
    btn.textContent = "영상 파일로 저장";
  };
  btn.disabled = true;
  btn.textContent = "영상 만드는 중...";
  recorder.start();
  await playGrowthVideo(loadRecord());
  recorder.stop();
});

function render() {
  playing = null;
  const record = loadRecord();
  const profile = loadProfile();
  const active = record && record.startedAt && record.plantId === profile.plantId;
  if (!active) renderSetup();
  else if (isFinished(record)) renderDone(record);
  else renderWeeks(record);
}

render();
