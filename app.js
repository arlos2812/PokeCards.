const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";

/* ================= MÚSICA ================= */
const playlist = ["sounds/song1.mp3","sounds/song2.mp3","sounds/song3.mp3"];
const music = document.getElementById("music-player");
const musicToggle = document.getElementById("music-toggle");
const volume = document.getElementById("music-volume");

let song = 0;
let playing = false;

music.volume = volume.value;

musicToggle.onclick = () => {
  if (!playing) {
    music.src = playlist[song];
    music.play();
    musicToggle.textContent = "⏸️ Música";
    playing = true;
  } else {
    music.pause();
    musicToggle.textContent = "▶️ Música";
    playing = false;
  }
};

volume.oninput = () => music.volume = volume.value;

music.onended = () => {
  song = (song + 1) % playlist.length;
  music.src = playlist[song];
  music.play();
};

/* ================= UI ================= */
const setsScreen = document.getElementById("sets-screen");
const cardsScreen = document.getElementById("cards-screen");
const cardScreen = document.getElementById("card-screen");

const sets = document.getElementById("sets");
const cards = document.getElementById("cards");
const detail = document.getElementById("card-detail");

const backSets = document.getElementById("back-to-sets");
const backCards = document.getElementById("back-to-cards");
const filter = document.getElementById("filter");

const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");
const loadMoreBtn = document.getElementById("load-more");

/* ================= ESTADO ================= */
let setId = null;
let page = 1;
let loading = false;
let finished = false;
let allCards = [];

/* ⭐ FAVORITAS */
const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

const toggleFavorite = card => {
  const i = favorites.findIndex(f => f.id === card.id);
  if (i >= 0) favorites.splice(i, 1);
  else favorites.push(card);
  localStorage.setItem("favorites", JSON.stringify(favorites));
};

/* ================= EXPANSIONES ================= */
async function loadSets() {
  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando expansiones…";

  try {
    const res = await fetch("https://api.pokemontcg.io/v2/sets", {
      headers: { "X-Api-Key": API_KEY }
    });
    const data = await res.json();

    sets.innerHTML = "";
    data.data.forEach(s => {
      const d = document.createElement("div");
      d.className = "set-card";
      d.innerHTML = `
        <img src="${s.images.logo}">
        <h3>${s.name}</h3>
        <div class="set-date">${s.releaseDate || ""}</div>
      `;
      d.onclick = () => openSet(s.id, s.name);
      sets.appendChild(d);
    });
  } catch (e) {
    loadingText.textContent = "Error cargando expansiones";
  }

  loader.classList.add("hidden");
}

/* ================= CARTAS ================= */
function openSet(id, name) {
  setId = id;
  page = 1;
  finished = false;
  allCards = [];
  cards.innerHTML = "";
  loadMoreBtn.style.display = "none";

  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
  cardScreen.classList.add("hidden");

  document.getElementById("set-title").textContent = name;
  loadCards();
}

async function loadCards() {
  if (loading || finished) return;
  loading = true;

  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando cartas…";

  try {
    const res = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&page=${page}&pageSize=30`,
      { headers: { "X-Api-Key": API_KEY } }
    );
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      finished = true;
      loadMoreBtn.style.display = "none";
      loader.classList.add("hidden");
      return;
    }

    allCards.push(...data.data);

    const top5 = [...allCards]
      .filter(c => c.cardmarket?.prices?.averageSellPrice)
      .sort((a,b) =>
        b.cardmarket.prices.averageSellPrice -
        a.cardmarket.prices.averageSellPrice
      )
      .slice(0,5);

    data.data.forEach(c => {
      const price = c.cardmarket?.prices?.averageSellPrice;
      const isFav = favorites.some(f => f.id === c.id);
      const topIndex = top5.findIndex(t => t.id === c.id);

      const d = document.createElement("div");
      d.className = "card";
      d.innerHTML = `
        ${topIndex >= 0 ? `<div class="fire">🔥 ${topIndex + 1}</div>` : ""}
        <div class="star ${isFav ? "active" : ""}">⭐</div>
        <img src="${c.images.small}">
        <div class="price">${price ? price.toFixed(2) + " €" : "—"}</div>
        <h4>${c.name}</h4>
      `;

      d.querySelector(".star").onclick = e => {
        e.stopPropagation();
        toggleFavorite(c);
        e.target.classList.toggle("active");
      };

      d.onclick = () => openCard(c);
      cards.appendChild(d);
    });

    page++;
    loadMoreBtn.style.display = "block";

  } catch (e) {
    loadingText.textContent = "Error cargando cartas";
  }

  loading = false;
  loader.classList.add("hidden");
}

loadMoreBtn.onclick = () => loadCards();

/* ================= FILTROS ================= */
filter.onchange = () => {
  let list = [...allCards];

  if (filter.value === "az") list.sort((a,b)=>a.name.localeCompare(b.name));
  if (filter.value === "za") list.sort((a,b)=>b.name.localeCompare(a.name));
  if (filter.value === "price-desc")
    list.sort((a,b)=>(b.cardmarket?.prices?.averageSellPrice||0)-(a.cardmarket?.prices?.averageSellPrice||0));
  if (filter.value === "price-asc")
    list.sort((a,b)=>(a.cardmarket?.prices?.averageSellPrice||0)-(b.cardmarket?.prices?.averageSellPrice||0));

  cards.innerHTML = "";
  list.forEach(c => {
    const price = c.cardmarket?.prices?.averageSellPrice;
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <img src="${c.images.small}">
      <div class="price">${price ? price.toFixed(2) + " €" : "—"}</div>
      <h4>${c.name}</h4>
    `;
    d.onclick = () => openCard(c);
    cards.appendChild(d);
  });
};

/* ================= FICHA ================= */
function openCard(c) {
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");

  const price = c.cardmarket?.prices?.averageSellPrice;
  detail.innerHTML = `
    <img src="${c.images.large}">
    <h2>${c.name}</h2>
    <p>Expansión: ${c.set.name}</p>
    <p>Número: ${c.number}</p>
    <p>Rareza: ${c.rarity || "—"}</p>
    <p>Precio medio: ${price ? price.toFixed(2) + " €" : "—"}</p>
    <a target="_blank" href="https://www.pricecharting.com/search-products?q=${encodeURIComponent(c.name)}">PriceCharting</a><br>
    <a target="_blank" href="${c.cardmarket?.url || "https://www.cardmarket.com"}">CardMarket</a>
  `;
}

/* ================= VOLVER ================= */
backSets.onclick = () => {
  cardsScreen.classList.add("hidden");
  setsScreen.classList.remove("hidden");
};

backCards.onclick = () => {
  cardScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
};

loadSets();
