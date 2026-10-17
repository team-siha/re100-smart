// 첫 화면 - "RE:100 스마트와 함께하기" 프로필 입력
// 예전 이름이면 저장된 정보를 그대로 불러오고, 새 이름이면 프로필을 다 입력해야 시작할 수 있어요.

const nicknameInput = document.getElementById("nicknameInput");
const welcomeBackBox = document.getElementById("welcomeBackBox");
const newUserFields = document.getElementById("newUserFields");
const enterBtn = document.getElementById("enterBtn");
const recentBox = document.getElementById("recentBox");
const moodChipsEl = document.getElementById("moodChips");
const moodBarFill = document.getElementById("moodBarFill");
const moodEmoji = document.getElementById("moodEmoji");
const moodIntensity = document.getElementById("moodIntensity");

let selectedMoodId = "happy";
let selectedGender = "";

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
    enterBtn.textContent = "이어서 시작하기";
  } else {
    welcomeBackBox.style.display = "none";
    newUserFields.style.display = "block";
    enterBtn.textContent = "프로필 완성 · 식물 MBTI 하러 가기";
  }
}

// 이 기기에서 함께했던 이름을 칩으로 보여줘요 (누르면 바로 입력)
function renderRecent() {
  const names = Object.keys(loadUserRegistry());
  if (!names.length) return;
  recentBox.innerHTML = '<div class="recent-label">이 기기에서 함께한 친구</div>';
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

  // 새 유저: 프로필을 다 입력해야 시작할 수 있어요
  const age = document.getElementById("ageInput").value.trim();
  const snackInput = document.getElementById("snackInput");
  const snack = snackInput.value.trim();
  if (!age || !selectedGender || !snack) {
    showAlert("나이, 성별, 사용할 과자봉지을 모두 입력해야\n식물 MBTI를 시작할 수 있어요!", { title: "아직 빈 칸이 있어요" });
    return;
  }
  if (!checkKindWords(snack)) {
    snackInput.value = "";
    return;
  }
  loginWithNickname(nickname, {
    name: nickname,
    age: age,
    gender: selectedGender,
    moodId: selectedMoodId,
    moodIntensity: moodIntensity.value,
    snackName: snack,
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
renderSplash(() => {
  const current = loadProfile();
  if (current && current.mbtiDone) {
    window.location.href = "home.html";
    return false;
  }
});
