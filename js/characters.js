// RE:100 스마트 - 캐릭터 이미지 (images/chars/*.png)
// 채소: 로메인/청경채/바질/민트/청상추/적상추 · 과자: 꽃게랑/포카칩/포스틱/양파링/허니버터칩/빼빼로

const VEGGIE_IDS = ["romaine", "cheonggyeongchae", "basil", "mint", "cheongSangchu", "jeokSangchu"];

// 내 식물 캐릭터 이미지 (기존 호출부 호환을 위해 이름 유지)
function getCharacterSvg(plantId) {
  const id = VEGGIE_IDS.includes(plantId) ? plantId : "basil";
  const name = PLANTS[id] ? PLANTS[id].name : "";
  return '<img class="char-img" src="images/chars/' + id + '.png" alt="' + name + ' 캐릭터" />';
}

// 과자 캐릭터 이미지
function getSnackImg(charId, extraClass) {
  const id = SNACK_CHARS[charId] ? charId : "yangparing";
  return (
    '<img class="snack-img' + (extraClass ? " " + extraClass : "") + '" src="images/chars/' + id +
    '.png" alt="' + SNACK_CHARS[id].name + ' 캐릭터" />'
  );
}

// 눈 감고 자는 버전 (식물의 방)
function getSleepingImg(plantId) {
  const id = VEGGIE_IDS.includes(plantId) ? plantId : "basil";
  return '<img class="char-img" src="images/chars/sleep/' + id + '.png" alt="자고 있는 ' + PLANTS[id].name + '" />';
}

// 특정 엘리먼트에 캐릭터 이미지를 주입하는 헬퍼
function renderCharacterInto(elementId, plantId) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = getCharacterSvg(plantId);
}
