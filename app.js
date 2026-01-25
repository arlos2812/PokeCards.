/* ===== LOADER ===== */
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
const loadMoreBtn = document.getElementById("load-more");

let allCards = [];
let visibleCount = 30;

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
  visibleCount = 30;

  const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${id}`);
  const data = await res.json();

  allCards = data.data;
  renderCards();

  loader.classList.add("hidden");
}

/* ===== RENDER ===== */
function renderCards() {
  cardsDiv.innerHTML = "";

  allCards.slice(0, visibleCount).forEach(card => {
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <img src="${card.images.small}">
      <div class="price">${card.cardmarket?.prices?.averageSellPrice ?? "—"} €</div>
      <h4>${card.name}</h4>
    `;
    d.onclick = () => openCard(card);
    cardsDiv.appendChild(d);
  });

  if (visibleCount < allCards.length) {
    loadMoreBtn.classList.remove("hidden");
  } else {
    loadMoreBtn.classList.add("hidden");
  }
}

/* ===== CARGAR MÁS ===== */
loadMoreBtn.onclick = () => {
  visibleCount += 30;
  renderCards();
};

/* ===== FILTRAR ===== */
filter.onchange = () => {
  if (filter.value === "az") allCards.sort((a,b)=>a.name.localeCompare(b.name));
  if (filter.value === "za") allCards.sort((a,b)=>b.name.localeCompare(a.name));
  if (filter.value === "price-desc")
    allCards.sort((a,b)=>(b.cardmarket?.prices?.averageSellPrice||0)-(a.cardmarket?.prices?.averageSellPrice||0));
  if (filter.value === "price-asc")
    allCards.sort((a,b)=>(a.cardmarket?.prices?.averageSellPrice||0)-(b.cardmarket?.prices?.averageSellPrice||0));
  if (filter.value === "num")
    allCards.sort((a,b)=>parseInt(a.number)-parseInt(b.number));

  renderCards();
};

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
