const API_KEY = "0ff3e61a-b7b9-4106-8a7e-09f52033f9fd";
const API = "https://api.pokemontcg.io/v2/sets";

const sets = document.getElementById("sets");
const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");

async function loadSets() {
  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando expansiones…";

  try {
    const res = await fetch(API, {
      headers: {
        "X-Api-Key": API_KEY
      }
    });

    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    const data = await res.json();

    sets.innerHTML = "";

    data.data.forEach(set => {
      const div = document.createElement("div");
      div.className = "set-card";
      div.innerHTML = `
        <img src="${set.images.logo}">
        <h3>${set.name}</h3>
        <div class="set-date">${set.releaseDate || ""}</div>
      `;
      sets.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    loadingText.textContent = "Error cargando expansiones";
  }

  loader.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", loadSets);
