// ================= CONFIG =================
const API_KEY = "0ff3e61a-b7b9-4106-8a7e-09f52033f9fd";
const API_BASE = "https://api.pokemontcg.io/v2";

// ================= DOM =================
const setsGrid = document.getElementById("sets");
const cardsGrid = document.getElementById("cards");
const setTitle = document.getElementById("set-title");

const setsScreen = document.getElementById("sets-screen");
const cardsScreen = document.getElementById("cards-screen");
const cardScreen = document.getElementById("card-screen");

const backToSetsBtn = document.getElementById("back-to-sets");
const backToCardsBtn = document.getElementById("back-to-cards");
const loadMoreBtn = document.getElementById("load-more");

const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");

// Música
const musicPlayer = document.getElementById("music-player");
const musicToggle = document.getElementById("music-toggle");
const musicVolume = document.getElementById("music-volume");

// ================= STATE =================
let currentSetId = null;
let currentPage = 1;
const PAGE_SIZE = 30;

// ================= HELPERS =================
function showLoader(text = "Cargando…") {
  loadingText.textContent = text;
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

function showScreen(screen) {
  setsScreen.classList.add("hidden");
  cardsScreen.classList.add("hidden");
  cardScreen.classList.add("hidden");
  screen.classList.remove("hidden");
}

async function apiFetch(url) {
  const res = await fetch(url, {
    headers: {
      "X-Api-Key": API_KEY
    }
  });

  if (!res.ok) {
    throw new Error("HTTP " + res.status);
  }

  return res.json();
}

// ================= LOAD SETS =================
async function loadSets() {
  showLoader("Cargando expansiones…");

  try {
    const data = await apiFetch(`${API_BASE}/sets`);
    setsGrid.innerHTML = "";

    data.data.forEach(set => {
      const div = document.createElement("div");
      div.className = "set-card";
      div.innerHTML = `
        <img src="${set.images.logo}" alt="${set.name}">
        <h3>${set.name}</h3>
        <div class="set-date">${set.releaseDate || ""}</div>
      `;

      div.addEventListener("click", () => openSet(set.id, set.name));
      setsGrid.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    loadingText.textContent = "Error cargando expansiones";
  }

  hideLoader();
}

// ================= OPEN SET =================
async function openSet(setId, setName) {
  currentSetId = setId;
  currentPage = 1;
  cardsGrid.innerHTML = "";
  setTitle.textContent = setName;

  showScreen(cardsScreen);
  await loadCards();
}

// ================= LOAD CARDS =================
async function loadCards() {
  showLoader("Cargando cartas…");
  loadMoreBtn.classList.add("hidden");

  try {
    const url = `${API_BASE}/cards?q=set.id:${currentSetId}&page=${currentPage}&pageSize=${PAGE_SIZE}`;
    const data = await apiFetch(url);

    data.data.forEach(card => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <img src="${card.images.small}" alt="${card.name}">
        <h4>${card.name}</h4>
      `;

      div.addEventListener("click", () => openCard(card));
      cardsGrid.appendChild(div);
    });

    if (data.data.length === PAGE_SIZE) {
      loadMoreBtn.classList.remove("hidden");
    }

  } catch (err) {
    console.error(err);
    loadingText.textContent = "Error cargando cartas";
  }

  hideLoader();
}

// ================= LOAD MORE =================
loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  loadCards();
});

// ================= CARD DETAIL =================
function openCard(card) {
  const detail = document.getElementById("card-detail");

  detail.innerHTML = `
    <img src="${card.images.large}" alt="${card.name}">
    <h2>${card.name}</h2>
    <p><strong>Set:</strong> ${card.set.name}</p>
    <p><strong>Nº:</strong> ${card.number}</p>
    <p><strong>Rareza:</strong> ${card.rarity || "—"}</p>
  `;

  showScreen(cardScreen);
}

// ================= NAV =================
backToSetsBtn.addEventListener("click", () => {
  showScreen(setsScreen);
});

backToCardsBtn.addEventListener("click", () => {
  showScreen(cardsScreen);
});

// ================= MUSIC =================
musicPlayer.src = "sounds/music.mp3"; // usa tu archivo real
musicPlayer.volume = musicVolume.value;

musicToggle.addEventListener("click", () => {
  if (musicPlayer.paused) {
    musicPlayer.play();
    musicToggle.textContent = "⏸ Música";
  } else {
    musicPlayer.pause();
    musicToggle.textContent = "▶️ Música";
  }
});

musicVolume.addEventListener("input", () => {
  musicPlayer.volume = musicVolume.value;
});

// ================= INIT =================
document.addEventListener("DOMContentLoaded", loadSets);
