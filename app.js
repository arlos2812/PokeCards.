const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";

/* =========================
   🎵 MÚSICA
========================= */
const music = document.getElementById("music-player");
const musicToggle = document.getElementById("music-toggle");
const volume = document.getElementById("music-volume");

const playlist = [
  "sounds/song1.mp3",
  "sounds/song2.mp3",
  "sounds/song3.mp3"
];

let songIndex = 0;
let playing = false;

if (music && musicToggle && volume) {
  music.volume = volume.value;

  musicToggle.onclick = () => {
    if (!playing) {
      music.src = playlist[songIndex];
      music.play().catch(() => {});
      playing = true;
      musicToggle.textContent = "⏸️ Música";
    } else {
      music.pause();
      playing = false;
      musicToggle.textContent = "▶️ Música";
    }
  };

  volume.oninput = () => music.volume = volume.value;

  music.onended = () => {
    songIndex = (songIndex + 1) % playlist.length;
    music.src = playlist[songIndex];
    music.play().catch(() => {});
  };
}

/* =========================
   ESTADO
========================= */
let currentSetId = null;
let allCards = [];
let loadedCardIds = new Set();

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
const filterSelect = document.getElementById("filter");
const loader = document.getElementById("global-loading");

/* =========================
   FILTROS
========================= */
filterSelect.innerHTML = `
  <option value="az">A–Z</option>
  <option value="za">Z–A</option>
  <option value="price-desc">💰 Precio mayor → menor</option>
  <option value="price-asc">💰 Precio menor → mayor</option>
  <option value="number-asc">🔢 Número de carta</option>
`;

/* =========================
   CARGAR EXPANSIONES
========================= */
async function loadSets() {
  try {
    loader.classList.remove("hidden");

    const res = await fetch("https://api.pokemontcg.io/v2/sets", {
      headers: { "X-Api-Key": API_KEY }
    });

    const json = await res.json();

    setsContainer.innerHTML = "";

    json.data.forEach(set => {
      const div = document.createElement("div");
      div.className = "set-card";
      div.innerHTML = `
        <img src="${set.images.logo}">
        <h3>${set.name}</h3>
        <div class="set-date">${set.releaseDate || ""}</div>
      `;
      div.onclick = () => openSet(set.id, set.name);
      setsContainer.appendChild(div);
    });

  } catch (e) {
    setsContainer.innerHTML = "<p>Error cargando expansiones</p>";
    console.error(e);
  } finally {
    loader.classList.add("hidden");
  }
}

/* =========================
   ABRIR EXPANSIÓN
========================= */
async function openSet(id, name) {
  currentSetId = id;
  allCards = [];
  loadedCardIds.clear();
  cardsContainer.innerHTML = "";

  setTitle.textContent = name;
  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
  cardScreen.classList.add("hidden");

  loader.classList.remove("hidden");

  const res = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=set.id:${id}`,
    { headers: { "X-Api-Key": API_KEY } }
  );

  const json = await res.json();

  json.data.forEach(card => {
    if (!loadedCardIds.has(card.id)) {
      loadedCardIds.add(card.id);
      allCards.push(card);
      renderCard(card);
    }
  });

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

  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <img src="${card.images.small}">
    <div class="price">${price}</div>
    <h4>${card.name}</h4>
  `;
  div.onclick = () => openCard(card);
  cardsContainer.appendChild(div);
}

/* =========================
   FILTROS
========================= */
filterSelect.onchange = () => {
  cardsContainer.innerHTML = "";
  [...allCards].sort((a, b) => {
    if (filterSelect.value === "az") return a.name.localeCompare(b.name);
    if (filterSelect.value === "za") return b.name.localeCompare(a.name);
    if (filterSelect.value === "price-desc")
      return (b.cardmarket?.prices?.averageSellPrice || 0) -
             (a.cardmarket?.prices?.averageSellPrice || 0);
    if (filterSelect.value === "price-asc")
      return (a.cardmarket?.prices?.averageSellPrice || 0) -
             (b.cardmarket?.prices?.averageSellPrice || 0);
    if (filterSelect.value === "number-asc")
      return parseInt(a.number) - parseInt(b.number);
  }).forEach(renderCard);
};

/* =========================
   CARTA ABIERTA
========================= */
function openCard(card) {
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");

  cardDetail.innerHTML = `
    <button class="load-more card-back-fixed" id="back-card">⬅ Volver</button>
    <img src="${card.images.large}">
    <h2>${card.name}</h2>
    <p>Expansión: ${card.set.name}</p>
    <p>Número: ${card.number}</p>
    <a class="load-more" target="_blank"
      href="https://www.pricecharting.com/search-products?q=${encodeURIComponent(card.name + ' ' + card.set.name)}">
      🔗 PriceCharting
    </a>
    <a class="load-more" target="_blank"
      href="${card.cardmarket?.url || 'https://www.cardmarket.com'}">
      🔗 CardMarket
    </a>
  `;

  document.getElementById("back-card").onclick = () => {
    cardScreen.classList.add("hidden");
    cardsScreen.classList.remove("hidden");
  };
}

/* VOLVER A EXPANSIONES */
document.getElementById("back-to-sets").onclick = () => {
  cardsScreen.classList.add("hidden");
  setsScreen.classList.remove("hidden");
};

/* INIT */
loadSets();
