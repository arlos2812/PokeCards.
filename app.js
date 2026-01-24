const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";

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
  loader.classList.remove("hidden");

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
  loadedCardIds.clear();
  cardsContainer.innerHTML = "";

  setTitle.textContent = name;
  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
  cardScreen.classList.add("hidden");

  loader.classList.remove("hidden");

  const res = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=set.id:${currentSetId}`,
    { headers: { "X-Api-Key": API_KEY } }
  );
  const data = await res.json();

  data.data.forEach(card => {
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
   FILTROS (SIN DUPLICAR)
========================= */
filterSelect.onchange = () => {
  let list = [...allCards];

  switch (filterSelect.value) {
    case "az":
      list.sort((a,b)=>a.name.localeCompare(b.name));
      break;
    case "za":
      list.sort((a,b)=>b.name.localeCompare(a.name));
      break;
    case "price-desc":
      list.sort((a,b)=>(b.cardmarket?.prices?.averageSellPrice||0)-(a.cardmarket?.prices?.averageSellPrice||0));
      break;
    case "price-asc":
      list.sort((a,b)=>(a.cardmarket?.prices?.averageSellPrice||0)-(b.cardmarket?.prices?.averageSellPrice||0));
      break;
    case "number-asc":
      list.sort((a,b)=>parseInt(a.number)-parseInt(b.number));
      break;
  }

  cardsContainer.innerHTML = "";
  list.forEach(renderCard);
};

/* =========================
   CARTA ABIERTA (1 SOLO VOLVER)
========================= */
function openCard(card) {
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");

  const price =
    card.cardmarket?.prices?.averageSellPrice != null
      ? card.cardmarket.prices.averageSellPrice.toFixed(2) + " €"
      : "—";

  const priceChartingUrl =
    "https://www.pricecharting.com/search-products?q=" +
    encodeURIComponent(card.name + " " + card.set.name);

  const cardMarketUrl =
    card.cardmarket?.url || "https://www.cardmarket.com";

  cardDetail.innerHTML = `
    <button id="back-to-cards-top" class="load-more card-back-fixed">
      ⬅ Volver
    </button>

    <img src="${card.images.large}">
    <h2>${card.name}</h2>

    <p><strong>Expansión:</strong> ${card.set.name}</p>
    <p><strong>Número:</strong> ${card.number}</p>
    <p><strong>Rareza:</strong> ${card.rarity || "—"}</p>
    <p><strong>Precio medio:</strong>
      <span class="price">${price}</span>
    </p>

    <div style="margin-top:16px;">
      <a href="${priceChartingUrl}" target="_blank" class="load-more">
        🔗 PriceCharting
      </a>
      <a href="${cardMarketUrl}" target="_blank" class="load-more">
        🔗 CardMarket
      </a>
    </div>
  `;

  document.getElementById("back-to-cards-top").onclick = () => {
    cardScreen.classList.add("hidden");
    cardsScreen.classList.remove("hidden");
  };
}

/* =========================
   BOTÓN VOLVER A EXPANSIONES
========================= */
document.getElementById("back-to-sets").onclick = () => {
  cardsScreen.classList.add("hidden");
  setsScreen.classList.remove("hidden");
};

/* INIT */
loadSets();
