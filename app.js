/* ========= MÚSICA ========= */
const music = document.getElementById("music-player");
const toggle = document.getElementById("music-toggle");
const volume = document.getElementById("music-volume");

const songs = ["sounds/song1.mp3", "sounds/song2.mp3"];
let playing = false;
let songIndex = 0;

music.volume = volume.value;

toggle.onclick = () => {
  if (!playing) {
    music.src = songs[songIndex];
    music.play().catch(()=>{});
    toggle.textContent = "⏸️ Música";
    playing = true;
  } else {
    music.pause();
    toggle.textContent = "▶️ Música";
    playing = false;
  }
};

volume.oninput = () => music.volume = volume.value;

/* ========= UI ========= */
const setsScreen = document.getElementById("sets-screen");
const cardsScreen = document.getElementById("cards-screen");
const cardScreen = document.getElementById("card-screen");

const setsDiv = document.getElementById("sets");
const cardsDiv = document.getElementById("cards");
const cardDetail = document.getElementById("card-detail");

const setTitle = document.getElementById("set-title");
const filter = document.getElementById("filter");
const loader = document.getElementById("global-loading");

let allCards = [];

/* ========= FILTROS ========= */
filter.innerHTML = `
  <option value="az">A–Z</option>
  <option value="za">Z–A</option>
  <option value="price-desc">Precio ↓</option>
  <option value="price-asc">Precio ↑</option>
  <option value="num">Número</option>
`;

/* ========= EXPANSIONES ========= */
async function loadSets() {
  try {
    loader.classList.remove("hidden");

    const res = await fetch("https://api.pokemontcg.io/v2/sets");
    const data = await res.json();

    setsDiv.innerHTML = "";
    data.data.forEach(set => {
      const d = document.createElement("div");
      d.className = "set-card";
      d.innerHTML = `
        <img src="${set.images.logo}">
        <h3>${set.name}</h3>
        <div class="set-date">${set.releaseDate || ""}</div>
      `;
      d.onclick = () => openSet(set.id, set.name);
      setsDiv.appendChild(d);
    });

  } catch (e) {
    console.error(e);
    setsDiv.innerHTML = "<p>Error cargando expansiones</p>";
  } finally {
    loader.classList.add("hidden");
  }
}

/* ========= CARTAS ========= */
async function openSet(id, name) {
  setTitle.textContent = name;
  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");

  cardsDiv.innerHTML = "";
  allCards = [];

  loader.classList.remove("hidden");

  try {
    const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${id}`);
    const data = await res.json();

    data.data.forEach(card => {
      allCards.push(card);
      renderCard(card);
    });
  } catch (e) {
    console.error(e);
  } finally {
    loader.classList.add("hidden");
  }
}

function renderCard(card) {
  const price =
    card.cardmarket?.prices?.averageSellPrice
      ? card.cardmarket.prices.averageSellPrice.toFixed(2) + " €"
      : "—";

  const d = document.createElement("div");
  d.className = "card";
  d.innerHTML = `
    <img src="${card.images.small}">
    <div class="price">${price}</div>
    <h4>${card.name}</h4>
  `;
  d.onclick = () => openCard(card);
  cardsDiv.appendChild(d);
}

/* ========= FILTRAR ========= */
filter.onchange = () => {
  let list = [...allCards];

  if (filter.value === "az") list.sort((a,b)=>a.name.localeCompare(b.name));
  if (filter.value === "za") list.sort((a,b)=>b.name.localeCompare(a.name));
  if (filter.value === "price-desc")
    list.sort((a,b)=>(b.cardmarket?.prices?.averageSellPrice||0)-(a.cardmarket?.prices?.averageSellPrice||0));
  if (filter.value === "price-asc")
    list.sort((a,b)=>(a.cardmarket?.prices?.averageSellPrice||0)-(b.cardmarket?.prices?.averageSellPrice||0));
  if (filter.value === "num")
    list.sort((a,b)=>parseInt(a.number)-parseInt(b.number));

  cardsDiv.innerHTML = "";
  list.forEach(renderCard);
};

/* ========= CARTA ABIERTA ========= */
function openCard(card) {
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");

  cardDetail.innerHTML = `
    <button id="back-to-cards">⬅ Volver</button>
    <img src="${card.images.large}">
    <h2>${card.name}</h2>
    <p>Número: ${card.number}</p>
    <p class="price">
      ${card.cardmarket?.prices?.averageSellPrice
        ? card.cardmarket.prices.averageSellPrice + " €"
        : "—"}
    </p>
    <a href="https://www.pricecharting.com/search-products?q=${encodeURIComponent(card.name)}" target="_blank">
      PriceCharting
    </a><br>
    <a href="${card.cardmarket?.url || "https://www.cardmarket.com"}" target="_blank">
      CardMarket
    </a>
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
