/* ================= CONFIG ================= */
const API_KEY = "0ff3e61a-b7b9-4106-8a7e-09f52033f9fd";
const API_BASE = "https://corsproxy.io/?https://api.pokemontcg.io/v2";
const PAGE_SIZE = 30;

/* ================= DOM ================= */
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

/* Música */
const musicPlayer = document.getElementById("music-player");
const musicToggle = document.getElementById("music-toggle");
const musicVolume = document.getElementById("music-volume");

/* ================= STATE ================= */
let currentSetId = null;
let currentPage = 1;

/* ================= HELPERS ================= */
function showLoader(text) {
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
    headers: { "X-Api-Key": API_KEY }
  });
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

/* ================= LOAD SETS ================= */
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
      div.onclick = () => openSet(set.id, set.name);
      setsGrid.appendChild(div);
    });
  } catch {
    loadingText.textContent = "Error cargando expansiones";
  }
  hideLoader();
}

/* ================= OPEN SET ================= */
async function openSet(setId, name) {
  currentSetId = setId;
  currentPage = 1;
  cardsGrid.innerHTML = "";
  setTitle.textContent = name;
  showScreen(cardsScreen);
  await loadCards();
}

/* ================= LOAD CARDS ================= */
async function loadCards() {
  showLoader("Cargando cartas…");
  loadMoreBtn.classList.add("hidden");

  try {
    const data = await apiFetch(
      `${API_BASE}/cards?q=set.id:${currentSetId}&page=${currentPage}&pageSize=${PAGE_SIZE}`
    );

    data.data.forEach(card => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <img src="${card.images.small}">
        <h4>${card.name}</h4>
      `;
      div.onclick = () => openCard(card);
      cardsGrid.appendChild(div);
    });

    if (data.data.length === PAGE_SIZE) {
      loadMoreBtn.classList.remove("hidden");
    }
  } catch {
    loadingText.textContent = "Error cargando cartas";
  }
  hideLoader();
}

/* ================= LOAD MORE ================= */
loadMoreBtn.onclick = () => {
  currentPage++;
  loadCards();
};

/* ================= CARD DETAIL ================= */
function openCard(card) {
  document.getElementById("card-detail").innerHTML = `
    <img src="${card.images.large}">
    <h2>${card.name}</h2>
    <p><strong>Set:</strong> ${card.set.name}</p>
    <p><strong>Nº:</strong> ${card.number}</p>
    <p><strong>Rareza:</strong> ${card.rarity || "—"}</p>
  `;
  showScreen(cardScreen);
}

/* ================= NAV ================= */
backToSetsBtn.onclick = () => showScreen(setsScreen);
backToCardsBtn.onclick = () => showScreen(cardsScreen);

/* ================= MUSIC ================= */
musicPlayer.src = "sounds/music.mp3";
musicPlayer.volume = musicVolume.value;

musicToggle.onclick = () => {
  if (musicPlayer.paused) {
    musicPlayer.play();
    musicToggle.textContent = "⏸ Música";
  } else {
    musicPlayer.pause();
    musicToggle.textContent = "▶️ Música";
  }
};

musicVolume.oninput = () => {
  musicPlayer.volume = musicVolume.value;
};

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", loadSets);
