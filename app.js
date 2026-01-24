const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";

/* =========================
   🎵 MÚSICA
========================= */
const playlist = [
  "sounds/song1.mp3",
  "sounds/song2.mp3",
  "sounds/song3.mp3"
];

const music = document.getElementById("music-player");
const musicToggle = document.getElementById("music-toggle");
const volume = document.getElementById("music-volume");

let songIndex = 0;
let playing = false;

music.muted = true;
music.preload = "auto";
music.volume = volume.value;

musicToggle.onclick = async () => {
  if (!playing) {
    music.src = playlist[songIndex];
    music.muted = false;
    await music.play();
    playing = true;
    musicToggle.textContent = "⏸️ Música";
  } else {
    music.pause();
    playing = false;
    musicToggle.textContent = "▶️ Música";
  }
};

volume.oninput = () => (music.volume = volume.value);

music.onended = () => {
  songIndex = (songIndex + 1) % playlist.length;
  music.src = playlist[songIndex];
  music.play();
};

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
const backToSets = document.getElementById("back-to-sets");
const backToCards = document.getElementById("back-to-cards");
const filterSelect = document.getElementById("filter");

/* =========================
   ESTADO
========================= */
let currentSetId = null;
let page = 1;
let pageSize = 50;
let loading = false;
let finished = false;
let allCards = [];

/* =========================
   EXPANSIONES
========================= */
async function loadSets() {
  const res = await fetch("https://api.pokemontcg.io/v2/sets", {
    headers: { "X-Api-Key": API_KEY }
  });
  const data = await res.json();

  setsContainer.innerHTML = "";

  data.data.forEach(set => {
    const d = document.createElement("div");
    d.className = "set-card";
    d.innerHTML = `
      <img src="${set.images.logo}">
      <h3>${set.name}</h3>
      <div class="set-date">${set.releaseDate || ""}</div>
    `;
    d.onclick = () => openSet(set.id, set.name);
    setsContainer.appendChild(d);
  });
}

/* =========================
   ABRIR SET
========================= */
function openSet(id, name) {
  currentSetId = id;
  page = 1;
  finished = false;
  allCards = [];

  cardsContainer.innerHTML = "";
  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
  cardScreen.classList.add("hidden");

  setTitle.textContent = name;
  loadNextPage(true);
}

/* =========================
   CARTAS
========================= */
async function loadNextPage(auto = false) {
  if (loading || finished) return;
  loading = true;

  const res = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=set.id:${currentSetId}&page=${page}&pageSize=${pageSize}`,
    { headers: { "X-Api-Key": API_KEY } }
  );
  const data = await res.json();

  if (!data.data.length) {
    finished = true;
    return;
  }

  data.data.forEach(card => {
    allCards.push(card);

    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <img src="${card.images.small}">
      <h4>${card.name}</h4>
    `;
    d.onclick = () => openCard(card);
    cardsContainer.appendChild(d);
  });

  page++;
  loading = false;
  if (auto) setTimeout(() => loadNextPage(true), 300);
}

/* =========================
   FILTROS (AQUÍ ESTÁ EL DE EXPANSIÓN)
========================= */
filterSelect.onchange = () => {
  let list = [...allCards];

  if (filterSelect.value === "az") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (filterSelect.value === "za") {
    list.sort((a, b) => b.name.localeCompare(a.name));
  }
  if (filterSelect.value === "set") {
    list.sort((a, b) => a.set.name.localeCompare(b.set.name));
  }

  cardsContainer.innerHTML = "";
  list.forEach(card => {
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <img src="${card.images.small}">
      <h4>${card.name}</h4>
    `;
    d.onclick = () => openCard(card);
    cardsContainer.appendChild(d);
  });
};

/* =========================
   FICHA
========================= */
function openCard(card) {
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");

  cardDetail.innerHTML = `
    <img src="${card.images.large}">
    <h2>${card.name}</h2>
    <p><strong>Expansión:</strong> ${card.set.name}</p>
    <p><strong>Número:</strong> ${card.number}</p>
  `;
}

backToSets.onclick = () => {
  cardsScreen.classList.add("hidden");
  setsScreen.classList.remove("hidden");
};

backToCards.onclick = () => {
  cardScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
};

loadSets();
