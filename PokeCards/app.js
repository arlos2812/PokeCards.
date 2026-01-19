const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";

/* ================= MUSICA ================= */
const playlist = [
  "sounds/song1.mp3",
  "sounds/song2.mp3",
  "sounds/song3.mp3"
];

let songIndex = 0;
const music = document.getElementById("music-player");
const startMusic = document.getElementById("start-music");
const volume = document.getElementById("volume");

music.volume = volume.value;
volume.oninput = () => music.volume = volume.value;

startMusic.onclick = () => {
  music.src = playlist[songIndex];
  music.play();
  startMusic.style.display = "none";
};

music.onended = () => {
  songIndex = (songIndex + 1) % playlist.length;
  music.src = playlist[songIndex];
  music.play();
};

/* ================= UI ================= */
const setsScreen = document.getElementById("sets-screen");
const cardsScreen = document.getElementById("cards-screen");
const cardScreen = document.getElementById("card-screen");

const setsContainer = document.getElementById("sets");
const cardsContainer = document.getElementById("cards");
const cardDetail = document.getElementById("card-detail");

const loading = document.getElementById("loading");
const endMessage = document.getElementById("end-message");
const counter = document.getElementById("counter");

const setTitle = document.getElementById("set-title");
const filterSelect = document.getElementById("filter");
const backToSets = document.getElementById("back-to-sets");
const backToCards = document.getElementById("back-to-cards");

/* ================= ESTADO ================= */
let allCards = [];
let visibleCards = 50;

/* ================= EXPANSIONES ================= */
fetch("https://api.pokemontcg.io/v2/sets", {
  headers: { "X-Api-Key": API_KEY }
})
.then(r => r.json())
.then(data => {
  data.data.forEach(set => {
    const div = document.createElement("div");
    div.className = "set-card";
    div.innerHTML = `
      <img src="${set.images.logo}">
      <h3>${set.name}</h3>
    `;
    div.onclick = () => openSet(set.id, set.name);
    setsContainer.appendChild(div);
  });
});

/* ================= ABRIR EXPANSION ================= */
async function openSet(id, name) {
  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
  setTitle.textContent = name;

  cardsContainer.innerHTML = "";
  allCards = [];
  visibleCards = 50;
  endMessage.classList.add("hidden");
  loading.classList.remove("hidden");
  window.scrollTo(0, 0);

  let page = 1;

  while (true) {
    const res = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=set.id:${id}&page=${page}&pageSize=250`,
      { headers: { "X-Api-Key": API_KEY } }
    );

    const data = await res.json();
    if (data.data.length === 0) break;

    allCards.push(...data.data);
    page++;
  }

  loading.classList.add("hidden");
  renderCards();
}

/* ================= RENDER ================= */
function renderCards() {
  let list = [...allCards];

  switch (filterSelect.value) {
    case "number":
      list.sort((a, b) => Number(a.number) - Number(b.number));
      break;
    case "az":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "za":
      list.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price-desc":
      list.sort((a, b) =>
        (b.cardmarket?.prices?.averageSellPrice || 0) -
        (a.cardmarket?.prices?.averageSellPrice || 0)
      );
      break;
    case "price-asc":
      list.sort((a, b) =>
        (a.cardmarket?.prices?.averageSellPrice || 0) -
        (b.cardmarket?.prices?.averageSellPrice || 0)
      );
      break;
    case "top":
      list = list
        .filter(c => c.cardmarket?.prices?.averageSellPrice)
        .sort((a, b) =>
          b.cardmarket.prices.averageSellPrice -
          a.cardmarket.prices.averageSellPrice
        )
        .slice(0, 5);
      break;
  }

  cardsContainer.innerHTML = "";
  list.slice(0, visibleCards).forEach((card, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      ${filterSelect.value === "top" ? `<div class="fire">${i + 1}</div>` : ""}
      <img src="${card.images.small}">
      <div class="price">${card.cardmarket?.prices?.averageSellPrice || "N/A"} €</div>
      <h4>${card.name}</h4>
    `;
    div.onclick = () => openCard(card);
    cardsContainer.appendChild(div);
  });

  counter.textContent = `${Math.min(visibleCards, list.length)} / ${list.length} cartas`;

  if (visibleCards >= list.length) {
    endMessage.classList.remove("hidden");
  }
}

/* ================= SCROLL UI ================= */
window.addEventListener("scroll", () => {
  if (cardsScreen.classList.contains("hidden")) return;

  if (
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 200
  ) {
    visibleCards += 50;
    renderCards();
  }
});

filterSelect.onchange = renderCards;

/* ================= CARTA ================= */
function openCard(card) {
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");

  cardDetail.innerHTML = `
    <img src="${card.images.large}">
    <h2>${card.name}</h2>
    <p>${card.set.name}</p>
    <p>Precio medio: ${card.cardmarket?.prices?.averageSellPrice || "N/A"} €</p>
    <a href="https://www.pricecharting.com/search-products?q=${encodeURIComponent(card.name)}" target="_blank">PriceCharting</a><br><br>
    <a href="${card.cardmarket?.url || 'https://www.cardmarket.com'}" target="_blank">CardMarket</a>
  `;
}

/* ================= VOLVER ================= */
backToSets.onclick = () => {
  cardsScreen.classList.add("hidden");
  setsScreen.classList.remove("hidden");
};

backToCards.onclick = () => {
  cardScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
};
