// ⑤ 상추 메인 다이어트 레시피 - 6종 식물 레시피 카드 렌더링

requireLogin();
renderTabbar("menu");

(function () {
  const list = document.getElementById("recipeList");
  const order = ["cheongSangchu", "jeokSangchu", "romaine", "cheonggyeongchae", "basil", "mint"];

  order.forEach((id) => {
    const plant = PLANTS[id];
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML =
      '<div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">' +
      '<div class="char-box small" style="flex:0 0 72px;">' + getCharacterSvg(id) + "</div>" +
      '<div><h2 style="margin:0;">' + plant.recipeTitle + "</h2>" +
      '<div class="hint" style="margin:2px 0 0;">주재료: ' + plant.name + " · " + plant.desc + "</div></div>" +
      "</div>" +
      "<ol style='padding-left:18px; font-size:14px; line-height:1.8; margin:0;'>" +
      plant.recipe.map((step) => "<li>" + step + "</li>").join("") +
      "</ol>";
    list.appendChild(card);
  });
})();
