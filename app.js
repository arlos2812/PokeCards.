const API_KEY = "0ff3e61a-b7b9-4106-8a7e-09f52033f9fd";

const sets = document.getElementById("sets");
const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");

/* ================= EXPANSIONES ================= */
async function loadSets() {
  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando expansiones…";

  try {
    const res = await fetch("https://api.pokemontcg.io/v2/sets", {
      headers: { "X-Api-Key": API_KEY }
    });

    if (!res.ok) {
      throw new Error("API error");
    }

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
      sets.appendChild(d);
    });

  } catch (err) {
    console.error(err);
    loadingText.textContent = "Error cargando expansiones";
  }

  loader.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", loadSets);
