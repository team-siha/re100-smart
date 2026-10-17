// 프로필 카드 + MBTI 식집사 테스트(14문항) + 식물 이름 짓기
// 첫 화면에서 프로필을 입력한 새 친구는 바로 MBTI로, 이미 끝낸 친구는 내 프로필 카드를 봐요.

requireLogin();
const startProfile = loadProfile() || {};
// 아직 시작 전인 친구는 탭바 없이 테스트에 집중해요
if (startProfile.mbtiDone) renderTabbar("menu");

const GROUP_A = ["cheongSangchu", "jeokSangchu", "romaine"]; // 상추 계열 (손 덜 가는 편)
const GROUP_B = ["cheonggyeongchae", "basil", "mint"]; // 손이 많이 가는 애정형
const GROUP_HEALING = ["basil", "mint"]; // 힐링 지향
const GROUP_PRACTICAL = ["romaine", "cheonggyeongchae", "cheongSangchu", "jeokSangchu"]; // 실용 지향
const GROUP_RED = ["jeokSangchu"]; // 빨간빛 선호
const GROUP_GREEN = ["cheongSangchu", "romaine", "cheonggyeongchae"]; // 초록빛 선호
const GROUP_EUROPEAN = ["romaine", "basil", "mint"]; // 유럽종 느낌 선호
const GROUP_KOREAN = ["cheongSangchu", "jeokSangchu", "cheonggyeongchae"]; // 친숙한 토종 느낌 선호
const GROUP_SALAD = ["romaine", "cheongSangchu", "jeokSangchu"]; // 아삭한 식감 선호
const GROUP_COOKED = ["cheonggyeongchae", "basil", "mint"]; // 조리/티 활용 선호
const GROUP_FAST = ["cheongSangchu", "jeokSangchu", "cheonggyeongchae"]; // 빨리 쑥쑥 크는 편
const GROUP_SLOW = ["romaine", "basil", "mint"]; // 느긋하게 기다리는 편
const GROUP_SHADE = ["mint", "cheongSangchu", "cheonggyeongchae"]; // 그늘에서도 버팀
const GROUP_SUN = ["basil", "romaine", "jeokSangchu"]; // 햇빛 러버
const GROUP_INSTA = ["jeokSangchu", "basil", "romaine"]; // 사진발 잘 받음

const QUESTIONS = [
  { text: "나는 식물살인마이다.\n(식물을 자주 시들게 해요)", yes: GROUP_A, no: GROUP_B },
  { text: "나는 식물의 대모(big mama)이다.\n(정성껏 돌보는 편이에요)", yes: GROUP_B, no: GROUP_A },
  { text: "나는 식물을 보며 힐링하고 싶다.\n(향과 분위기를 중시해요)", yes: GROUP_HEALING, no: GROUP_PRACTICAL },
  { text: "나는 쨍한 레드 포인트에 끌린다.\n(화려하고 생기있는 색이 좋아요)", yes: GROUP_RED, no: GROUP_GREEN },
  { text: "나는 이국적인 유럽 감성을 좋아한다.\n(카페 느낌의 세련된 분위기가 좋아요)", yes: GROUP_EUROPEAN, no: GROUP_KOREAN },
  { text: "나는 아삭아삭 씹는 식감을 좋아한다.\n(생으로 아삭하게 먹는 걸 선호해요)", yes: GROUP_SALAD, no: GROUP_COOKED },
  { text: "나는 물 주는 걸 맨날 까먹는다.\n(알람 없으면 절대 못 챙겨요 ㅋㅋ)", yes: GROUP_A, no: GROUP_B },
  { text: "나는 내 방이 향기로 가득했으면 좋겠다.\n(디퓨저 대신 식물 향 맡고 싶어요)", yes: GROUP_HEALING, no: GROUP_SALAD },
  { text: "나는 키운 걸 바로 따서 쌈 싸 먹고 싶다.\n(수확의 기쁨 = 삼겹살의 기쁨)", yes: GROUP_SALAD, no: GROUP_COOKED },
  { text: "나는 인스타 감성샷에 진심이다.\n(예쁘게 나와야 키울 맛이 나요 📸)", yes: GROUP_INSTA, no: GROUP_KOREAN },
  { text: "나는 요리하는 걸 좋아한다.\n(볶고 데치고 무치고 다 해요)", yes: GROUP_COOKED, no: GROUP_SALAD },
  { text: "나는 햇빛 잘 안 드는 원룸에 산다.\n(그늘에서도 씩씩하게 컸으면 해요)", yes: GROUP_SHADE, no: GROUP_SUN },
  { text: "나는 모히또 가서 몰디브 한 잔 하는 게 로망이다.\n(시원한 음료에 잎 하나 띄우기!)", yes: ["mint"], no: GROUP_GREEN },
  { text: "나는 성격이 급해서 결과를 빨리 봐야 한다.\n(하루하루 쑥쑥 크는 게 보여야 해요)", yes: GROUP_FAST, no: GROUP_SLOW },
];

let currentQuestion = 0;
let answers = []; // 지금까지 고른 답 (뒤로 가기용)
let mbtiFrom = "step-intro"; // 첫 질문에서 뒤로 가면 돌아갈 화면
let resultPlantId = null;
let selectedMoodId = "happy";
let selectedGender = "";
const scores = {};

const sections = ["step-summary", "step-edit", "step-intro", "step-mbti", "step-result"];
function showStep(id) {
  sections.forEach((s) => (document.getElementById(s).style.display = s === id ? "block" : "none"));
  window.scrollTo(0, 0);
}

// ---------------- 내 프로필 카드 ----------------
function showSummary(profile) {
  const plant = PLANTS[profile.plantId] || PLANTS.basil;
  const mood = MOODS.find((m) => m.id === profile.moodId) || MOODS[0];
  document.getElementById("summaryChar").innerHTML = getCharacterSvg(profile.plantId);
  document.getElementById("summaryType").textContent = plant.type;
  document.getElementById("summaryLine").textContent = formatProfileLine(profile);
  document.getElementById("summaryInfo").innerHTML =
    "<li><span>이름</span><b>" + escapeHtml(profile.name || profile.nickname) + "</b></li>" +
    "<li><span>나이 · 성별</span><b>" + escapeHtml(String(profile.age || "-")) + "세 · " + escapeHtml(profile.gender || "-") + "</b></li>" +
    "<li><span>상태</span><b>" + mood.emoji + " " + mood.label + " " + (profile.moodIntensity || 60) + "%</b></li>" +
    "<li><span>과자봉지</span><b>" + escapeHtml(profile.snackName || "-") + "</b></li>" +
    "<li><span>내 식물</span><b>" + plant.name + (profile.plantNickname ? " (" + escapeHtml(profile.plantNickname) + ")" : "") + "</b></li>" +
    "<li><span>포인트</span><b>" + (profile.points || 0) + "P</b></li>";
  showStep("step-summary");
}

// ---------------- 프로필 수정 ----------------
const moodChipsEl = document.getElementById("moodChips");
const moodBarFill = document.getElementById("moodBarFill");
const moodEmoji = document.getElementById("moodEmoji");
const moodIntensity = document.getElementById("moodIntensity");

function renderMoodChips() {
  moodChipsEl.innerHTML = "";
  MOODS.forEach((mood) => {
    const chip = document.createElement("div");
    chip.className = "chip" + (mood.id === selectedMoodId ? " selected" : "");
    chip.style.background = mood.id === selectedMoodId ? mood.color : "";
    chip.textContent = mood.emoji + " " + mood.label;
    chip.addEventListener("click", () => {
      selectedMoodId = mood.id;
      renderMoodChips();
      updateMoodBar();
    });
    moodChipsEl.appendChild(chip);
  });
}

function updateMoodBar() {
  const mood = MOODS.find((m) => m.id === selectedMoodId);
  moodBarFill.style.width = moodIntensity.value + "%";
  moodBarFill.style.background = mood.color;
  moodEmoji.textContent = mood.emoji;
}

moodIntensity.addEventListener("input", updateMoodBar);

function setGender(v) {
  selectedGender = v || "";
  document.querySelectorAll("#genderSeg button").forEach((b) => b.classList.toggle("on", b.dataset.v === selectedGender));
}

document.getElementById("genderSeg").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (btn) setGender(btn.dataset.v);
});

function openEdit(profile) {
  document.getElementById("inputAge").value = profile.age || "";
  document.getElementById("inputSnack").value = profile.snackName || "";
  document.getElementById("inputPlantName").value = profile.plantNickname || "";
  selectedMoodId = profile.moodId || "happy";
  moodIntensity.value = profile.moodIntensity || 60;
  setGender(profile.gender);
  renderMoodChips();
  updateMoodBar();
  showStep("step-edit");
}

document.getElementById("editProfileBtn").addEventListener("click", () => openEdit(loadProfile()));
document.getElementById("cancelEditBtn").addEventListener("click", () => showSummary(loadProfile()));

document.getElementById("saveEditBtn").addEventListener("click", () => {
  const age = document.getElementById("inputAge").value.trim();
  const snack = document.getElementById("inputSnack").value.trim();
  const plantName = document.getElementById("inputPlantName").value.trim();
  if (!age || !selectedGender || !snack || !plantName) {
    showAlert("나이, 성별, 과자봉지 이름, 식물 이름을\n모두 입력해주세요!", { title: "아직 빈 칸이 있어요" });
    return;
  }
  if (!checkKindWords(snack, plantName)) return;
  const profile = Object.assign(loadProfile(), {
    age,
    gender: selectedGender,
    snackName: snack,
    plantNickname: plantName,
    moodId: selectedMoodId,
    moodIntensity: moodIntensity.value,
  });
  saveProfile(profile);
  showSummary(profile);
});

// ---------------- MBTI ----------------
function showIntro(profile) {
  document.getElementById("introTitle").textContent =
    (profile.name || profile.nickname) + "님, 이제 나에게 맞는 식물을 찾아볼까요?";
  document.getElementById("introVeggies").innerHTML = VEGGIE_IDS.map(
    (id) => '<img src="images/chars/' + id + '.png" alt="" />'
  ).join("");
  showStep("step-intro");
}

function startMbti() {
  currentQuestion = 0;
  answers = [];
  mbtiFrom = document.getElementById("step-summary").style.display === "block" ? "step-summary" : "step-intro";
  Object.keys(PLANTS).forEach((id) => (scores[id] = 0));
  showStep("step-mbti");
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentQuestion];
  document.getElementById("questionText").textContent = q.text;
  document.getElementById("qCount").textContent = currentQuestion + 1 + " / " + QUESTIONS.length;
  document.getElementById("qProgressFill").style.width = ((currentQuestion + 1) / QUESTIONS.length) * 100 + "%";
  document.getElementById("qBackBtn").textContent = currentQuestion === 0 ? "← 처음으로" : "← 이전 질문";

  // 지금 1등 후보들이 살짝 튀어나와요
  const top = Math.max.apply(null, Object.values(scores));
  document.getElementById("qVeggies").innerHTML = VEGGIE_IDS.map(
    (id) =>
      '<img src="images/chars/' + id + '.png" alt="" class="' + (top > 0 && scores[id] === top ? "lead" : "") + '" />'
  ).join("");
}

function answer(isYes) {
  const q = QUESTIONS[currentQuestion];
  (isYes ? q.yes : q.no).forEach((plantId) => (scores[plantId] += 1));
  answers.push(isYes);
  currentQuestion += 1;
  if (currentQuestion < QUESTIONS.length) renderQuestion();
  else showResult();
}

// 뒤로 가기: 마지막 답을 취소하고 그 질문으로 돌아가요
function goBack() {
  if (!answers.length) {
    showStep(mbtiFrom);
    return;
  }
  currentQuestion -= 1;
  const q = QUESTIONS[currentQuestion];
  (answers.pop() ? q.yes : q.no).forEach((plantId) => (scores[plantId] -= 1));
  showStep("step-mbti");
  renderQuestion();
}

function updateResultLine() {
  const draft = Object.assign({}, loadProfile(), {
    plantId: resultPlantId,
    plantNickname: document.getElementById("plantNameInput").value.trim(),
  });
  document.getElementById("resultLine").textContent = formatProfileLine(draft);
}

function showResult() {
  let bestId = null;
  let bestScore = -1;
  Object.keys(PLANTS).forEach((id) => {
    if (scores[id] > bestScore) {
      bestScore = scores[id];
      bestId = id;
    }
  });
  resultPlantId = bestId;
  const plant = PLANTS[bestId];
  const profile = loadProfile();

  showStep("step-result");
  document.getElementById("plantResult").innerHTML =
    '<div class="result-burst"><div class="char-box large">' + getCharacterSvg(bestId) + "</div></div>" +
    '<div class="mp-type">' + plant.type + "</div>" +
    '<div class="name">' + plant.name + "</div>" +
    '<div class="desc">' + plant.desc + "</div>";
  document.getElementById("plantNameLabel").textContent = "내 " + plant.name + "의 이름을 지어주세요 🌱";
  const nameInput = document.getElementById("plantNameInput");
  nameInput.value = profile.plantId === bestId ? profile.plantNickname || "" : "";
  updateResultLine();
}

document.getElementById("plantNameInput").addEventListener("input", updateResultLine);
document.getElementById("yesBtn").addEventListener("click", () => answer(true));
document.getElementById("noBtn").addEventListener("click", () => answer(false));
document.getElementById("qBackBtn").addEventListener("click", goBack);
document.getElementById("resultBackBtn").addEventListener("click", goBack);
document.getElementById("startMbtiBtn").addEventListener("click", startMbti);
document.getElementById("retestBtn").addEventListener("click", startMbti);
document.getElementById("logoutBtn").addEventListener("click", confirmLogout);

document.getElementById("saveProfileBtn").addEventListener("click", () => {
  const nameInput = document.getElementById("plantNameInput");
  const plantName = nameInput.value.trim();
  if (!plantName) {
    showAlert("함께할 내 식물에게 예쁜 이름을 지어주세요 🌱", { title: "이름을 지어주세요" });
    return;
  }
  if (!checkKindWords(plantName)) {
    nameInput.value = "";
    updateResultLine();
    return;
  }
  const existing = loadProfile() || {};
  const profile = Object.assign({}, existing, {
    nickname: getCurrentNickname(),
    plantId: resultPlantId,
    plantNickname: plantName,
    points: existing.points || 0,
    mbtiDone: true,
    createdAt: existing.createdAt || Date.now(),
  });
  saveProfile(profile);
  window.location.href = "home.html";
});

// 첫 진입
if (startProfile.mbtiDone) showSummary(startProfile);
else showIntro(startProfile);
