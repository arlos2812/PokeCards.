// ==============================
// CONFIGURACIÓN API
// ==============================
const API_KEY = "3d240d93-e6be-4c24-a9fc-c7b4593dd5fc";
const API_URL = "https://api.pokemontcg.io/v2";

const headers = {
  "X-Api-Key": API_KEY
};

// ==============================
// ELEMENTOS DEL DOM
// ==============================
const contenedorExpansiones = document.getElementById("expansiones");
const loader = document.getElementById("loadingExpansiones");
const loaderTexto = document.getElementById("loadingText");
const loaderPorcentaje = document.getElementById("loadingPercent");

// ==============================
// UTILIDADES
// ==============================
function mostrarLoader(texto = "Cargando...", porcentaje = 0) {
  if (!loader) return;
  loader.style.display = "flex";
  loaderTexto.textContent = texto;
  loaderPorcentaje.textContent = porcentaje + "%";
}

function ocultarLoader() {
  if (!loader) return;
  loader.style.display = "none";
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==============================
// CARGAR EXPANSIONES
// ==============================
async function cargarExpansiones() {
  mostrarLoader("Cargando expansiones...", 0);

  try {
    const res = await fetch(`${API_URL}/sets`, { headers });
    const json = await res.json();
    const sets = json.data;

    contenedorExpansiones.innerHTML = "";

    for (let i = 0; i < sets.length; i++) {
      const set = sets[i];

      const card = document.createElement("div");
      card.className = "expansion-card";
      card.innerHTML = `
        <img src="${set.images.logo}" alt="${set.name}">
        <h3>${set.name}</h3>
        <p>${set.releaseDate}</p>
      `;

      contenedorExpansiones.appendChild(card);

      // porcentaje REAL
      const porcentaje = Math.round(((i + 1) / sets.length) * 100);
      loaderPorcentaje.textContent = porcentaje + "%";

      // pequeña animación para que no se quede pillado
      await esperar(15);
    }

  } catch (error) {
    console.error("❌ Error cargando expansiones:", error);
    loaderTexto.textContent = "Error al cargar expansiones";
  } finally {
    // 🔥 ESTO ES CLAVE: SIEMPRE SE QUITA
    await esperar(300);
    ocultarLoader();
  }
}

// ==============================
// INICIO APP
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  cargarExpansiones();
});


loadSets();


