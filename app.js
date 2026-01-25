/* ========= API CONFIG ========= */
const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";

const API_HEADERS = {
  headers: {
    "X-Api-Key": API_KEY
  }
};

/* ========= LOADER ========= */
const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");

/* ========= UI ========= */
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
const pageSize = 30;
let hasMore = true;

/* ========= FILTROS ========= */
filter.innerHTML = `
  <option value="az">A–Z</option>
  <option value="za">Z–A</option>
  <option value="num">Número</option>
`;

/* ========= EXPANSIONES ========= */
async function loadSets() {
  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando expansiones…";

  const res = await fetch("https://api.pokemontcg.io/v2/sets", API_HEADERS);
  const data = await res.json();

  setsDiv.innerHTML = "";
  data.data.forEach(set => {
    const d = document.createElement("div");
    d.className = "set-card";
    d.innerHTML = `
      <img src="${set.images.logo}" loading="lazy">
      <h3>${set.name}</h3>
      <div>${set.releaseDate || ""}</div>
    `;
    d.onclick = () => openSet(set.id, set.name);
    setsDiv.appendChild(d);
  });

  loader.classList.add("hidden");
}

/* ========= ABRIR EXPANSIÓN ========= */
async function openSet(id, name) {
  currentSetId = id;
  currentPage = 1;
  hasMore = true;

  setTitle.textContent = name;
  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
  cardsDiv.innerHTML = "";

  await loadMoreCards();
}

/* ========= CARGAR CARTAS ========= */
async function loadMoreCards() {
  if (!hasMore) return;

  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando cartas…";

  const res = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=set.id:${currentSetId}&page=${currentPage}&pageSize=${pageSize}`,
    API_HEADERS
  );
  const data = await res.json();

  if (data.data.length < pageSize) hasMore = false;

  data.data.forEach(card => renderCard(card));
  currentPage++;

  loader.classList.add("hidden");
  loadMoreBtn.classList.toggle("hidden", !hasMore);
}

/* ========= RENDER CARTA ========= */
function renderCard(card) {
  const d = document.createElement("div");
  d.className = "card";
  d.innerHTML = `
    <img src="${card.images.small}" loading="lazy">
    <div class="price">${card.cardmarket?.prices?.averageSellPrice ?? "—"} €</div>
    <h4>${card.name}</h4>
  `;
  d.onclick = () => openCard(card);
  cardsDiv.appendChild(d);
}

/* ========= CARTA ABIERTA (INFO COMPLETA) ========= */
function openCard(card) {
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");

  const priceChartingUrl = `https://www.pricecharting.com/game/pokemon-${card.set.id}/${card.name.toLowerCase().replace(/\s+/g, "-")}-${card.number}`;
  const cardmarketUrl = card.cardmarket?.url;

  cardDetail.innerHTML = `
    <button id="back-to-cards">⬅ Volver</button>

    <img src="${card.images.large}">
    <h2>${card.name}</h2>

    <p><b>Set:</b> ${card.set.name}</p>
    <p><b>Fecha:</b> ${card.set.releaseDate || "—"}</p>
    <p><b>Número:</b> ${card.number} / ${card.set.printedTotal}</p>
    <p><b>Rareza:</b> ${card.rarity || "—"}</p>
    <p><b>HP:</b> ${card.hp || "—"}</p>
    <p><b>Tipos:</b> ${card.types?.join(", ") || "—"}</p>

    ${card.attacks ? `
      <h3>Ataques</h3>
      ${card.attacks.map(a => `
        <p>
          <b>${a.name}</b> (${a.damage || "—"})<br>
          <small>${a.text || ""}</small>
        </p>
      `).join("")}
    ` : ""}

    ${card.weaknesses ? `
      <p><b>Debilidades:</b> ${card.weaknesses.map(w => `${w.type} ${w.value}`).join(", ")}</p>
    ` : ""}

    ${card.resistances ? `
      <p><b>Resistencias:</b> ${card.resistances.map(r => `${r.type} ${r.value}`).join(", ")}</p>
    ` : ""}

    ${card.retreatCost ? `
      <p><b>Coste retirada:</b> ${card.retreatCost.join(", ")}</p>
    ` : ""}

    <h3>Precios</h3>
    <p>
      <b>Media Cardmarket:</b>
      ${card.cardmarket?.prices?.averageSellPrice ?? "—"} €
    </p>

    <div style="margin-top:16px">
      <a href="${priceChartingUrl}" target="_blank">
        <button>PriceCharting</button>
      </a>
      ${cardmarketUrl ? `
        <a href="${cardmarketUrl}" target="_blank">
          <button>Cardmarket</button>
        </a>
      ` : ""}
    </div>
  `;

  document.getElementById("back-to-cards").onclick = () => {
    cardScreen.classList.add("hidden");
    cardsScreen.classList.remove("hidden");
  };
}

/* ========= VOLVER ========= */
document.getElementById("back-to-sets").onclick = () => {
  cardsScreen.classList.add("hidden");
  setsScreen.classList.remove("hidden");
};

/* INIT */
loadSets();
