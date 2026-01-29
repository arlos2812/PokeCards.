const API_KEY = "0ff3e61a-b7b9-4106-8a7e-09f52033f9fd";

const status = document.getElementById("status");
const sets = document.getElementById("sets");

async function loadSets() {
  status.textContent = "Cargando expansiones…";

  try {
    const res = await fetch("https://api.pokemontcg.io/v2/sets", {
      headers: {
        "X-Api-Key": API_KEY
      }
    });

    if (!res.ok) {
      status.textContent = "Error HTTP: " + res.status;
      return;
    }

    const data = await res.json();

    status.textContent = "Expansiones cargadas: " + data.data.length;

    data.data.forEach(s => {
      const d = document.createElement("div");
      d.className = "set-card";
      d.textContent = s.name;
      sets.appendChild(d);
    });

  } catch (e) {
    status.textContent = "ERROR JS: " + e.message;
    console.error(e);
  }
}

loadSets();
