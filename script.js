// wait for page to fully load
document.addEventListener("DOMContentLoaded", () => {
  // get references to modal and class button
  const modal = document.getElementById("cardModal");
  const closeBtn = document.querySelector(".close-btn");

  // get all floating cards
  const floatingCards = document.querySelectorAll(".floating-card");

  // for each card, add a click event
  floatingCards.forEach((card) => {
    card.addEventListener("click", () => {
      modal.style.display = "flex"; // show modal
    });
  });

  // close modal when x button is clicked
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  })

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

})