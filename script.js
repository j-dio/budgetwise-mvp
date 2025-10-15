// script.js
// Image Popup functionality
const learnMoreBtn = document.getElementById("learnMoreBtn");
const popup = document.getElementById("imagePopup");
const closeBtn = document.getElementById("closePopup");
const popupImage = document.getElementById("popupImage");
const imageContainer = document.getElementById("imageContainer");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");
const zoomResetBtn = document.getElementById("zoomReset");

const ZOOM_STEP = 0.1;
const MAX_ZOOM = 3;
const MIN_ZOOM = 1;

if (learnMoreBtn && popup && closeBtn && popupImage && imageContainer) {
  let scale = 1;
  let panning = false;
  let pointX = 0;
  let pointY = 0;
  let start = { x: 0, y: 0 };
  let dragged = false;

  // --- Helper: Apply transform ---
  function setTransform() {
    popupImage.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
  }

  // --- Helper: Reset zoom ---
  function resetZoom() {
    scale = 1;
    pointX = 0;
    pointY = 0;
    setTransform();
    popupImage.classList.remove("zoomed");
    imageContainer.classList.remove("zoomed");
  }

  // --- Popup open/close ---
  function closePopup() {
    popup.classList.remove("active");
    document.body.style.overflow = "auto";
    resetZoom();
  }

  learnMoreBtn.addEventListener("click", (e) => {
    e.preventDefault();
    popup.classList.add("active");
    document.body.style.overflow = "hidden";
    resetZoom();
  });

  closeBtn.addEventListener("click", closePopup);

  popup.addEventListener("click", (e) => {
    if (e.target === popup) closePopup();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup.classList.contains("active")) closePopup();
  });

  // --- Scroll wheel zoom toward cursor ---
  imageContainer.addEventListener("wheel", (e) => {
    e.preventDefault();

    const zoomIntensity = 0.05; // smaller = smoother
    const rect = popupImage.getBoundingClientRect();

    // Mouse position relative to image
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Relative coordinates before scaling
    const prevX = (mouseX - pointX) / scale;
    const prevY = (mouseY - pointY) / scale;

    // Apply zoom
    if (e.deltaY < 0)
      scale *= 1 + zoomIntensity; // zoom in
    else scale /= 1 + zoomIntensity; // zoom out

    if (scale < MIN_ZOOM) scale = MIN_ZOOM;
    if (scale > MAX_ZOOM) scale = MAX_ZOOM;

    // Keep zoom centered on mouse position
    pointX = mouseX - prevX * scale;
    pointY = mouseY - prevY * scale;

    if (scale > 1) {
      popupImage.classList.add("zoomed");
      imageContainer.classList.add("zoomed");
    } else {
      resetZoom();
    }

    setTransform();
  });

  // --- Zoom buttons (optional) ---
  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      scale += ZOOM_STEP;
      if (scale > MAX_ZOOM) scale = MAX_ZOOM;
      popupImage.classList.add("zoomed");
      imageContainer.classList.add("zoomed");
      setTransform();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      scale -= ZOOM_STEP;
      if (scale < MIN_ZOOM) resetZoom();
      else setTransform();
    });
  }

  if (zoomResetBtn) {
    zoomResetBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      resetZoom();
    });
  }

  // --- Panning (persistent drag) ---
  popupImage.addEventListener("mousedown", (e) => {
    if (scale > 1) {
      e.preventDefault();
      start = { x: e.clientX - pointX, y: e.clientY - pointY };
      panning = true;
      dragged = false;
      imageContainer.style.cursor = "grabbing";
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (!panning) return;
    e.preventDefault();
    dragged = true;
    pointX = e.clientX - start.x;
    pointY = e.clientY - start.y;
    setTransform();
  });

  window.addEventListener("mouseup", () => {
    panning = false;
    imageContainer.style.cursor = "grab";
  });

  // --- Click to zoom toggle (only if not dragged) ---
  popupImage.addEventListener("click", (e) => {
    if (dragged) {
      dragged = false;
      return;
    }

    const rect = popupImage.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (scale === 1) {
      const targetZoom = 1.5; // adjust as desired
      const prevScale = scale;
      scale = targetZoom;

      // Compute relative position before zoom
      const relX = (clickX - pointX) / prevScale;
      const relY = (clickY - pointY) / prevScale;

      // Adjust so zoom focuses where clicked
      pointX = clickX - relX * scale;
      pointY = clickY - relY * scale;

      popupImage.classList.add("zoomed");
      imageContainer.classList.add("zoomed");
    } else {
      resetZoom();
    }

    setTransform();
  });

  popupImage.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      scale = initialScale * (currentDistance / initialDistance);
      if (scale < MIN_ZOOM) scale = MIN_ZOOM;
      if (scale > MAX_ZOOM) scale = MAX_ZOOM;
      popupImage.classList.add("zoomed");
      imageContainer.classList.add("zoomed");
      setTransform();
    } else if (e.touches.length === 1 && panning) {
      e.preventDefault();
      pointX = e.touches[0].clientX - start.x;
      pointY = e.touches[0].clientY - start.y;
      setTransform();
    }
  });

  popupImage.addEventListener("touchend", () => {
    panning = false;
    imageContainer.style.cursor = "grab";
  });

  function getDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("cardModal");
  const closeBtn = modal.querySelector(".close-btn");
  const floatingCards = document.querySelectorAll(".floating-card");
  const donutEl = document.getElementById("donutChart");
  const legendEl = document.getElementById("legend");
  const totalBudgetEl = document.getElementById("totalBudget") || null;
  const addBtn = document.getElementById("addCategoryBtn");
  const addForm = document.getElementById("addCategoryForm");
  const newNameInput = document.getElementById("newCatName");
  const newAmountInput = document.getElementById("newCatAmount");
  const addColorPalette = document.getElementById("addColorPalette");
  const saveNewBtn = document.getElementById("saveNewCategory");
  const cancelNewBtn = document.getElementById("cancelNewCategory");

  // Palette — adjust as you like (keeps to blue theme)
  const colorPalette = ["#1f2937", "#3b82f6", "#60a5fa", "#93c5fd", "#2563eb"];

  // Default categories (sum = 250.00)
  let categories = [
    { name: "Food", amount: 75.0, color: "#1f2937" },
    { name: "Transportation", amount: 62.5, color: "#3b82f6" },
    { name: "Orders", amount: 50.0, color: "#93c5fd" },
    { name: "Grocery", amount: 62.5, color: "#60a5fa" },
  ];

  // Utility: format currency
  function formatCurrency(v) {
    return "₱" + Number(v).toFixed(2);
  }

  function calculateTotal() {
    return categories.reduce((s, c) => s + Number(c.amount || 0), 0);
  }

  // Render donut based on categories
  function renderDonut() {
    const total = calculateTotal();
    if (totalBudgetEl) {
      totalBudgetEl.textContent = formatCurrency(total);
    }

    const centerHtml = `<div class="donut-center"></div>`;

    if (total <= 0) {
      donutEl.style.background = "#e5e7eb";
      donutEl.innerHTML = centerHtml;
      return;
    }

    // Build conic-gradient
    let start = 0;
    const stops = categories.map((c) => {
      const deg = (Number(c.amount) / total) * 360;
      const seg = `${c.color} ${start}deg ${start + deg}deg`;
      start += deg;
      return seg;
    });
    donutEl.style.background = `conic-gradient(${stops.join(", ")})`;
    donutEl.innerHTML = centerHtml;
  }

  // Render legend (editable rows)
  function renderLegend() {
    legendEl.innerHTML = "";
    categories.forEach((c, i) => {
      const row = document.createElement("div");
      row.className = "legend-item-flex";
      row.dataset.index = i;

      // markup: left color + name, right amount + edit/delete
    row.innerHTML = `
      <div class="legend-left">
        <span class="legend-color" style="background:${c.color}"></span>
        <span class="legend-name">${escapeHtml(c.name)}</span>
      </div>

      <div class="legend-details">
        <span class="legend-amount">${formatCurrency(c.amount)}</span>
        <button class="edit-btn" data-idx="${i}" aria-label="Edit"><i class="fa-solid fa-pen"></i></button>
        <button class="del-btn" data-idx="${i}" aria-label="Delete"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

      legendEl.appendChild(row);
    });
  }

  // Smooth expand/collapse animation for category details
  // Handle clicks on legend items and color circles separately
  document.addEventListener("click", (e) => {
    const colorCircle = e.target.closest(".legend-color");
    const item = e.target.closest(".legend-item-flex");

    // ✅ CASE 1: Clicked on color circle → open color picker
    if (colorCircle) {
      e.stopPropagation(); // prevent triggering slide-down
      const index = Number(item.dataset.index);
      openColorPicker(colorCircle, index);
      return;
    }

    // ✅ CASE 2: Clicked inside a legend item (not color) → toggle details
    if (item && !e.target.closest(".edit-btn") && !e.target.closest(".del-btn")) {
      const details = item.querySelector(".legend-details");
      if (!details) return;

      const isOpen = item.classList.contains("active");

      if (isOpen) {
        const currentHeight = details.scrollHeight;
        details.style.maxHeight = currentHeight + "px";
        details.offsetHeight; // force reflow
        details.style.maxHeight = "0";
        item.classList.remove("active");
      } else {
        details.style.maxHeight = details.scrollHeight + "px";
        item.classList.add("active");

        // 🔥 after animation ends, set to auto so it won't cut
        details.addEventListener(
          "transitionend",
          () => {
            if (item.classList.contains("active")) {
              details.style.maxHeight = "none";
            }
          },
          { once: true }
        );
      }
    }
  });

  // Setup add-form color swatches
  function populateAddColors() {
    addColorPalette.innerHTML = "";
    colorPalette.forEach((col, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "color-swatch";
      btn.style.background = col;
      btn.dataset.color = col;
      if (idx === 0) btn.classList.add("selected");
      addColorPalette.appendChild(btn);

      btn.addEventListener("click", () => {
        addColorPalette
          .querySelectorAll(".color-swatch")
          .forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
    });
  }

  // Add new category
  function addCategoryFromForm() {
    const name = newNameInput.value.trim();
    const amount = parseFloat(newAmountInput.value);
    const sw = addColorPalette.querySelector(".color-swatch.selected");
    const color = sw ? sw.dataset.color : colorPalette[0];

    if (!name || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid category name and amount (> 0).");
      return;
    }

    categories.push({ name, amount, color });
    newNameInput.value = "";
    newAmountInput.value = "";
    addForm.classList.add("hidden");
    renderSafe();
  }


  // Floating color picker (like Notion label picker)
  function openColorPicker(anchorEl, index) {
    // Close existing picker if open
    const existing = document.querySelector(".color-picker-popup");
    if (existing) existing.remove();

    const picker = document.createElement("div");
    picker.className = "color-picker-popup";

    colorPalette.forEach((col) => {
      const swatch = document.createElement("button");
      swatch.className = "color-swatch";
      swatch.style.background = col;
      if (col === categories[index].color) swatch.classList.add("selected");
      picker.appendChild(swatch);

      swatch.addEventListener("click", () => {
        categories[index].color = col;
        renderSafe();
        picker.remove();
      });
    });

    // Position near clicked circle
    const rect = anchorEl.getBoundingClientRect();
    picker.style.position = "absolute";
    picker.style.left = `${rect.left + window.scrollX}px`;
    picker.style.top = `${rect.bottom + window.scrollY + 6}px`;
    picker.style.zIndex = 9999;

    document.body.appendChild(picker);

    requestAnimationFrame(() => picker.classList.add("show"));

    // Close picker when clicking outside
    const closePicker = (e) => {
      if (!picker.contains(e.target)) {
        picker.remove();
        document.removeEventListener("click", closePicker);
      }
    };
    setTimeout(() => document.addEventListener("click", closePicker), 10);
  }

  // Edit a category inline
  function openEditFormAt(index) {
    const container = legendEl.children[index];
    const cat = categories[index];

    container.innerHTML = `
      <div class="legend-left">
        <span class="legend-color" style="background:${cat.color}"></span>
        <input 
          type="text" 
          class="edit-name" 
          value="${escapeHtml(cat.name)}"
          placeholder="Category name"
        />
      </div>

      <div class="legend-details active legend-editing">
        <input 
          type="number" 
          step="0.01" 
          class="edit-amount"
          value="${Number(cat.amount).toFixed(2)}"
          placeholder="Amount"
        />
        <div class="edit-actions">
          <button class="save-edit" data-idx="${index}" aria-label="Save">
            <i class="fa-solid fa-check"></i>
          </button>
          <button class="cancel-edit" data-idx="${index}" aria-label="Cancel">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    `;

    const nameInput = container.querySelector(".edit-name");
    nameInput.focus();
    nameInput.select();

    container.querySelector(".save-edit").addEventListener("click", () => {
      const newName = nameInput.value.trim() || cat.name;
      const newAmt = parseFloat(container.querySelector(".edit-amount").value) || cat.amount;

      if (newAmt <= 0) {
        alert("Amount must be greater than 0");
        return;
      }

      categories[index] = { ...cat, name: newName, amount: newAmt };
      renderSafe();
    });

    container.querySelector(".cancel-edit").addEventListener("click", () => renderSafe());
  }


  // Safe helper to escape text (very minimal)
  function escapeHtml(str) {
    return String(str).replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[m]
    );
  }

  // Render everything and attach listeners
  function renderSafe() {
    renderDonut();
    renderLegend();
    attachLegendListeners();
  }

  function safeRender() {
    legendEl.classList.add("rendering");
    requestAnimationFrame(() => {
      renderAll();
      setTimeout(() => legendEl.classList.remove("rendering"), 150);
    });
  }

  function attachLegendListeners() {
    // delete
    legendEl.querySelectorAll(".del-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = Number(btn.dataset.idx);
        if (!Number.isNaN(idx)) {
          categories.splice(idx, 1);
          renderSafe();
        }
      });
    });

    // edit
    legendEl.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = Number(btn.dataset.idx);
        if (!Number.isNaN(idx)) openEditFormAt(idx);
      });
    });

    // also allow clicking the name to open edit form
    legendEl.querySelectorAll(".legend-name").forEach((el, idx) => {
      el.addEventListener("click", () => openEditFormAt(idx));
    });
  }

  // show/hide add form
  addBtn.addEventListener("click", () => {
    addForm.classList.toggle("hidden");
    if (!addForm.classList.contains("hidden")) {
      newNameInput.focus();
    }
  });

  saveNewBtn.addEventListener("click", addCategoryFromForm);
  cancelNewBtn.addEventListener("click", () => {
    addForm.classList.add("hidden");
    newNameInput.value = "";
    newAmountInput.value = "";
  });

  // prepare color palette & initial render
  populateAddColors();
  renderSafe();

// Modal Opening and Closing Animation
  const p250Card = document.querySelector(".floating-card.p250-card");

  if (p250Card) {
    p250Card.addEventListener("click", () => {
      // Add smooth transition
      modal.style.display = "flex";
      modal.setAttribute("aria-hidden", "false");

      // Prevent body scroll
      document.body.style.overflow = "hidden";

      // Add entrance animation (fade/slide in)
      requestAnimationFrame(() => {
        modal.classList.add("modal-active");
      });

      renderSafe();

      // Focus management for accessibility
      const firstInput = modal.querySelector("input, button");
      if (firstInput) firstInput.focus();
    });
  }

  // --- Smooth modal close ---
  function closeModal() {
    modal.classList.remove("modal-active");
    setTimeout(() => {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "auto";
    }, 300); // matches your CSS transition duration
  }

  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("modal-active")) {
      closeModal();
    }
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    }
  });

  // escape key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    }
  });
});
