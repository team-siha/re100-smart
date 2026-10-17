// 메뉴 화면 - 전체 기능 그리드 + 포인트 표시 + 로그아웃

requireLogin();
renderTabbar("menu");

(function () {
  const profile = loadProfile();
  const pointUtil = document.getElementById("pointUtil");
  if (profile) pointUtil.textContent = (profile.points || 0) + "P";
})();

document.getElementById("logoutBtn").addEventListener("click", confirmLogout);
