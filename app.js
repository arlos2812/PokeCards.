const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";

/* =========================
   🎵 MÚSICA (FIX DEFINITIVO)
========================= */
const playlist = [
  "sounds/song1.mp3",
  "sounds/song2.mp3",
  "sounds/song3.mp3"
];

const music = document.getElementById("music-player");
const musicToggle = document.getElementById("music-toggle");
const volume = document.getElementById("music-volume");

let songIndex = 0;
let playing = false;

// 🔑 desbloqueo obligatorio para móviles
music.muted = true;
music.preload = "auto";
music.volume = volume.value;

musicToggle.onclick = async () => {
  try {
    if (!playing) {
      music.src = playlist[songIndex];
      music.muted = false;
      await music.play();
      playing = true;
      musicToggle.textContent = "⏸️ Música";
    } else {
      music.pause();
      playing = false;
      musicToggle.textContent = "▶️ Música";
    }
  } catch (e) {
    console.error(e);
  }
};

volume.oninput = () => (music.volume = volume.value);

music.onended = () => {
  songIndex = (songIndex + 1) % playlist.length;
  music.src = playlist[songIndex];
  music.play();
};

/* =========================
   UI
========================= */
const setsScreen = document.getElementById("sets-screen");
const cardsScreen = document.getElementById("cards-screen");
const cardScreen = document.getElementById("card-screen");

const setsContainer = document.getElementById("sets");
const cardsContainer = document.getElementById("cards");
const cardDetail = document.getElementById("card-detail");

const setTitle = document.getElementById("set-title");
const backToSets = document.getElementById("back-to-sets");
const backToCards = document.getElementById("back-to-cards");
const filterSelect = document.getElementById("filter");

/* =========================
   LOADER
========================= */
const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");

/* =========================
   ESTADO
========================= */
let currentSetId = null;
let page = 1;
let pageSize = 50;
let loading = false;
let finished = false;
let allCards = [];

/* =========================
   EXPANSIONES
========================= */
async function loadSets() {
  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando expansiones…";

  const res = await fetch("https://api.pokemontcg.io/v2/sets", {
    headers: { "X-Api-Key": API_KEY }
  });
  const data = await res.json();

  setsContainer.innerHTML = "";

  data.data.forEach(set => {
    const d = document.createElement("div");
    d.className = "set-card";
    d.innerHTML = `
      <img src="${set.images.logo}">
      <h3>${set.name}</h3>
      <div class="set-date">${set.releaseDate || ""}</div>
    `;
    d.onclick = () => openSet(set.id, set.name);
    setsContainer.appendChild(d);
  });

  loader.classList.add("hidden");
}

/* =========================
   ABRIR EXPANSIÓN
========================= */
function openSet(id, name) {
  currentSetId = id;
  page = 1;
  finished = false;
  loading = false;
  allCards = [];

  cardsContainer.innerHTML = "";
  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
  cardScreen.classList.add("hidden");

  setTitle.textContent = name;
  loadNextPage(true);
}

/* =========================
   CARGA CARTAS
========================= */
async function loadNextPage(auto = false) {
  if (loading || finished) return;

  loading = true;
  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando cartas…";

  const res = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=set.id:${currentSetId}&page=${page}&pageSize=${pageSize}`,
    { headers: { "X-Api-Key": API_KEY } }
  );
  const data = await res.json();

  if (!data.data.length) {
    finished = true;
    loader.classList.add("hidden");
    return;
  }

  data.data.forEach(card => {
    allCards.push(card);

    const price =
      card.cardmarket?.prices?.averageSellPrice != null
        ? card.cardmarket.prices.averageSellPrice.toFixed(2) + " €"
        : "—";

    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <img src="${card.images.small}">
      <div class="price">${price}</div>
      <h4>${card.name}</h4>
    `;
    d.onclick = () => openCard(card);
    cardsContainer.appendChild(d);
  });

  page++;
  loading = false;
  loader.classList.add("hidden");

  if (auto) setTimeout(() => loadNextPage(true), 300);
}

/* =========================
   FICHA CARTA
========================= */
function openCard(card) {
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");

  const price =
    card.cardmarket?.prices?.averageSellPrice != null
      ? card.cardmarket.prices.averageSellPrice.toFixed(2) + " €"
      : "—";

  cardDetail.innerHTML = `
    <img src="${card.images.large}">
    <h2>${card.name}</h2>
    <p><strong>Expansión:</strong> ${card.set.name}</p>
    <p><strong>Número:</strong> ${card.number}</p>
    <p><strong>Rareza:</strong> ${card.rarity || "—"}</p>
    <p><strong>Precio medio:</strong> ${price}</p>
  `;
}

/* =========================
   VOLVER
========================= */
backToSets.onclick = () => {
  cardsScreen.classList.add("hidden");
  setsScreen.classList.remove("hidden");
};

backToCards.onclick = () => {
  cardScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
};

/* INIT */
loadSets();
