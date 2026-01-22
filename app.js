const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";

/* ===== UI ===== */
const setsScreen = document.getElementById("sets-screen");
const cardsScreen = document.getElementById("cards-screen");

const sets = document.getElementById("sets");
const cards = document.getElementById("cards");

const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");

/* ===== ESTADO ===== */
let currentSetId = null;
let page = 1;
let pageSize = 50;
let totalCards = 0;
let loadedCards = 0;
let loading = false;
let finished = false;

/* ===== EXPANSIONES ===== */
async function loadSets() {
  const res = await fetch("https://api.pokemontcg.io/v2/sets", {
    headers: { "X-Api-Key": API_KEY }
  });
  const data = await res.json();

  sets.innerHTML = data.data.map(s => `
    <div class="set-card" onclick="openSet('${s.id}','${s.name}')">
      <img src="${s.images.logo}">
      <h3>${s.name}</h3>
      <div class="set-date">${s.releaseDate || ""}</div>
    </div>
  `).join("");
}

/* ===== ABRIR EXPANSIÓN ===== */
async function openSet(id, name) {
  currentSetId = id;
  page = 1;
  loadedCards = 0;
  finished = false;
  cards.innerHTML = "";

  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");

  document.getElementById("set-title").textContent = name;

  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando cartas… 0%";

  // obtener total real
  const countRes = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=set.id:${id}&pageSize=1`,
    { headers: { "X-Api-Key": API_KEY } }
  );
  const countData = await countRes.json();
  totalCards = countData.totalCount;

  loadNextPage();
}

/* ===== CARGA PROGRESIVA ===== */
async function loadNextPage() {
  if (loading || finished) return;
  loading = true;

  const percent = Math.floor((loadedCards / totalCards) * 100);
  loadingText.textContent =
    `Cargando cartas… ${loadedCards} de ${totalCards} (${percent}%)`;

  const res = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=set.id:${currentSetId}&page=${page}&pageSize=${pageSize}`,
    { headers: { "X-Api-Key": API_KEY } }
  );
  const data = await res.json();

  if (!data.data.length) {
    finished = true;
    loadingText.textContent = "✅ Cartas cargadas (100%)";
    setTimeout(() => loader.classList.add("hidden"), 900);
    return;
  }

  data.data.forEach(c => {
    const price = c.cardmarket?.prices?.averageSellPrice;
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <img src="${c.images.small}">
      <div class="price">${price ? price.toFixed(2) + " €" : "—"}</div>
      <h4>${c.name}</h4>
    `;
    cards.appendChild(d);
  });

  loadedCards += data.data.length;
  page++;
  loading = false;

  // sigue cargando automáticamente
  setTimeout(loadNextPage, 200);
}

/* ===== INIT ===== */
loadSets();
