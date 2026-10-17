// 미션 허브 - 로그인 가드 + 탭바 + 포인트 표시

requireLogin();
renderTabbar("mission");

(function () {
  const profile = loadProfile();
  const pointUtil = document.getElementById("pointUtil");
  if (profile) pointUtil.textContent = (profile.points || 0) + "P";
})();
