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

  loader.classList.add("hidden");
}

/* ================= CARTAS ================= */
function openSet(id, name) {
  setId = id;
  page = 1;
  finished = false;
  allCards = [];
  cards.innerHTML = "";

  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
  cardScreen.classList.add("hidden");

  document.getElementById("set-title").textContent = name;
  loadCards(true);
}

async function loadCards(auto) {
  if (loading || finished) return;
  loading = true;

  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando cartas…";

  const res = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&page=${page}&pageSize=50`,
    { headers: { "X-Api-Key": API_KEY } }
  );
  const data = await res.json();

  if (!data.data || data.data.length === 0) {
    finished = true;
    loadingText.textContent = "No hay más cartas";
    setTimeout(() => loader.classList.add("hidden"), 400);
    return;
  }

  allCards.push(...data.data);

  // 🔥 TOP 5
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
      ${topIndex >= 0 ? `<div class="fire">🔥 ${topIndex+1}</div>` : ""}
      <div class="star ${isFav ? "active" : ""}">⭐</div>
      <img src="${c.images.small}">
      <div class="price">${price ? price.toFixed(2)+" €" : "—"}</div>
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
  loading = false;
  loader.classList.add("hidden");

  if (auto) setTimeout(() => loadCards(true), 300);
}

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
  list.forEach(openCardCard => {
    const price = openCardCard.cardmarket?.prices?.averageSellPrice;
    const d = document.createElement("div");
    d.className = "card";
    d.innerHTML = `
      <img src="${openCardCard.images.small}">
      <div class="price">${price ? price.toFixed(2)+" €" : "—"}</div>
      <h4>${openCardCard.name}</h4>
    `;
    d.onclick = () => openCard(openCardCard);
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
    <p>Precio medio: ${price ? price.toFixed(2)+" €" : "—"}</p>
    <a target="_blank" href="https://www.pricecharting.com/search-products?q=${encodeURIComponent(c.name)}">PriceCharting</a><br>
    <a target="_blank" href="${c.cardmarket?.url || "https://www.cardmarket.com"}">CardMarket</a>
  `;
}

/* ================= ESCANEO + AUTOCOMPLETAR ================= */
const scanBtn = document.getElementById("scan-btn");
const camera = document.getElementById("camera-input");

scanBtn.onclick = () => camera.click();

camera.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  setsScreen.classList.add("hidden");
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");

  detail.innerHTML = `
    <h2>Escaneo de carta</h2>
    <img src="${URL.createObjectURL(file)}" style="max-width:280px">
    <input id="scan-input" placeholder="Nombre de la carta">
    <div id="scan-suggestions"></div>
  `;

  const input = document.getElementById("scan-input");
  const suggestions = document.getElementById("scan-suggestions");
  let t = null;

  input.oninput = () => {
    clearTimeout(t);
    if (input.value.length < 2) {
      suggestions.innerHTML = "";
      return;
    }
    t = setTimeout(async () => {
      suggestions.textContent = "Buscando…";
      const r = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=name:${input.value}*&pageSize=5`,
        { headers: { "X-Api-Key": API_KEY } }
      );
      const d = await r.json();
      suggestions.innerHTML = "";
      d.data.forEach(c => {
        const price = c.cardmarket?.prices?.averageSellPrice;
        const el = document.createElement("div");
        el.className = "card";
        el.innerHTML = `
          <img src="${c.images.small}">
          <div class="price">${price ? price.toFixed(2)+" €" : "—"}</div>
          <h4>${c.name}</h4>
          <p>${c.set.name}</p>
        `;
        el.onclick = () => openCard(c);
        suggestions.appendChild(el);
      });
    }, 400);
  };
};

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
