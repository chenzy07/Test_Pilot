const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");

const modalImg = document.getElementById("modalImg");
const modalName = document.getElementById("modalName");
const modalPrice = document.getElementById("modalPrice");
const modalRarity = document.getElementById("modalRarity");

let scrollY = 0;

// OPEN MODAL
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", (e) => {
    if (e.target.closest(".add-btn")) return;

    // SAVE SCROLL POSITION
    scrollY = window.scrollY;

    // LOCK BODY PROPERLY
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    modal.classList.add("active");

    modalImg.src = card.dataset.img;
    modalName.textContent = card.dataset.name;
    modalPrice.textContent = card.dataset.price;

    modalRarity.textContent = card.dataset.rarity;
    modalRarity.className = "rarity-tag rarity-" + card.dataset.rarity;
  });
});

// CLOSE MODAL
function closeModal() {
  modal.classList.remove("active");

  // RESTORE SCROLL
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";

  window.scrollTo(0, scrollY);
}

modalClose.onclick = closeModal;

modal.onclick = (e) => {
  if (e.target === modal) closeModal();
};