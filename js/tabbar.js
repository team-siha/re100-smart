// 하단 고정 탭바 (홈 / 기록 / 내 방 / 소통방 / 새싹톡 / 메뉴) + 오른쪽 위 장바구니 - icons.js 필요

function renderTabbar(activeKey) {
  const tabs = [
    { key: "home", href: "home.html", icon: "home", label: "홈" },
    { key: "record", href: "growth.html", icon: "record", label: "기록" },
    { key: "room", href: "myroom.html", icon: "room", label: "내 방" },
    { key: "lounge", href: "lounge.html", icon: "lounge", label: "소통방" },
    { key: "chat", href: "chat.html", icon: "chat", label: "새싹톡" },
    { key: "menu", href: "menu.html", icon: "menu", label: "메뉴" },
  ];
  // 미션·자격증 같은 하위 화면은 "메뉴" 탭을 켜둡니다.
  if (activeKey === "mission") activeKey = "menu";

  const bar = document.createElement("nav");
  bar.className = "bottom-tabbar";
  bar.innerHTML = tabs
    .map(
      (t) =>
        '<a href="' + t.href + '" class="' + (t.key === activeKey ? "active" : "") + '">' +
        icon(t.icon, "tab-icon") +
        "<span>" + t.label + "</span>" +
        "</a>"
    )
    .join("");
  document.body.appendChild(bar);

  const main = document.querySelector("main");
  if (main) main.classList.add("has-tabbar");

  renderCartButton();
  watchKeyboard();
}

// 키보드가 올라오면 아래 메뉴를 숨겨요 (입력하다가 실수로 다른 화면으로 넘어가지 않게)
function watchKeyboard() {
  const isTyping = (el) => el && (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && !["range", "file", "checkbox", "radio"].includes(el.type)));
  const set = (on) => document.body.classList.toggle("keyboard-open", on);
  document.addEventListener("focusin", (e) => { if (isTyping(e.target)) set(true); });
  document.addEventListener("focusout", () => setTimeout(() => set(isTyping(document.activeElement)), 50));
  // 안드로이드처럼 화면 높이가 줄어드는 경우도 함께 확인
  if (window.visualViewport) {
    const full = window.innerHeight;
    window.visualViewport.addEventListener("resize", () => {
      if (window.visualViewport.height < full * 0.75) set(true);
      else if (!isTyping(document.activeElement)) set(false);
    });
  }
}

// 오른쪽 위 장바구니 버튼 (담긴 개수 배지)
function renderCartButton() {
  if (document.getElementById("cartFab")) return;
  const a = document.createElement("a");
  a.id = "cartFab";
  a.className = "cart-fab";
  a.href = "cart.html";
  a.setAttribute("aria-label", "장바구니");
  a.innerHTML = icon("cart") + '<span class="cart-count" id="cartCount"></span>';
  document.body.appendChild(a);
  updateCartBadge();
}

function updateCartBadge() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  const n = loadCart().length;
  el.textContent = n;
  el.style.display = n ? "flex" : "none";
}
