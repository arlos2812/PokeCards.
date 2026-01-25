document.addEventListener("DOMContentLoaded", () => {

/* ========= API CONFIG ========= */
const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";
const API_HEADERS = {
  headers: { "X-Api-Key": API_KEY }
};

/* ========= 🎵 MÚSICA (3 CANCIONES FUNCIONANDO) ========= */
const music = document.getElementById("music-player");
const toggleMusic = document.getElementById("music-toggle");
const volumeControl = document.getElementById("music-volume");

const songs = [
  "https://arlos2812.github.io/pokecards-assets/sounds/song1.mp3",
  "https://arlos2812.github.io/pokecards-assets/sounds/song2.mp3",
  "https://arlos2812.github.io/pokecards-assets/sounds/song3.mp3"
];

let currentSong = 0;
let isPlaying = false;

music.preload = "auto";
music.src = songs[currentSong];
music.volume = volumeControl.value;

toggleMusic.addEventListener("click", async () => {
  try {
    if (!isPlaying) {
      await music.play();
      isPlaying = true;
      toggleMusic.textContent = "⏸️ Música";
    } else {
      music.pause();
      isPlaying = false;
      toggleMusic.textContent = "▶️ Música";
    }
  } catch (e) {
    console.warn("Audio bloqueado:", e);
  }
});

volumeControl.addEventListener("input", () => {
  music.volume = volumeControl.value;
});

music.addEventListener("ended", () => {
  currentSong = (currentSong + 1) % songs.length;
  music.src = songs[currentSong];
  music.play().catch(() => {});
});

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

  data.data.forEach(card => {
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <img src="${card.images.small}" loading="lazy">
      <div class="price">${card.cardmarket?.prices?.averageSellPrice ?? "—"} €</div>
      <h4>${card.name}</h4>
    `;
    d.onclick = () => openCard(card);
    cardsDiv.appendChild(d);
  });

  currentPage++;
  loader.classList.add("hidden");
  loadMoreBtn.classList.toggle("hidden", !hasMore);
}

/* ========= CARTA ABIERTA ========= */
function openCard(card) {
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");

  const priceChartingUrl =
    "https://www.pricecharting.com/search-products?type=prices&q=" +
    encodeURIComponent(card.name + " " + card.set.name);

  const cardmarketUrl = card.cardmarket?.url;

  cardDetail.innerHTML = `
    <button id="back-to-cards">⬅ Volver</button>
    <img src="${card.images.large}">
    <h2>${card.name}</h2>
    <p><b>Set:</b> ${card.set.name}</p>
    <p><b>Fecha:</b> ${card.set.releaseDate || "—"}</p>
    <p><b>Número:</b> ${card.number} / ${card.set.printedTotal}</p>

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

});
