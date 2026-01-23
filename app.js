/* =========================
   ESCANEO
========================= */
const scanBtn = document.getElementById("scan-btn");
const cameraInput = document.getElementById("camera-input");

scanBtn.onclick = () => cameraInput.click();

cameraInput.onchange = async e => {
  const file = e.target.files[0];
  if (!file) return;

  setsScreen.classList.add("hidden");
  cardsScreen.classList.add("hidden");
  cardScreen.classList.remove("hidden");

  cardDetail.innerHTML = `
    <h2>📷 Escaneando carta…</h2>
    <img src="${URL.createObjectURL(file)}" style="max-width:300px">
    <p>🔍 Detectando texto…</p>
  `;

  try {
    const result = await Tesseract.recognize(
      file,
      "eng",
      { logger: m => console.log(m) }
    );

    const text = result.data.text
      .replace(/\n/g, " ")
      .replace(/[^a-zA-Z ]/g, "")
      .trim();

    const guess = text.split(" ").slice(0, 3).join(" ");

    cardDetail.innerHTML += `<p>🧠 Detectado: <strong>${guess}</strong></p>`;

    const res = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=name:${guess}*`,
      { headers: { "X-Api-Key": API_KEY } }
    );

    const data = await res.json();

    if (!data.data.length) {
      cardDetail.innerHTML += "<p>❌ No se encontró la carta</p>";
      return;
    }

    openCard(data.data[0]);

  } catch (err) {
    cardDetail.innerHTML += "<p>❌ Error al escanear</p>";
    console.error(err);
  }
};
