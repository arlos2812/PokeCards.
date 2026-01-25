const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";

/* =========================
   FETCH CON TIMEOUT
========================= */
function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

/* =========================
   ESTADO
========================= */
let currentSetId = null;
let page = 1;
let pageSize = 20;
let finished = false;

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
const loadMoreBtn = document.getElementById("load-more");
const loader = document.getElementById("global-loading");

/* =========================
   CARGAR EXPANSIONES
========================= */
async function loadSets() {
  try {
    loader.classList.remove("hidden");

    const res = await fetchWithTimeout(
      "https://api.pokemontcg.io/v2/sets",
      { headers: { "X-Api-Key": API_KEY } }
    );

    if (!res.ok) throw new Error("Error API");

    const { data } = await res.json();

    setsContainer.innerHTML = "";

    data
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
      .forEach(set => {
        const div = document.createElement("div");
        div.className = "set-card";
        div.innerHTML = `
          <img src="${set.images.logo}" loading="lazy">
          <h3>${set.name}</h3>
          <div class="set-date">${set.releaseDate || ""}</div>
        `;
        div.onclick = () => openSet(set.id, set.name);
        setsContainer.appendChild(div);
      });

  } catch (e) {
    console.error(e);
    setsContainer.innerHTML = "<p>Error cargando expansiones</p>";
  } finally {
    loader.classList.add("hidden");
  }
}

/* =========================
   ABRIR EXPANSIÓN
========================= */
function openSet(id, name) {
  currentSetId = id;
  page = 1;
  finished = false;
  cardsContainer.innerHTML = "";

  setTitle.textContent = name;
  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
  cardScreen.classList.add("hidden");
  loadMoreBtn.classList.remove("hidden");

  loadNextPage();
}

/* =========================
   CARGAR CARTAS
========================= */
async function loadNextPage() {
  if (finished) return;

  try {
    loader.classList.remove("hidden");

    const res = await fetchWithTimeout(
      `https://api.pokemontcg.io/v2/cards?q=set.id:${currentSetId}&page=${page}&pageSize=${pageSize}`,
      { headers: { "X-Api-Key": API_KEY } }
    );

    if (!res.ok) throw new Error("Error cartas");

    const { data } = await res.json();

    if (!data.length) {
      finished = true;
      loadMoreBtn.classList.add("hidden");
      return;
    }

    data.forEach(renderCard);
    page++;

  } catch (e) {
    console.error(e);
  } finally {
    loader.classList.add("hidden");
  }
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
    <img src="${card.images.small}" loading="lazy">
    <div class="price">${price}</div>
    <h4>${card.name}</h4>
  `;
  div.onclick = () => openCard(card);
  cardsContainer.appendChild(div);
}

/* =========================
   CARTA ABIERTA
========================= */
function openCard(card) {
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");

  cardDetail.innerHTML = `
    <button class="load-more" onclick="goBack()">⬅ Volver</button>
    <img src="${card.images.large}">
    <h2>${card.name}</h2>
    <p>${card.set.name} · #${card.number}</p>
  `;
}

function goBack() {
  cardScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
}

/* =========================
   BOTONES
========================= */
loadMoreBtn.onclick = loadNextPage;
document.getElementById("back-to-sets").onclick = () => {
  cardsScreen.classList.add("hidden");
  setsScreen.classList.remove("hidden");
};

/* INIT */
loadSets();
