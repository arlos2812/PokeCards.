/* ===== LOADER TEXTO ===== */
const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");

/* ===== UI ===== */
const setsScreen = document.getElementById("sets-screen");
const cardsScreen = document.getElementById("cards-screen");
const cardScreen = document.getElementById("card-screen");

const setsDiv = document.getElementById("sets");
const cardsDiv = document.getElementById("cards");
const cardDetail = document.getElementById("card-detail");

const setTitle = document.getElementById("set-title");
const filter = document.getElementById("filter");

let allCards = [];

/* ===== FILTROS ===== */
filter.innerHTML = `
  <option value="az">A–Z</option>
  <option value="za">Z–A</option>
  <option value="price-desc">Precio ↓</option>
  <option value="price-asc">Precio ↑</option>
  <option value="num">Número</option>
`;

/* ===== EXPANSIONES ===== */
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

/* ===== CARTAS ===== */
async function openSet(id, name) {
  setTitle.textContent = name;
  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");

  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando cartas…";

  cardsDiv.innerHTML = "";
  allCards = [];

  const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${id}`);
  const data = await res.json();

  data.data.forEach(card => {
    allCards.push(card);
    renderCard(card);
  });

  loader.classList.add("hidden");
}

function renderCard(card) {
  const d = document.createElement("div");
  d.className = "card";
  d.innerHTML = `
    <img src="${card.images.small}">
    <div class="price">${
      card.cardmarket?.prices?.averageSellPrice ?? "—"
    } €</div>
    <h4>${card.name}</h4>
  `;
  d.onclick = () => openCard(card);
  cardsDiv.appendChild(d);
}

/* ===== CARTA ABIERTA ===== */
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
    <p><b>HP:</b> ${card.hp || "—"}</p>
    <p><b>Tipo:</b> ${card.types?.join(", ") || "—"}</p>
  `;

  document.getElementById("back-to-cards").onclick = () => {
    cardScreen.classList.add("hidden");
    cardsScreen.classList.remove("hidden");
  };
}

/* ===== VOLVER ===== */
document.getElementById("back-to-sets").onclick = () => {
  cardsScreen.classList.add("hidden");
  setsScreen.classList.remove("hidden");
};

/* INIT */
loadSets();
