// ==============================
// CONFIGURACIÓN API
// ==============================
const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";
const API_URL = "https://api.pokemontcg.io/v2";
const headers = { "X-Api-Key": API_KEY };

// ==============================
// ELEMENTOS DEL DOM
// ==============================
const setsScreen = document.getElementById("sets-screen");
const cardsScreen = document.getElementById("cards-screen");

const setsContainer = document.getElementById("sets");
const cardsContainer = document.getElementById("cards");

const loader = document.getElementById("global-loading");
const loaderText = document.getElementById("loading-text");

const setTitle = document.getElementById("set-title");
const setSummary = document.getElementById("set-summary");

// ==============================
// ESTADO
// ==============================
let currentSetId = null;
let page = 1;
const pageSize = 50;
let totalCards = 0;
let loadedCards = 0;
let loading = false;
let finished = false;

// ==============================
// LOADER (CLAVE)
// ==============================
function showLoader(text) {
  loader.classList.remove("hidden");
  loader.style.pointerEvents = "auto";
  loaderText.textContent = text;
}

function hideLoader() {
  loader.classList.add("hidden");
  loader.style.pointerEvents = "none";
}

// ==============================
// CARGAR EXPANSIONES
// ==============================
async function loadSets() {
  showLoader("Cargando expansiones…");

  try {
    const res = await fetch(`${API_URL}/sets`, { headers });
    const json = await res.json();
    const sets = json.data;

    setsContainer.innerHTML = "";

    sets.forEach(set => {
      const div = document.createElement("div");
      div.className = "set-card";
      div.innerHTML = `
        <img src="${set.images.logo}" alt="${set.name}">
        <h3>${set.name}</h3>
        <div class="set-date">${set.releaseDate || ""}</div>
      `;

      // 🔥 CLICK FUNCIONAL
      div.addEventListener("click", () => {
        openSet(set.id, set.name);
      });

      setsContainer.appendChild(div);
    });

  } catch (err) {
    console.error("Error cargando expansiones", err);
    alert("Error al cargar expansiones");
  } finally {
    hideLoader(); // 🔥 SIEMPRE SE QUITA
  }
}

// ==============================
// ABRIR EXPANSIÓN
// ==============================
async function openSet(id, name) {
  currentSetId = id;
  page = 1;
  loadedCards = 0;
  finished = false;
  cardsContainer.innerHTML = "";

  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");

  setTitle.textContent = name;
  setSummary.textContent = "";

  showLoader("Cargando cartas… 0%");

  try {
    // Obtener total de cartas
    const countRes = await fetch(
      `${API_URL}/cards?q=set.id:${id}&pageSize=1`,
      { headers }
    );
    const countJson = await countRes.json();
    totalCards = countJson.totalCount;

    setSummary.textContent = `Total de cartas: ${totalCards}`;

    loadNextPage();
  } catch (err) {
    console.error("Error contando cartas", err);
    hideLoader();
  }
}

// ==============================
// CARGA 50 EN 50
// ==============================
async function loadNextPage() {
  if (loading || finished) return;
  loading = true;

  const percent = totalCards
    ? Math.floor((loadedCards / totalCards) * 100)
    : 0;

  loaderText.textContent =
    `Cargando cartas… ${loadedCards} de ${totalCards} (${percent}%)`;

  try {
    const res = await fetch(
      `${API_URL}/cards?q=set.id:${currentSetId}&page=${page}&pageSize=${pageSize}`,
      { headers }
    );
    const json = await res.json();
    const cards = json.data;

    if (!cards.length) {
      finished = true;
      loaderText.textContent = "Cartas cargadas (100%)";
      setTimeout(hideLoader, 600);
      return;
    }

    cards.forEach(card => {
      const price = card.cardmarket?.prices?.averageSellPrice;

      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <img src="${card.images.small}">
        <div class="price">${price ? price.toFixed(2) + " €" : "—"}</div>
        <h4>${card.name}</h4>
      `;

      cardsContainer.appendChild(div);
    });

    loadedCards += cards.length;
    page++;
    loading = false;

    // 🔁 siguiente lote automático
    setTimeout(loadNextPage, 200);

  } catch (err) {
    console.error("Error cargando cartas", err);
    hideLoader();
  }
}

// ==============================
// INICIO
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  hideLoader();      // 🔥 por seguridad
  loadSets();        // cargar expansiones
});
