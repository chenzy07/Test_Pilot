let search = document.getElementById("search");

if (search) {
  search.addEventListener("keyup", function () {
    let value = this.value.toLowerCase();
    let cards = document.querySelectorAll(".card");

    cards.forEach(card => {
      let name = card.querySelector("h4").innerText.toLowerCase();

      if (name.includes(value)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}


function openAuth() {
  document.getElementById("authModal").classList.add("active");
  document.getElementById("authOverlay").classList.add("active");
}

function closeAuth() {
  document.getElementById("authModal").classList.remove("active");
  document.getElementById("authOverlay").classList.remove("active");
}

function showRegister() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";
}

function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("darkModeToggle");

  if (!toggleBtn) return;

  const icon = toggleBtn.querySelector("i");
  let text = toggleBtn.querySelector("span");

  if (!text) {
    text = document.createElement("span");
    toggleBtn.appendChild(text);
  }

  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark");
    icon.className = "fas fa-sun";
    text.textContent = " Light Mode";
  } else {
    icon.className = "fas fa-moon";
    text.textContent = " Dark Mode";
  }

  toggleBtn.addEventListener("click", function () {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      localStorage.setItem("darkMode", "enabled");
      icon.className = "fas fa-sun";
      text.textContent = " Light Mode";
    } else {
      localStorage.setItem("darkMode", "disabled");
      icon.className = "fas fa-moon";
      text.textContent = " Dark Mode";
    }
  });
});

function toggleMenu() {
  document.querySelector(".nav-links").classList.toggle("active");
}

window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");
});

document.querySelectorAll("a").forEach(link => {
  if (link.href && !link.target) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const url = this.href;

      document.body.classList.add("fade-out");

      setTimeout(() => {
        window.location.href = url;
      }, 300);
    });
  }
});

const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");

const modalImg = document.getElementById("modalImg");
const modalName = document.getElementById("modalName");
const modalPrice = document.getElementById("modalPrice");
const modalRarity = document.getElementById("modalRarity");

let scrollY = 0;

function lockScroll() {
  document.body.style.overflow = "hidden";
}

function unlockScroll() {
  document.body.style.overflow = "";
}

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", (e) => {
    if (e.target.closest(".add-btn")) return;

    scrollY = window.scrollY;

    lockScroll();

    modal.classList.add("active");

    modalImg.src = card.dataset.img;
    modalName.textContent = card.dataset.name;
    modalPrice.textContent = card.dataset.price;

    modalRarity.textContent = card.dataset.rarity;
    modalRarity.className = "rarity-tag rarity-" + card.dataset.rarity;
  });
});


function closeModal() {
  modal.classList.remove("active");

  unlockScroll();
}

modalClose.onclick = closeModal;

modal.onclick = (e) => {
  if (e.target === modal) closeModal();
};