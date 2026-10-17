// ⑤ 상추 메인 다이어트 레시피 - 메뉴 그림 카드 목록 → 누르면 세부 설명이 아래에서 올라와요

requireLogin();
renderTabbar("menu");

// 메뉴 그림 (위에서 내려다본 접시) + 시간 · 칼로리 · 재료
const RECIPE_EXTRA = {
  cheongSangchu: {
    time: "15분", kcal: "약 320kcal",
    ingredients: ["청상추 8장", "두부 1/2모", "현미밥 1/2공기", "저염 간장", "참기름"],
    art:
      '<circle cx="100" cy="82" r="66" fill="#fff"/><circle cx="100" cy="82" r="58" fill="#f6f9f2"/>' +
      '<path d="M48 70 C40 48 66 34 80 46 C88 30 112 36 108 56 C120 60 116 84 98 84 C90 96 62 96 56 84 C44 84 40 74 48 70Z" fill="#9fd77a"/>' +
      '<path d="M58 72 C64 60 84 56 96 66" stroke="#7cc068" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<rect x="62" y="58" width="18" height="16" rx="3" fill="#fff3d6" stroke="#e8c98f" stroke-width="2"/>' +
      '<rect x="82" y="62" width="18" height="16" rx="3" fill="#ffe6b0" stroke="#e0b46a" stroke-width="2"/>' +
      '<path d="M104 92 C96 80 116 70 130 76 C146 72 156 90 146 100 C150 114 128 120 118 110 C104 116 98 102 104 92Z" fill="#b6e38c"/>' +
      '<ellipse cx="126" cy="96" rx="14" ry="10" fill="#fffaf0" stroke="#e7dcc4" stroke-width="2"/>' +
      '<g fill="#c9b79a"><circle cx="120" cy="94" r="1.6"/><circle cx="128" cy="98" r="1.6"/><circle cx="131" cy="92" r="1.6"/></g>' +
      '<circle cx="132" cy="56" r="11" fill="#8a5a3a"/><circle cx="129" cy="53" r="3" fill="#fff" opacity=".5"/>',
  },
  jeokSangchu: {
    time: "20분", kcal: "약 360kcal",
    ingredients: ["적상추 6장", "닭가슴살 1팩", "방울토마토 5개", "오이 1/3개", "발사믹 · 올리브오일"],
    art:
      '<circle cx="100" cy="82" r="66" fill="#fff"/><circle cx="100" cy="82" r="58" fill="#f6f9f2"/>' +
      '<g transform="rotate(-18 100 82)">' +
      '<rect x="46" y="64" width="108" height="38" rx="19" fill="#c25c82"/>' +
      '<rect x="52" y="68" width="96" height="30" rx="15" fill="#e7f6d6"/>' +
      '<rect x="60" y="72" width="40" height="8" rx="4" fill="#f3d9b1"/><rect x="64" y="84" width="36" height="7" rx="3.5" fill="#efcf9d"/>' +
      '<circle cx="112" cy="78" r="6" fill="#ff6b5b"/><circle cx="124" cy="88" r="6" fill="#ff6b5b"/>' +
      '<circle cx="138" cy="78" r="5" fill="#8fd19e"/><circle cx="138" cy="78" r="2.5" fill="#dff5e3"/>' +
      '<path d="M46 72 C40 82 40 88 46 96" stroke="#9c3b63" stroke-width="5" fill="none" stroke-linecap="round"/></g>' +
      '<path d="M70 124 Q100 132 130 124" stroke="#7a4a2a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>',
  },
  romaine: {
    time: "15분", kcal: "약 290kcal",
    ingredients: ["로메인 1포기", "그릭요거트 3큰술", "레몬즙", "마늘가루", "삶은 달걀 1개", "아몬드 한 줌"],
    art:
      '<circle cx="100" cy="82" r="66" fill="#fff"/><circle cx="100" cy="82" r="58" fill="#eef7f1"/>' +
      '<g fill="#a9dd86"><path d="M60 98 C52 74 62 46 78 40 C82 62 80 82 74 100Z"/><path d="M80 104 C78 76 92 44 108 40 C110 66 102 88 92 106Z" fill="#bfe79b"/>' +
      '<path d="M100 106 C104 80 124 52 142 54 C138 78 124 96 110 108Z"/></g>' +
      '<path d="M68 96 C68 76 74 58 78 48 M88 100 C92 78 100 58 106 48 M108 102 C116 84 128 66 138 60" stroke="#e9f6dc" stroke-width="2" fill="none"/>' +
      '<path d="M62 90 C80 82 116 84 140 92" stroke="#fffaf0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>' +
      '<g><ellipse cx="128" cy="104" rx="12" ry="9" fill="#fff"/><circle cx="128" cy="104" r="5" fill="#ffc94d"/></g>' +
      '<g><ellipse cx="74" cy="110" rx="11" ry="8" fill="#fff"/><circle cx="74" cy="110" r="4.5" fill="#ffc94d"/></g>' +
      '<g fill="#c99b6d"><ellipse cx="98" cy="118" rx="4" ry="2.5"/><ellipse cx="108" cy="114" rx="4" ry="2.5" transform="rotate(30 108 114)"/><ellipse cx="90" cy="112" rx="4" ry="2.5" transform="rotate(-20 90 112)"/></g>',
  },
  cheonggyeongchae: {
    time: "10분", kcal: "약 180kcal",
    ingredients: ["청경채 3포기", "두부 1/3모", "들기름 1큰술", "소금 약간", "통깨"],
    art:
      '<circle cx="100" cy="82" r="66" fill="#fff"/><circle cx="100" cy="82" r="58" fill="#fdf6ea"/>' +
      '<ellipse cx="100" cy="86" rx="46" ry="34" fill="#fffaf0" stroke="#f1e4c9" stroke-width="3"/>' +
      '<g><path d="M70 92 C64 74 78 62 90 70 C94 82 86 94 70 92Z" fill="#5a9c4e"/><path d="M74 90 C78 82 84 76 88 72" stroke="#eef6df" stroke-width="4" stroke-linecap="round"/></g>' +
      '<g><path d="M104 70 C112 54 132 60 130 76 C120 84 106 82 104 70Z" fill="#4f9144"/><path d="M108 72 C116 70 122 68 128 66" stroke="#eef6df" stroke-width="4" stroke-linecap="round"/></g>' +
      '<g><path d="M96 104 C92 88 112 82 120 94 C118 106 104 110 96 104Z" fill="#6aab5c"/><path d="M100 102 C106 98 112 94 116 92" stroke="#eef6df" stroke-width="4" stroke-linecap="round"/></g>' +
      '<g fill="#fffdf6" stroke="#eadfc8" stroke-width="1.5"><circle cx="90" cy="80" r="6"/><circle cx="112" cy="88" r="5"/><circle cx="82" cy="100" r="5"/><circle cx="118" cy="76" r="4"/></g>' +
      '<g fill="#f3e2b8"><ellipse cx="100" cy="78" rx="2" ry="1.2"/><ellipse cx="88" cy="92" rx="2" ry="1.2"/><ellipse cx="110" cy="100" rx="2" ry="1.2"/><ellipse cx="124" cy="84" rx="2" ry="1.2"/></g>',
  },
  basil: {
    time: "15분", kcal: "약 340kcal",
    ingredients: ["바질 잎 10장", "방울토마토 8개", "저지방 모짜렐라", "닭가슴살 1팩", "올리브오일 · 발사믹"],
    art:
      '<circle cx="100" cy="82" r="66" fill="#fff"/><circle cx="100" cy="82" r="58" fill="#f6f9f2"/>' +
      '<g>' +
      '<circle cx="68" cy="70" r="13" fill="#ff6b5b"/><circle cx="68" cy="70" r="8" fill="#ff8f80"/>' +
      '<circle cx="86" cy="62" r="12" fill="#fffdf5" stroke="#efe6d2" stroke-width="2"/>' +
      '<circle cx="106" cy="60" r="13" fill="#ff6b5b"/><circle cx="106" cy="60" r="8" fill="#ff8f80"/>' +
      '<circle cx="126" cy="66" r="12" fill="#fffdf5" stroke="#efe6d2" stroke-width="2"/>' +
      '<circle cx="138" cy="84" r="12" fill="#ff6b5b"/><circle cx="138" cy="84" r="7" fill="#ff8f80"/></g>' +
      '<g fill="#3f9a4f"><ellipse cx="78" cy="56" rx="6" ry="10" transform="rotate(-30 78 56)"/><ellipse cx="96" cy="52" rx="6" ry="10" transform="rotate(20 96 52)"/>' +
      '<ellipse cx="118" cy="56" rx="6" ry="10" transform="rotate(-10 118 56)"/><ellipse cx="134" cy="72" rx="6" ry="10" transform="rotate(40 134 72)"/></g>' +
      '<g fill="#f0cf9e" stroke="#d9ad6e" stroke-width="2"><rect x="64" y="92" width="26" height="12" rx="6" transform="rotate(-8 77 98)"/><rect x="92" y="98" width="28" height="12" rx="6" transform="rotate(6 106 104)"/></g>' +
      '<path d="M62 116 Q100 124 140 110" stroke="#7a4a2a" stroke-width="2.5" fill="none" stroke-dasharray="3 5" stroke-linecap="round"/>',
  },
  mint: {
    time: "10분 + 차갑게 30분", kcal: "약 150kcal",
    ingredients: ["민트 잎 한 줌", "오이 1개", "그릭요거트 1컵", "레몬즙", "소금 약간"],
    art:
      '<circle cx="100" cy="82" r="66" fill="#fff"/>' +
      '<ellipse cx="100" cy="84" rx="58" ry="52" fill="#d9eef7"/>' +
      '<ellipse cx="100" cy="84" rx="48" ry="42" fill="#eaf7e4"/>' +
      '<path d="M60 90 C74 80 88 98 102 88 C116 78 128 94 140 86" stroke="#d3ecc4" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<g><circle cx="80" cy="72" r="10" fill="#8fd19e"/><circle cx="80" cy="72" r="7" fill="#e3f6dd"/><g fill="#b6dfa5"><circle cx="77" cy="70" r="1.2"/><circle cx="83" cy="70" r="1.2"/><circle cx="80" cy="75" r="1.2"/></g></g>' +
      '<g><circle cx="114" cy="98" r="10" fill="#8fd19e"/><circle cx="114" cy="98" r="7" fill="#e3f6dd"/><g fill="#b6dfa5"><circle cx="111" cy="96" r="1.2"/><circle cx="117" cy="96" r="1.2"/><circle cx="114" cy="101" r="1.2"/></g></g>' +
      '<g fill="#3fae8a"><ellipse cx="108" cy="70" rx="6" ry="11" transform="rotate(35 108 70)"/><ellipse cx="118" cy="74" rx="5" ry="10" transform="rotate(75 118 74)"/>' +
      '<ellipse cx="86" cy="100" rx="5" ry="9" transform="rotate(-40 86 100)"/></g>' +
      '<g fill="#fff" opacity=".8"><rect x="134" y="58" width="9" height="9" rx="2" transform="rotate(15 138 62)"/><rect x="58" y="104" width="8" height="8" rx="2" transform="rotate(-20 62 108)"/></g>',
  },
};

const RECIPE_ORDER = ["cheongSangchu", "jeokSangchu", "romaine", "cheonggyeongchae", "basil", "mint"];

// 메뉴 사진: images/recipes/{작물}.webp 가 있으면 사진을, 없으면 그림을 보여줘요
function recipeArt(id) {
  return (
    '<svg viewBox="0 0 200 164" aria-hidden="true">' + RECIPE_EXTRA[id].art + "</svg>" +
    '<img class="recipe-photo" src="images/recipes/' + id + '.webp" alt="' + PLANTS[id].recipeTitle + '" onerror="this.remove()" />'
  );
}

function openRecipe(id) {
  const plant = PLANTS[id];
  const x = RECIPE_EXTRA[id];
  document.getElementById("rsArt").innerHTML = recipeArt(id);
  document.getElementById("rsChar").innerHTML = getCharacterSvg(id);
  document.getElementById("rsPlant").textContent = "주재료 " + plant.name;
  document.getElementById("rsTitle").textContent = plant.recipeTitle;
  document.getElementById("rsMeta").innerHTML = "<span>⏱ " + x.time + "</span><span>🔥 " + x.kcal + "</span>";
  document.getElementById("rsIngredients").innerHTML = x.ingredients.map((i) => "<span>" + i + "</span>").join("");
  document.getElementById("rsSteps").innerHTML = plant.recipe.map((s) => "<li>" + s + "</li>").join("");
  document.getElementById("recipeSheet").classList.add("open");
  document.getElementById("recipeSheet").scrollTop = 0;
}

function closeRecipe() {
  document.getElementById("recipeSheet").classList.remove("open");
}

(function renderList() {
  const profile = loadProfile();
  const mine = profile && profile.plantId;
  const list = document.getElementById("recipeList");
  // 내 식물 레시피를 맨 앞에
  const order = mine ? [mine].concat(RECIPE_ORDER.filter((id) => id !== mine)) : RECIPE_ORDER;
  list.innerHTML = order
    .map(
      (id) =>
        '<button class="recipe-tile" type="button" data-id="' + id + '">' +
        (id === mine ? '<span class="rt-mine">내 식물</span>' : "") +
        '<span class="rt-art">' + recipeArt(id) + "</span>" +
        '<span class="rt-plant">' + PLANTS[id].name + "</span>" +
        '<span class="rt-title">' + PLANTS[id].recipeTitle + "</span>" +
        '<span class="rt-meta">⏱ ' + RECIPE_EXTRA[id].time.split(" ")[0] + " · " + RECIPE_EXTRA[id].kcal.replace("약 ", "") + "</span>" +
        "</button>"
    )
    .join("");
  list.addEventListener("click", (e) => {
    const tile = e.target.closest(".recipe-tile");
    if (tile) openRecipe(tile.dataset.id);
  });
})();

document.getElementById("rsClose").addEventListener("click", closeRecipe);
document.getElementById("recipeSheet").addEventListener("click", (e) => {
  if (e.target.id === "recipeSheet") closeRecipe();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeRecipe();
});
