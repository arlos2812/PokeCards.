const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";

/* =========================
   MUSICA
========================= */
const music = document.getElementById("music-player");
const toggleBtn = document.getElementById("music-toggle");
const volume = document.getElementById("music-volume");

const tracks = [
  "music/song1.mp3",
  "music/song2.mp3",
  "music/song3.mp3"
];

let playing = false;
let currentTrack = 0;

music.src = tracks[currentTrack];
music.loop = true;
music.volume = volume.value;

toggleBtn.onclick = () => {
  if (!playing) {
    music.play();
    toggleBtn.textContent = "⏸ Pausar";
  } else {
    music.pause();
    toggleBtn.textContent = "▶ Música";
  }
  playing = !playing;
};

volume.oninput = () => music.volume = volume.value;

/* =========================
   FETCH CON TIMEOUT
========================= */
function fetchWithTimeout(url, options = {}, timeout = 10000) {
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
const pageSize = 30;
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

    if (!res.ok) throw new Error("API error");

    const json = await res.json();
    if (!json.data) throw new Error("Datos inválidos");

    setsContainer.innerHTML = "";

    json.data
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
    setsContainer.innerHTML = `
      <p style="text-align:center;color:#ff6b6b">
        ❌ Error cargando expansiones<br>
        Revisa tu conexión
      </p>`;
  } finally {
    loader.classList.add("hidden");
  }
}

/* =========================
   ABRIR EXPANSION
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

  loadMoreBtn.style.display = "block";
  loadNextPage();
}

/* =========================
   CARGAR CARTAS (30)
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

    const json = await res.json();

    if (!json.data.length) {
      finished = true;
      loadMoreBtn.style.display = "none";
      return;
    }

    json.data.forEach(renderCard);
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
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <img src="${card.images.small}" loading="lazy">
    <h4>${card.name}</h4>
  `;
  div.onclick = () => openCard(card);
  cardsContainer.appendChild(div);
}

/* =========================
   DETALLE CARTA
========================= */
function openCard(card) {
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");

  cardDetail.innerHTML = `
    <button class="load-more" onclick="closeCard()">⬅ Salir</button>
    <img src="${card.images.large}">
    <h2>${card.name}</h2>
    <p><strong>Expansión:</strong> ${card.set.name}</p>
    <p><strong>Número:</strong> ${card.number}</p>
    <p><strong>Rareza:</strong> ${card.rarity || "—"}</p>
  `;
}

function closeCard() {
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
