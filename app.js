document.addEventListener("DOMContentLoaded", () => {

const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";
const API_HEADERS = { headers: { "X-Api-Key": API_KEY } };

/* ===== MÚSICA ===== */
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

music.src = songs[currentSong];
music.volume = volumeControl.value;

toggleMusic.onclick = async () => {
  if (!isPlaying) {
    await music.play();
    isPlaying = true;
    toggleMusic.textContent = "⏸️ Música";
  } else {
    music.pause();
    isPlaying = false;
    toggleMusic.textContent = "▶️ Música";
  }
};

volumeControl.oninput = () => music.volume = volumeControl.value;

music.onended = () => {
  currentSong = (currentSong + 1) % songs.length;
  music.src = songs[currentSong];
  music.play();
};

/* ===== UI ===== */
const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");

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
let allCards = [];

/* ===== FILTROS ===== */
filter.innerHTML = `
<option value="az">A–Z</option>
<option value="za">Z–A</option>
<option value="num">Número</option>
<option value="price-desc">Precio ↓</option>
<option value="price-asc">Precio ↑</option>
`;
filter.onchange = applyFilter;

/* ===== FETCH CON TIMEOUT ===== */
async function fetchTimeout(url, options, time = 15000) {
  const c = new AbortController();
  setTimeout(() => c.abort(), time);
  return fetch(url, { ...options, signal: c.signal });
}

/* ===== EXPANSIONES ===== */
async function loadSets() {
  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando expansiones…";

  try {
    const res = await fetchTimeout("https://api.pokemontcg.io/v2/sets", API_HEADERS);
    const data = await res.json();

    const sets = data.data
      .sort((a,b)=>new Date(b.releaseDate)-new Date(a.releaseDate))
      .slice(0,30);

    setsDiv.innerHTML = "";
    sets.forEach(set=>{
      const d = document.createElement("div");
      d.className="set-card";
      d.innerHTML=`
        <img src="${set.images.logo}" loading="lazy">
        <h3>${set.name}</h3>
        <div>${set.releaseDate||""}</div>`;
      d.onclick=()=>openSet(set.id,set.name);
      setsDiv.appendChild(d);
    });
  } catch {
    loadingText.textContent = "Error cargando expansiones";
  }

  loader.classList.add("hidden");
}

/* ===== CARTAS ===== */
async function openSet(id,name){
  currentSetId=id;
  currentPage=1;
  hasMore=true;
  allCards=[];
  setTitle.textContent=name;
  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");
  await loadMoreCards();
}

async function loadMoreCards(){
  if(!hasMore) return;
  loader.classList.remove("hidden");
  loadingText.textContent="Cargando cartas…";

  const res = await fetchTimeout(
    `https://api.pokemontcg.io/v2/cards?q=set.id:${currentSetId}&page=${currentPage}&pageSize=${pageSize}`,
    API_HEADERS
  );
  const data = await res.json();

  if(data.data.length<pageSize) hasMore=false;
  allCards.push(...data.data);
  currentPage++;
  applyFilter();
  loader.classList.add("hidden");
  loadMoreBtn.classList.toggle("hidden",!hasMore);
}

/* ===== FILTRAR ===== */
function applyFilter(){
  let cards=[...allCards];
  if(filter.value==="az") cards.sort((a,b)=>a.name.localeCompare(b.name));
  if(filter.value==="za") cards.sort((a,b)=>b.name.localeCompare(a.name));
  if(filter.value==="num") cards.sort((a,b)=>parseInt(a.number)-parseInt(b.number));
  if(filter.value==="price-desc")
    cards.sort((a,b)=>(b.cardmarket?.prices?.averageSellPrice||0)-(a.cardmarket?.prices?.averageSellPrice||0));
  if(filter.value==="price-asc")
    cards.sort((a,b)=>(a.cardmarket?.prices?.averageSellPrice||0)-(b.cardmarket?.prices?.averageSellPrice||0));
  renderCards(cards);
}

function renderCards(cards){
  cardsDiv.innerHTML="";
  cards.forEach(card=>{
    const d=document.createElement("div");
    d.className="card";
    d.innerHTML=`
      <img src="${card.images.small}">
      <div class="price">${card.cardmarket?.prices?.averageSellPrice ?? "—"} €</div>
      <h4>${card.name}</h4>`;
    d.onclick=()=>openCard(card);
    cardsDiv.appendChild(d);
  });
}

/* ===== DETALLE ===== */
function openCard(card){
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");
  cardDetail.innerHTML=`
    <button onclick="location.reload()">⬅ Volver</button>
    <img src="${card.images.large}">
    <h2>${card.name}</h2>
    <p>${card.set.name} · ${card.number}</p>
    <a href="https://www.pricecharting.com/search-products?type=prices&q=${encodeURIComponent(card.name)}" target="_blank">PriceCharting</a>
    ${card.cardmarket?.url ? `<a href="${card.cardmarket.url}" target="_blank">Cardmarket</a>`:""}
  `;
}

loadSets();
});
