// 첫 화면 - "RE:100 스마트와 함께하기" 프로필 입력
// 예전 이름이면 저장된 정보를 그대로 불러오고, 새 이름이면 3단계로 나눠서 입력해요.
// 1단계: 이름 / 나이 / 성별 → 2단계: 오늘 상태 → 3단계: 과자봉지 고르기

const nicknameInput = document.getElementById("nicknameInput");
const welcomeBackBox = document.getElementById("welcomeBackBox");
const newUserFields = document.getElementById("newUserFields");
const enterBtn = document.getElementById("enterBtn");
const recentBox = document.getElementById("recentBox");
const moodChipsEl = document.getElementById("moodChips");
const moodValue = document.getElementById("moodValue");
const moodIntensity = document.getElementById("moodIntensity");

let selectedMoodId = "happy";
let selectedGender = "";
let selectedSnack = "";

const STEP_TITLES = ["", "나를 소개해요", "오늘 상태", "과자봉지 고르기"];

function showObStep(n) {
  [1, 2, 3].forEach((i) => (document.getElementById("obStep" + i).style.display = i === n ? "block" : "none"));
  document.querySelectorAll("#obProgress .dot").forEach((d, i) => d.classList.toggle("on", i < n));
  document.getElementById("obProgressText").textContent = n + " / 3 · " + STEP_TITLES[n];
  window.scrollTo(0, 0);
}

document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => showObStep(Number(b.dataset.go))));

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

// 고른 기분이 얼마나 큰지: 슬라이더 하나로 (색은 고른 기분 색)
function updateMoodBar() {
  const mood = MOODS.find((m) => m.id === selectedMoodId);
  moodIntensity.style.accentColor = mood.color;
  moodValue.textContent = mood.emoji + " " + mood.label + " " + moodIntensity.value + "%";
}

moodIntensity.addEventListener("input", updateMoodBar);

document.getElementById("genderSeg").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  selectedGender = btn.dataset.v;
  document.querySelectorAll("#genderSeg button").forEach((b) => b.classList.toggle("on", b === btn));
});

// 예전 이름이면 나머지 칸을 숨기고 "이어서 시작하기"
function updateWelcomeBack() {
  const nickname = nicknameInput.value.trim();
  const saved = nickname && nicknameExists(nickname) ? loadUserRegistry()[nickname] : null;
  if (saved) {
    welcomeBackBox.style.display = "block";
    welcomeBackBox.innerHTML =
      "🌿 다시 오셨네요! 이전 정보를 그대로 불러올게요.<br /><b>" + escapeHtml(formatProfileLine(saved)) +
      "</b> · " + (saved.points || 0) + "P";
    newUserFields.style.display = "none";
    document.getElementById("obProgress").style.display = "none";
    enterBtn.textContent = "이어서 시작하기";
  } else {
    welcomeBackBox.style.display = "none";
    newUserFields.style.display = "block";
    document.getElementById("obProgress").style.display = "";
    enterBtn.textContent = "다음";
  }
}

// 이 기기에서 함께했던 이름을 칩으로 보여줘요 (누르면 바로 입력)
function renderRecent() {
  const names = Object.keys(loadUserRegistry());
  if (!names.length) return;
  recentBox.innerHTML = '<div class="recent-label">이 기기에서 로그인한 정보</div>';
  names.slice(-6).reverse().forEach((name) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "recent-chip";
    chip.textContent = name;
    chip.addEventListener("click", () => {
      nicknameInput.value = name;
      updateWelcomeBack();
    });
    recentBox.appendChild(chip);
  });
}

nicknameInput.addEventListener("input", updateWelcomeBack);

enterBtn.addEventListener("click", () => {
  const nickname = nicknameInput.value.trim();
  if (!nickname) {
    showAlert("시작하려면 이름(닉네임)을 입력해주세요 🌱", { title: "이름이 비어있어요" });
    return;
  }
  if (!checkKindWords(nickname)) {
    nicknameInput.value = "";
    return;
  }

  // 예전 유저: 그대로 이어서
  if (nicknameExists(nickname)) {
    const result = loginWithNickname(nickname);
    window.location.href = result.profile.mbtiDone ? "home.html" : "profile.html";
    return;
  }

  // 새 유저: 1단계 칸을 다 채우면 2단계로
  const age = document.getElementById("ageInput").value.trim();
  if (!age || !selectedGender) {
    showAlert("나이와 성별을 입력해주세요!", { title: "아직 빈 칸이 있어요" });
    return;
  }
  showObStep(2);
});

document.getElementById("step2Next").addEventListener("click", () => showObStep(3));

// 3단계: 과자봉지 고르기 (이미지 + 직접 입력)
const snackInput = document.getElementById("snackInput");
setupSnackPicker(document.getElementById("snackGrid"), snackInput, "", (name) => (selectedSnack = name));

document.getElementById("finishBtn").addEventListener("click", () => {
  const nickname = nicknameInput.value.trim();
  const age = document.getElementById("ageInput").value.trim();
  if (!selectedSnack) {
    showAlert("식물을 키울 과자봉지를 골라주세요!\n목록에 없으면 '다른 과자'를 눌러 적어주세요.", { title: "과자봉지를 골라주세요" });
    return;
  }
  if (!checkKindWords(selectedSnack)) {
    snackInput.value = "";
    selectedSnack = "";
    return;
  }
  loginWithNickname(nickname, {
    name: nickname,
    age: age,
    gender: selectedGender,
    moodId: selectedMoodId,
    moodIntensity: moodIntensity.value,
    snackName: selectedSnack,
  });
  window.location.href = "profile.html";
});

nicknameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") enterBtn.click();
});

renderMoodChips();
updateMoodBar();
renderRecent();

// 로고 화면을 잠깐 보여준 뒤, 로그인돼 있으면 홈으로 / 아니면 프로필 입력 화면으로
// (이미 이번에 로고를 봤으면 다시 보여주지 않아요)
function afterSplash() {
  const current = loadProfile();
  if (current && current.mbtiDone) {
    window.location.replace("home.html");
    return false;
  }
}
if (splashSeen()) afterSplash();
else renderSplash(afterSplash);
