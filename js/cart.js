// 장바구니 - 다음 작물 모종 키트, 실물 영양제 등을 담아둬요 (구매는 아직 준비중!)

requireProfile();
renderTabbar("menu");

function renderCart() {
  const profile = loadProfile();
  document.getElementById("pointUtil").textContent = (profile.points || 0) + "P";

  const items = loadCart();
  const list = document.getElementById("cartList");
  list.innerHTML = "";
  if (!items.length) {
    list.innerHTML = '<li class="cart-empty">장바구니가 비어있어요 🛒<br /><small>내 식물 기록을 끝내거나 내 방 상점에서 담아보세요!</small></li>';
  }
  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML =
      '<span class="ci-thumb">' + (item.img ? '<img src="' + item.img.replace(".png", ".webp") + '" alt="" />' : icon(item.icon || "nutrient")) + "</span>" +
      '<span class="ci-text"><b>' + escapeHtml(item.name) + "</b><small>" + formatChatTime(item.at) + " 담음</small></span>" +
      '<span class="ci-cost">' + item.cost + "P</span>";
    const del = document.createElement("button");
    del.className = "ci-del";
    del.setAttribute("aria-label", "빼기");
    del.textContent = "✕";
    del.addEventListener("click", () => {
      saveCart(loadCart().filter((c) => c.key !== item.key));
      updateCartBadge();
      renderCart();
    });
    li.appendChild(del);
    list.appendChild(li);
  });

  const total = items.reduce((sum, i) => sum + (i.cost || 0), 0);
  document.getElementById("cartTotal").innerHTML = items.length
    ? "합계 <b>" + total + "P</b> · 보유 " + (profile.points || 0) + "P"
    : "";
  document.getElementById("checkoutBtn").style.display = items.length ? "block" : "none";
}

document.getElementById("checkoutBtn").addEventListener("click", () => {
  document.getElementById("checkoutMsg").style.display = "block";
});

renderCart();
