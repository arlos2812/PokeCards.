document.addEventListener("DOMContentLoaded", () => {

const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";
const PAGE_SIZE = 40;

/* =========================
   UI
========================= */
const setsScreen = document.getElementById("sets-screen");
const cardsScreen = document.getElementById("cards-screen");
const cardScreen = document.getElementById("card-screen");

const setsContainer = document.getElementById("sets");
const cardsContainer = document.getElementById("cards");
const cardDetail = document.getElementById("card-detail");
const loadMoreBtn = document.getElementById("load-more");

const setTitle = document.getElementById("set-title");
const backToSets = document.getElementById("back-to-sets");
const backToCards = document.getElementById("back-to-cards");

/* =========================
   LOADER
========================= */
const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");

/* =========================
   ESTADO + CACHE
========================= */
let cacheSets = {};
let currentSetId = null;
let currentPage = 1;
let finished = false;

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
      <img src="${set.images.logo}" loading="lazy">
      <h3>${set.name}</h3>
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
  currentPage = 1;
  finished = false;

  cardsContainer.innerHTML = "";
  loadMoreBtn.classList.remove("hidden");

  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
  cardScreen.classList.add("hidden");

  setTitle.textContent = name;

  if (!cacheSets[id]) cacheSets[id] = [];

  await loadMore();
}

/* =========================
   CARGAR MÁS
========================= */
async function loadMore() {
  if (finished) return;

  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando cartas…";

  const res = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=set.id:${currentSetId}&page=${currentPage}&pageSize=${PAGE_SIZE}`,
    { headers: { "X-Api-Key": API_KEY } }
  );
  const data = await res.json();

  if (!data.data || data.data.length === 0) {
    finished = true;
    loadMoreBtn.classList.add("hidden");
    loader.classList.add("hidden");
    return;
  }

  data.data.forEach(card => {
    cacheSets[currentSetId].push(card);
    renderCard(card);
  });

  currentPage++;
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
    <img src="${card.images.small}" loading="lazy">
    <div class="price">${price}</div>
    <h4>${card.name}</h4>
  `;
  d.onclick = () => openCard(card);
  cardsContainer.appendChild(d);
}

/* =========================
   BOTÓN
========================= */
loadMoreBtn.onclick = loadMore;

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
