const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");

const setsScreen = document.getElementById("sets-screen");
const cardsScreen = document.getElementById("cards-screen");
const cardScreen = document.getElementById("card-screen");

const setsDiv = document.getElementById("sets");
const cardsDiv = document.getElementById("cards");
const cardDetail = document.getElementById("card-detail");

const setTitle = document.getElementById("set-title");
const filter = document.getElementById("filter");
const loadMoreBtn = document.getElementById("load-more");

let currentSetId = null;
let currentPage = 1;
let pageSize = 30;
let hasMore = true;
let allCards = [];

/* FILTROS */
filter.innerHTML = `
  <option value="az">A–Z</option>
  <option value="za">Z–A</option>
  <option value="num">Número</option>
`;

/* EXPANSIONES */
async function loadSets() {
  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando expansiones…";

  const res = await fetch("https://api.pokemontcg.io/v2/sets");
  const data = await res.json();

  setsDiv.innerHTML = "";
  data.data.forEach(set => {
    const d = document.createElement("div");
    d.className = "set-card";
    d.innerHTML = `
      <img src="${set.images.logo}">
      <h3>${set.name}</h3>
      <div>${set.releaseDate || ""}</div>
    `;
    d.onclick = () => openSet(set.id, set.name);
    setsDiv.appendChild(d);
  });

  loader.classList.add("hidden");
}

/* ABRIR SET */
async function openSet(id, name) {
  currentSetId = id;
  currentPage = 1;
  hasMore = true;
  allCards = [];

  setTitle.textContent = name;
  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
  cardsDiv.innerHTML = "";

  await loadMoreCards();
}

/* CARGAR CARTAS (30 REAL) */
async function loadMoreCards() {
  if (!hasMore) return;

  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando cartas…";

  const res = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=set.id:${currentSetId}&page=${currentPage}&pageSize=${pageSize}`
  );
  const data = await res.json();

  if (data.data.length < pageSize) hasMore = false;

  data.data.forEach(card => {
    allCards.push(card);
    renderCard(card);
  });

  currentPage++;
  loader.classList.add("hidden");

  if (hasMore) loadMoreBtn.classList.remove("hidden");
  else loadMoreBtn.classList.add("hidden");
}

/* RENDER CARTA */
function renderCard(card) {
  const d = document.createElement("div");
  d.className = "card";
  d.innerHTML = `
    <img src="${card.images.small}">
    <div class="price">${card.cardmarket?.prices?.averageSellPrice ?? "—"} €</div>
    <h4>${card.name}</h4>
  `;
  d.onclick = () => openCard(card);
  cardsDiv.appendChild(d);
}

/* BOTÓN CARGAR MÁS */
loadMoreBtn.onclick = loadMoreCards;

/* CARTA ABIERTA */
function openCard(card) {
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");

  cardDetail.innerHTML = `
    <button id="back-to-cards">⬅ Volver</button>
    <img src="${card.images.large}">
    <h2>${card.name}</h2>
    <p><b>Set:</b> ${card.set.name}</p>
    <p><b>Fecha:</b> ${card.set.releaseDate || "—"}</p>
    <p><b>Número:</b> ${card.number}</p>
    <p><b>Rareza:</b> ${card.rarity || "—"}</p>
  `;

  document.getElementById("back-to-cards").onclick = () => {
    cardScreen.classList.add("hidden");
    cardsScreen.classList.remove("hidden");
  };
}

/* VOLVER */
document.getElementById("back-to-sets").onclick = () => {
  cardsScreen.classList.add("hidden");
  setsScreen.classList.remove("hidden");
};

loadSets();
