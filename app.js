document.addEventListener("DOMContentLoaded", () => {
  console.log("JS iniciado");

  /* ===== ELEMENTOS ===== */
  const musicBtn = document.getElementById("music-toggle");
  const volumeInput = document.getElementById("music-volume");
  const music = document.getElementById("music-player");

  const loader = document.getElementById("global-loading");
  const loadingText = document.getElementById("loading-text");
  const setsDiv = document.getElementById("sets");

  /* ===== COMPROBACIÓN ===== */
  if (!musicBtn || !volumeInput || !music || !loader || !loadingText || !setsDiv) {
    console.error("Faltan elementos en el HTML");
    return;
  }

  /* ===== MÚSICA ===== */
  const songs = [
    "https://arlos2812.github.io/pokecards-assets/sounds/song1.mp3",
    "https://arlos2812.github.io/pokecards-assets/sounds/song2.mp3",
    "https://arlos2812.github.io/pokecards-assets/sounds/song3.mp3"
  ];

  let currentSong = 0;
  let playing = false;

  music.src = songs[currentSong];
  music.volume = volumeInput.value;

  musicBtn.addEventListener("click", async () => {
    try {
      if (!playing) {
        await music.play();
        playing = true;
        musicBtn.textContent = "⏸️ Música";
      } else {
        music.pause();
        playing = false;
        musicBtn.textContent = "▶️ Música";
      }
    } catch (e) {
      alert("El navegador ha bloqueado el audio. Pulsa otra vez.");
    }
  });

  volumeInput.addEventListener("input", () => {
    music.volume = volumeInput.value;
  });

  music.addEventListener("ended", () => {
    currentSong = (currentSong + 1) % songs.length;
    music.src = songs[currentSong];
    music.play();
  });

  /* ===== EXPANSIONES ===== */
  async function loadSets() {
    loader.classList.remove("hidden");
    loadingText.textContent = "Cargando expansiones…";

    try {
      const res = await fetch("https://api.pokemontcg.io/v2/sets");
      const data = await res.json();

      if (!data || !Array.isArray(data.data)) {
        throw new Error("Respuesta inválida");
      }

      setsDiv.innerHTML = "";

      data.data
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
        .slice(0, 30)
        .forEach(set => {
          const div = document.createElement("div");
          div.className = "set-card";
          div.innerHTML = `
            <img src="${set.images.logo}" loading="lazy">
            <h3>${set.name}</h3>
            <div>${set.releaseDate || ""}</div>
          `;
          setsDiv.appendChild(div);
        });

    } catch (err) {
      loadingText.textContent = "Error cargando expansiones 😕";
      console.error(err);
    } finally {
      loader.classList.add("hidden");
    }
  }

  loadSets();
});
