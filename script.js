document.addEventListener("DOMContentLoaded", () => {
  console.log("Weboldal betöltve – money is everything 💸");

  const entryScreen = document.getElementById('entryScreen');
  const mainContent = document.getElementById('mainContent');

  // --- Zenelejátszó funkciók ---
  const bgMusic = document.getElementById('bgMusic');
  const playBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const volumeSlider = document.getElementById('volumeSlider');
  const cursor = document.getElementById("customCursor");
  
  document.addEventListener("mousemove", (e) => {
    if (cursor) {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    }
    createSparkle(e.clientX, e.clientY);
  });

  playBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play();
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'inline';
    } else {
      bgMusic.pause();
      playIcon.style.display = 'inline';
      pauseIcon.style.display = 'none';
    }
  });

  volumeSlider.addEventListener('input', () => {
    bgMusic.volume = volumeSlider.value;
  });

  // ✅ Kezdeti hangerő
  bgMusic.volume = 0.2;
  volumeSlider.value = 0.2;

  // --- Canvas háttér pöttyök ---
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  function drawDots(count = 300) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < count; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = Math.random() * 1.5 + 0.3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
    }
  }

  function setupCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawDots();
  }

  setupCanvas();
  window.addEventListener('resize', setupCanvas);

  // --- Entry screen ---
  if (entryScreen && mainContent) {
    mainContent.style.display = 'none';
  }

  function enterSite() {
    if (entryScreen && mainContent) {
      entryScreen.style.transition = "opacity 0.6s ease";
      entryScreen.style.opacity = '0';

      entryScreen.addEventListener('transitionend', () => {
        entryScreen.style.display = 'none';
        mainContent.style.display = 'block';

        bgMusic.play().catch(() => {
          console.log('Automatikus lejátszás nem engedélyezett.');
        });
      }, { once: true });

      window.removeEventListener('keydown', keyHandler);
      entryScreen.removeEventListener('click', clickHandler);
    }
  }

  function keyHandler(e) {
    if (e.key === 'Enter') {
      enterSite();
    }
  }

  function clickHandler() {
    enterSite();
  }

  window.addEventListener('keydown', keyHandler);
  entryScreen.addEventListener('click', clickHandler);

  // --- Discord & Spotify Presence ---
  const userId = "343435658783883277";
  const socket = new WebSocket("wss://api.lanyard.rest/socket");

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({
      op: 2,
      d: { subscribe_to_id: userId }
    }));
  });

  socket.addEventListener("message", event => {
    const data = JSON.parse(event.data);
    if (data.t !== "INIT_STATE" && data.t !== "PRESENCE_UPDATE") return;

    const presence = data.d;
    const status = presence.discord_status;
    const spotify = presence.spotify;
    const avatar = presence.discord_user.avatar
      ? `https://cdn.discordapp.com/avatars/${presence.discord_user.id}/${presence.discord_user.avatar}.png`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    const avatarEl = document.getElementById("presenceAvatar");
    if (avatarEl) avatarEl.src = avatar;

    const statusEl = document.getElementById("discordStatus");
    const statusTextEl = document.getElementById("statusText");
    const statusText = {
      online: "Online",
      dnd: "Do Not Disturb",
      idle: "Idle",
      offline: "Offline"
    };

    if (statusEl) statusEl.className = "status-dot " + status;
    if (statusTextEl) statusTextEl.textContent = statusText[status] || "Offline";

    const songInfoEl = document.getElementById("songInfo");
    const coverEl = document.getElementById("spotifyCover");

    if (spotify) {
      if (songInfoEl) songInfoEl.textContent = `🎧 ${spotify.song} – ${spotify.artist}`;
      if (coverEl) {
        coverEl.src = spotify.album_art_url;
        coverEl.style.display = "block";
      }
    } else {
      if (songInfoEl) songInfoEl.textContent = "Spotify: not playing";
      if (coverEl) coverEl.style.display = "none";
    }
  });

  // --- 💫 3D tilt effekt: most az egész kártya mozog ---
  const tiltCard = document.getElementById("tiltCard");
  if (tiltCard) {
    tiltCard.addEventListener("mousemove", (e) => {
      const { width, height, left, top } = tiltCard.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      const rotateX = ((y / height) - 0.5) * 15;
      const rotateY = ((x / width) - 0.5) * -15;
      tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    tiltCard.addEventListener("mouseleave", () => {
      tiltCard.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  }

  // --- Csillogó kurzor effekt ---
  function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';

    sparkle.style.transform = `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px)`;

    document.body.appendChild(sparkle);

    sparkle.addEventListener('animationend', () => {
      sparkle.remove();
    });
  }

});
