const loader = document.getElementById("global-loading");
const loadingText = document.getElementById("loading-text");
const setsDiv = document.getElementById("sets");

/* ===== CARGA EXPANSIONES ===== */
async function loadSets() {
  loader.classList.remove("hidden");
  loadingText.textContent = "Cargando expansiones…";

  try {
    const res = await fetch("https://api.pokemontcg.io/v2/sets");
    const data = await res.json();

    if (!data || !Array.isArray(data.data)) {
      throw new Error("Datos inválidos");
    }

    const sets = data.data
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
      .slice(0, 30);

    setsDiv.innerHTML = "";

    sets.forEach(set => {
      const card = document.createElement("div");
      card.className = "set-card";
      card.innerHTML = `
        <img src="${set.images.logo}" loading="lazy">
        <h3>${set.name}</h3>
        <div>${set.releaseDate || ""}</div>
      `;
      setsDiv.appendChild(card);
    });

  } catch (err) {
    loadingText.textContent = "Error cargando expansiones 😕";
    console.error(err);
  } finally {
    loader.classList.add("hidden");
  }
}

/* ===== EJECUCIÓN DIRECTA ===== */
loadSets();
