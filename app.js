document.addEventListener("DOMContentLoaded", () => {

const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";
const API_HEADERS = { headers: { "X-Api-Key": API_KEY } };

const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");
const setsDiv = document.getElementById("sets");

async function loadSets() {
  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando expansiones…";

  try {
    const res = await fetch("https://api.pokemontcg.io/v2/sets", API_HEADERS);
    const data = await res.json();

    const sets = data.data
      .sort((a,b)=>new Date(b.releaseDate)-new Date(a.releaseDate))
      .slice(0,30);

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

  } catch {
    loadingText.textContent = "Error cargando expansiones";
  } finally {
    loader.classList.add("hidden");
  }
}

loadSets();

});
