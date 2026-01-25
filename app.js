console.log("JS cargado");

const music = document.getElementById("music-player");
const btn = document.getElementById("music-toggle");
const loadingText = document.getElementById("loading-text");
const setsDiv = document.getElementById("sets");

/* ===== MÚSICA ===== */
music.src = "https://arlos2812.github.io/pokecards-assets/sounds/song1.mp3";

btn.addEventListener("click", async () => {
  try {
    await music.play();
    btn.textContent = "⏸️ Música";
  } catch (e) {
    alert("El navegador bloqueó el audio");
  }
});

/* ===== EXPANSIONES ===== */
async function loadSets() {
  loadingText.textContent = "Cargando expansiones…";

  const res = await fetch("https://api.pokemontcg.io/v2/sets");
  const data = await res.json();

  setsDiv.innerHTML = "";

  data.data.slice(0, 10).forEach(set => {
    const img = document.createElement("img");
    img.src = set.images.logo;
    setsDiv.appendChild(img);
  });

  loadingText.textContent = "Expansiones cargadas";
}

loadSets();
