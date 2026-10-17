// 홈 화면 - 프로필 인사말 + 공지 캐러셀(자동재생/이전/다음/일시정지)

requireProfile();
renderTabbar("home");

(function () {
  const profile = loadProfile();
  const text = document.getElementById("greetingText");
  const pointUtil = document.getElementById("pointUtil");
  const heroWelcome = document.getElementById("heroWelcome");
  const heroCharBox = document.getElementById("heroCharBox");

  heroCharBox.innerHTML = getCharacterSvg((profile && profile.plantId) || "basil");

  if (profile && profile.plantId) {
    document.getElementById("greetChar").innerHTML = getCharacterSvg(profile.plantId);
    document.getElementById("greetType").textContent =
      PLANTS[profile.plantId].type + " · 함께한 지 " + getDaysTogether(profile) + "일째";
  }

  if (profile) {
    pointUtil.textContent = (profile.points || 0) + "P";
    const mood = MOODS.find((m) => m.id === profile.moodId) || MOODS[0];
    const displayName = profile.name || getCurrentNickname();
    heroWelcome.textContent = displayName + "님, RE100:SMART 방문을 환영합니다.";
    text.innerHTML =
      "<b>" + escapeHtml(formatProfileLine(profile)) + "</b><br />" +
      "오늘 기분은 " + mood.emoji + " " + mood.label + "! 내 " + escapeHtml(getPlantCallName(profile)) + "도 반가워해요 🌱";
  }
})();

(function () {
  const track = document.getElementById("carouselTrack");
  const pageCur = document.getElementById("pageCur");
  const pageTotal = document.getElementById("pageTotal");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const playBtn = document.getElementById("playBtn");

  let idx = 0;
  let playing = true;
  let timer = null;

  function render() {
    const n = HOME_NOTICES[idx];
    track.innerHTML =
      '<div class="c-title">' + n.title + "</div>" +
      '<div class="c-desc">' + n.desc + "</div>";
    pageCur.textContent = String(idx + 1).padStart(2, "0");
    pageTotal.textContent = String(HOME_NOTICES.length).padStart(2, "0");
  }

  function next() {
    idx = (idx + 1) % HOME_NOTICES.length;
    render();
  }

  function prev() {
    idx = (idx - 1 + HOME_NOTICES.length) % HOME_NOTICES.length;
    render();
  }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(next, 3500);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  nextBtn.addEventListener("click", () => {
    next();
  });
  prevBtn.addEventListener("click", () => {
    prev();
  });
  playBtn.addEventListener("click", () => {
    playing = !playing;
    playBtn.textContent = playing ? "❚❚" : "▶";
    playBtn.setAttribute("aria-label", playing ? "일시정지" : "재생");
    if (playing) startAutoplay();
    else stopAutoplay();
  });

  render();
  startAutoplay();
})();

// 세로 퀵메뉴 탭 - 누르면 팝오버 열고 닫기
(function () {
  const tab = document.getElementById("quickTab");
  const pop = document.getElementById("quickPop");

  tab.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = pop.classList.toggle("open");
    tab.setAttribute("aria-expanded", open);
  });
  document.addEventListener("click", (e) => {
    if (!pop.contains(e.target)) {
      pop.classList.remove("open");
      tab.setAttribute("aria-expanded", false);
    }
  });
})();
