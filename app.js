const API = "https://api.pokemontcg.io/v2";
const API_KEY = "0ff3e61a-b7b9-4106-8a7e-09f52033f9fd";

// 🎵 PLAYLIST (3 canciones)
const playlist = [
  "sounds/music1.mp3",
  "sounds/music2.mp3",
  "sounds/music3.mp3"
];

let currentSong = 0;

// 🎶 MÚSICA
const music = document.getElementById("music-player");
const musicBtn = document.getElementById("music-toggle");
const volume = document.getElementById("music-volume");

music.src = playlist[currentSong];
music.volume = volume.value;

music.addEventListener("ended", () => {
  currentSong = (currentSong + 1) % playlist.length;
  music.src = playlist[currentSong];
  music.play();
});

musicBtn.onclick = () => {
  music.paused ? music.play() : music.pause();
};

volume.oninput = e => music.volume = e.target.value;

// 📦 DOM
const setsDiv = document.getElementById("sets");
const cardsDiv = document.getElementById("cards");
const loading = document.getElementById("loading");
const setsScreen = document.getElementById("sets-screen");
const cardsScreen = document.getElementById("cards-screen");
const backBtn = document.getElementById("back-to-sets");
const loadMoreBtn = document.getElementById("load-more");
const setTitle = document.getElementById("set-title");

let currentSet = null;
let page = 1;

// 🔑 FETCH SIN HEADERS (clave para CORS)
async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

// 🔹 CARGAR EXPANSIONES
async function loadSets() {
  try {
    loading.textContent = "Cargando expansiones…";

    const data = await apiFetch(
      `${API}/sets?apiKey=${API_KEY}`
    );

    loading.style.display = "none";

    data.data.forEach(set => {
      const div = document.createElement("div");
      div.className = "set";
      div.innerHTML = `
        <img src="${set.images.logo}" alt="${set.name}">
        <p>${set.name}</p>
      `;
      div.onclick = () => openSet(set);
      setsDiv.appendChild(div);
    });
  } catch (e) {
    loading.textContent = "Error cargando expansiones";
    console.error(e);
  }
}

// 🔹 ABRIR EXPANSIÓN
function openSet(set) {
  currentSet = set;
  page = 1;
  cardsDiv.innerHTML = "";
  setTitle.textContent = set.name;

  setsScreen.classList.add("hidden");
  cardsScreen.classList.remove("hidden");

  loadCards();
}

// 🔹 CARTAS (30 en 30)
async function loadCards() {
  loadMoreBtn.disabled = true;

  const data = await apiFetch(
    `${API}/cards?q=set.id:${currentSet.id}&page=${page}&pageSize=30&apiKey=${API_KEY}`
  );

  data.data.forEach(card => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<img src="${card.images.small}" alt="${card.name}">`;
    cardsDiv.appendChild(div);
  });

  loadMoreBtn.style.display = data.data.length === 30 ? "block" : "none";
  loadMoreBtn.disabled = false;
  page++;
}

backBtn.onclick = () => {
  cardsScreen.classList.add("hidden");
  setsScreen.classList.remove("hidden");
};

loadMoreBtn.onclick = loadCards;

// 🚀 INICIO
loadSets();
