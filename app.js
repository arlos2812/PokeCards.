console.log("1️⃣ app.js cargado");

document.addEventListener("DOMContentLoaded", () => {
  console.log("2️⃣ DOM listo");

  const setsDiv = document.getElementById("sets");
  const loadingText = document.getElementById("loading-text");

  console.log("3️⃣ setsDiv:", setsDiv);
  console.log("4️⃣ loadingText:", loadingText);

  if (!setsDiv || !loadingText) {
    console.error("❌ FALTAN ELEMENTOS EN EL HTML");
    return;
  }

  console.log("5️⃣ Lanzando fetch a la API");

  fetch("https://api.pokemontcg.io/v2/sets")
    .then(res => {
      console.log("6️⃣ Respuesta recibida", res);
      return res.json();
    })
    .then(data => {
      console.log("7️⃣ Datos:", data);

      loadingText.textContent = "Expansiones cargadas";

      data.data.slice(0, 10).forEach(set => {
        const div = document.createElement("div");
        div.textContent = set.name;
        setsDiv.appendChild(div);
      });
    })
    .catch(err => {
      console.error("❌ ERROR EN FETCH", err);
      loadingText.textContent = "Error cargando expansiones";
    });
});
