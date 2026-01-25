console.log("JS iniciado");

document.addEventListener("DOMContentLoaded", () => {
  const musicBtn = document.getElementById("music-toggle");
  const volume = document.getElementById("music-volume");
  const music = document.getElementById("music-player");
  const loadingText = document.getElementById("loading-text");
  const setsDiv = document.getElementById("sets");

  /* ===== MÚSICA ===== */
  const songs = [
    "https://arlos2812.github.io/pokecards-assets/sounds/song1.mp3",
    "https://arlos2812.github.io/pokecards-assets/sounds/song2.mp3",
    "https://arlos2812.github.io/pokecards-assets/sounds/song3.mp3"
  ];

  let current = 0;
  let playing = false;

  music.src = songs[current];
  music.volume = volume.value;

  musicBtn.onclick = async () => {
    if (!playing) {
      await music.play();
      musicBtn.textContent = "⏸️ Música";
      playing = true;
    } else {
      music.pause();
      musicBtn.textContent = "▶️ Música";
      playing = false;
    }
  };

  volume.oninput = () => music.volume = volume.value;

  music.onended = () => {
    current = (current + 1) % songs.length;
    music.src = songs[current];
    music.play();
  };

  /* ===== EXPANSIONES ===== */
  fetch("https://api.pokemontcg.io/v2/sets")
    .then(r => r.json())
    .then(data => {
      loadingText.textContent = "Expansiones cargadas";

      data.data.slice(0, 10).forEach(set => {
        const div = document.createElement("div");
        div.textContent = set.name;
        setsDiv.appendChild(div);
      });
    })
    .catch(err => {
      console.error(err);
      loadingText.textContent = "Error cargando expansiones";
    });
});
