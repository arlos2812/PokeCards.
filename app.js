document.addEventListener("DOMContentLoaded", () => {

/* ================= CONFIG ================= */
const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";
const CARD_HEADERS = { headers: { "X-Api-Key": API_KEY } };

const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");

const setsDiv = document.getElementById("sets");

/* ================= EXPANSIONES (SIN KEY) ================= */
async function loadSets() {
  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando expansiones…";

  try {
    const res = await fetch("https://api.pokemontcg.io/v2/sets");
    const data = await res.json();

    if (!Array.isArray(data.data)) throw new Error();

    const sets = data.data
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
      .slice(0, 30);

    setsDiv.innerHTML = "";

    sets.forEach(set => {
      const d = document.createElement("div");
      d.className = "set-card";
      d.innerHTML = `
        <img src="${set.images.logo}" loading="lazy">
        <h3>${set.name}</h3>
        <div>${set.releaseDate || ""}</div>
      `;
      setsDiv.appendChild(d);
    });

  } catch (e) {
    loadingText.textContent = "Error cargando expansiones 😕";
  } finally {
    loader.classList.add("hidden");
  }
}

/* ================= INIT ================= */
loadSets();

});
