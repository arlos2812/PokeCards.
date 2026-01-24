document.addEventListener("DOMContentLoaded", () => {

const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";

/* =========================
   🎵 MÚSICA
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

music.volume = volume.value;

musicToggle.onclick = () => {
  if (!playing) {
    music.src = playlist[songIndex];
    music.play();
    playing = true;
    musicToggle.textContent = "⏸️ Música";
  } else {
    music.pause();
    playing = false;
    musicToggle.textContent = "▶️ Música";
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

/* =========================
   LOADER
========================= */
const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");

/* =========================
   ESTADO
========================= */
let currentSetId = null;
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
async function openSet(id, name) {
  currentSetId = id;
  allCards = [];
  cardsContainer.innerHTML = "";

  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
  cardScreen.classList.add("hidden");

  setTitle.textContent = name;

  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando cartas…";

  let page = 1;
  let finished = false;

  while (!finished) {
    const res = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=set.id:${id}&page=${page}&pageSize=250`,
      { headers: { "X-Api-Key": API_KEY } }
    );
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      finished = true;
      break;
    }

    data.data.forEach(card => {
      allCards.push(card);
      renderCard(card);
    });

    page++;
  }

  loader.classList.add("hidden");
}

/* =========================
   RENDER CARTA
========================= */
function renderCard(card) {
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

    <a target="_blank"
      href="https://www.pricecharting.com/search-products?q=${encodeURIComponent(card.name)}">
      PriceCharting
    </a><br>

    <a target="_blank"
      href="${card.cardmarket?.url || "https://www.cardmarket.com"}">
      CardMarket
    </a>
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

});
