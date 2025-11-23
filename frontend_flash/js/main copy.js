// --- Data inicial (10 palabras de ejemplo) ---
const SAMPLE_CARDS = [
  { en: "apple", es: "manzana" },
  { en: "book", es: "libro" },
  { en: "house", es: "casa" },
  { en: "car", es: "carro / coche" },
  { en: "computer", es: "computadora" },
  { en: "table", es: "mesa" },
  { en: "chair", es: "silla" },
  { en: "water", es: "agua" },
  { en: "music", es: "música" },
  { en: "friend", es: "amigo / amiga" }
];

const STORAGE_KEY = "flashcards_dracula_v1";

let cards = [];
let currentIndex = 0;
let showTranslation = false;
let currentFilter = "all"; // all | new | learned

// --- Helpers de LocalStorage ---
function loadCards() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cards = parsed;
        return;
      }
    } catch (e) {
      console.warn("Error parsing stored cards:", e);
    }
  }
  // Si no hay nada guardado, usamos las 10 de ejemplo
  cards = SAMPLE_CARDS.map((c, i) => ({
    id: i + 1,
    en: c.en,
    es: c.es,
    learned: false
  }));
  saveCards();
}

function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

// --- Lógica de filtros y selección ---
function getFilteredIndices() {
  if (currentFilter === "all") {
    return cards.map((_, idx) => idx);
  }
  if (currentFilter === "new") {
    return cards
      .map((c, idx) => (!c.learned ? idx : null))
      .filter((x) => x !== null);
  }
  if (currentFilter === "learned") {
    return cards
      .map((c, idx) => (c.learned ? idx : null))
      .filter((x) => x !== null);
  }
  return cards.map((_, idx) => idx);
}

function pickRandomIndex() {
  const indices = getFilteredIndices();
  if (indices.length === 0) {
    return null;
  }
  const rnd = Math.floor(Math.random() * indices.length);
  return indices[rnd];
}

function clampCurrentIndexToFilter() {
  const indices = getFilteredIndices();
  if (indices.length === 0) {
    currentIndex = -1;
    return;
  }
  if (!indices.includes(currentIndex)) {
    currentIndex = indices[0];
  }
}

// --- Render UI ---
function renderStats() {
  const statsEl = document.getElementById("stats");
  const total = cards.length;
  const learnedCount = cards.filter((c) => c.learned).length;
  const newCount = total - learnedCount;

  statsEl.innerHTML = `
    <span>Total: ${total}</span>
    <span>New: ${newCount}</span>
    <span>Learned: ${learnedCount}</span>
  `;

  // Progreso
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const pct = total ? (learnedCount / total) * 100 : 0;
  progressFill.style.width = pct + "%";
  progressText.textContent = `${learnedCount} / ${total} learned`;
}

function renderFilterInfo() {
  const filterInfo = document.getElementById("filterInfo");
  let label = "all";
  if (currentFilter === "new") label = "new";
  if (currentFilter === "learned") label = "learned";
  filterInfo.textContent = `Filter: ${label}`;

  document
    .querySelectorAll(".filter-chip")
    .forEach((chip) => chip.classList.remove("active"));
  const active = document.querySelector(
    `.filter-chip[data-filter="${currentFilter}"]`
  );
  if (active) active.classList.add("active");
}

function renderCard() {
  const wordEn = document.getElementById("wordEn");
  const wordEs = document.getElementById("wordEs");
  const statusBadge = document.getElementById("statusBadge");
  const hint = document.getElementById("hint");

  const filteredIndices = getFilteredIndices();

  if (filteredIndices.length === 0) {
    wordEn.textContent = "No cards for this filter";
    wordEs.textContent = "Change the filter to see more words.";
    wordEs.classList.remove("hidden");
    statusBadge.textContent = "Empty";
    statusBadge.classList.add("new");
    hint.textContent = "Try selecting another filter or reset progress.";
    return;
  }

  if (currentIndex === -1) {
    currentIndex = filteredIndices[0];
  }

  const card = cards[currentIndex];
  wordEn.textContent = card.en;
  wordEs.textContent = card.es;

  // Estado de la traducción
  const btnToggle = document.getElementById("btnToggleTranslation");
  if (showTranslation) {
    wordEs.classList.remove("hidden");
    btnToggle.innerHTML = `<span class="icon">🙈</span><span>Hide translation</span>`;
  } else {
    wordEs.classList.add("hidden");
    btnToggle.innerHTML = `<span class="icon">👁️</span><span>Show translation</span>`;
  }

  // Badge de estado
  if (card.learned) {
    statusBadge.textContent = "Learned";
    statusBadge.classList.remove("new");
  } else {
    statusBadge.textContent = "New";
    statusBadge.classList.add("new");
  }

  // Texto de ayuda
  hint.textContent =
    "Try to remember the Spanish word, then show the translation. Mark it as learned when you feel comfortable.";
}

function renderAll() {
  renderStats();
  renderFilterInfo();
  renderCard();
}

// --- Eventos ---
function goNextRandom() {
  const idx = pickRandomIndex();
  if (idx === null) return;
  currentIndex = idx;
  showTranslation = false;
  renderAll();
}

function goPrevRandom() {
  // Para esta versión simple, también usamos random hacia atrás.
  goNextRandom();
}

function toggleTranslation() {
  showTranslation = !showTranslation;
  renderCard();
}

function toggleLearned() {
  if (currentIndex < 0 || currentIndex >= cards.length) return;
  cards[currentIndex].learned = !cards[currentIndex].learned;
  saveCards();
  renderAll();
}

function setFilter(filter) {
  currentFilter = filter;
  clampCurrentIndexToFilter();
  showTranslation = false;
  renderAll();
}

function resetProgress() {
  if (!confirm("Reset learned status for all words?")) return;
  cards = cards.map((c) => ({ ...c, learned: false }));
  saveCards();
  showTranslation = false;
  currentFilter = "all";
  currentIndex = 0;
  renderAll();
}

function speakCurrentWord() {
  if (!("speechSynthesis" in window)) {
    alert("Text-to-Speech not supported in this browser.");
    return;
  }
  if (currentIndex < 0 || currentIndex >= cards.length) return;
  const word = cards[currentIndex].en;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// --- Init ---
document.addEventListener("DOMContentLoaded", () => {
  loadCards();
  clampCurrentIndexToFilter();
  renderAll();

  // Botones
  document
    .getElementById("btnNext")
    .addEventListener("click", goNextRandom);
  document
    .getElementById("btnPrev")
    .addEventListener("click", goPrevRandom);
  document
    .getElementById("btnToggleTranslation")
    .addEventListener("click", toggleTranslation);
  document
    .getElementById("btnToggleLearned")
    .addEventListener("click", toggleLearned);
  document
    .getElementById("btnReset")
    .addEventListener("click", resetProgress);
  document
    .getElementById("btnSpeak")
    .addEventListener("click", speakCurrentWord);

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.getAttribute("data-filter");
      setFilter(filter);
    });
  });
});


const API_URL = "http://localhost:8000";

// --- Funciones API ---

async function apiListCards() {
  const res = await fetch(`${API_URL}/cards`);
  if (!res.ok) throw new Error("Error al leer /cards");
  return await res.json(); // array de { id, english, spanish, created_at }
}

async function apiCreateCard(english, spanish) {
  const res = await fetch(`${API_URL}/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ english, spanish }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error al crear card");
  }
  return await res.json(); // la card creada
}

async function apiDeleteCard(id) {
  const res = await fetch(`${API_URL}/cards/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al borrar card");
  return await res.json();
}

async function initApp() {
  try {
    const apiCards = await apiListCards();

    // Convertimos el formato del backend a tu formato actual
    cards = apiCards.map(c => ({
      id: c.id,
      en: c.english,
      es: c.spanish,
      learned: false  // por ahora, porque el backend aún no guarda esto
    }));

    console.log("Cards listas para usar:", cards);

    renderAll();  // aquí usamos tu render
  } catch (err) {
    console.error("Error cargando cards desde el backend:", err);
  }
}

window.addEventListener("load", initApp);
