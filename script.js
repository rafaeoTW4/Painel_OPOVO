const streams = [
  { nome: "Rádio O POVO CBN", url: "https://ice.fabricahost.com.br/cbnfortaleza", img: "https://i.pinimg.com/736x/7a/c3/d0/7ac3d00e953925989e79c70fa157c81e.jpg" },
  { nome: "Rádio Club FM", url: "https://ice.fabricahost.com.br/clubefmfortaleza", img: "https://mir-s3-cdn-cf.behance.net/projects/404/8db4f1160784053.Y3JvcCw4MDgsNjMyLDAsMA.png" },
  { nome: "Rádio CBN Cariri", url: "https://ice.fabricahost.com.br/cbncariri", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxiI5Jsq6y1ggcPoXwzY28s-RZ1EXeoqoRcA&s" },
  { nome: "Rádio Nova Brasil", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/NOVABRASIL_FORAAC.aac", img: "https://cdn-profiles.tunein.com/s6996/images/logog.png?t=160460" },
  { nome: "Canal FDR", url: "https://wise-stream.mycloudstream.io/player/pxf9amx8", img: "https://fdr.org.br/canalfdr/wp-content/themes/canalfdr/img/logo-tv-opovo.png", tipo: "video" },
  { nome: "TV O Povo", url: "https://wise-stream.mycloudstream.io/player/aovhqllh", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRD6sg6An6zbhJ9ZPlYzw2LD3iBjtlxtb7wMA&s", tipo: "video" },
];

function toggleCard(card) {
  if (card.classList.contains("active")) return;
  card.classList.toggle("expanded");
}

function gerarCards() {
  const container = document.getElementById("cardContainer");
  container.innerHTML = "";

  for (const stream of streams) {
    const card = document.createElement("div");
    card.className = "card";
    card.onclick = () => toggleCard(card);

    const logoContainer = document.createElement("div");
    logoContainer.className = "logo-container";

    const thumbnail = document.createElement("img");
    thumbnail.src = stream.img;
    thumbnail.alt = stream.nome;
    logoContainer.appendChild(thumbnail);

    const content = document.createElement("div");
    content.className = "card-content";

    const titulo = document.createElement("h3");
    titulo.textContent = stream.nome;

    const statusEl = document.createElement("p");
    statusEl.className = "status";
    statusEl.innerHTML = "";

    const detalhes = document.createElement("div");
    detalhes.className = "details";
    detalhes.style.flexDirection = "column";
    detalhes.style.alignItems = "center";

    if (stream.tipo === "video") {
        const iframe = document.createElement("iframe");
        iframe.src = stream.url;
        iframe.allow = "autoplay; encrypted-media";
        iframe.allowFullscreen = true;
        iframe.style.width = "100%";
        iframe.style.maxWidth = "320px";
        iframe.style.height = "180px";
        iframe.style.border = "none";
        iframe.style.borderRadius = "12px";
        iframe.style.marginTop = "10px";
        iframe.style.boxShadow = "0 2px 8px rgba(4, 70, 250, 0.158)";

        iframe.onload = () => {
        // Aplica o efeito de card ativo e a borda neon após o iframe carregar
        card.classList.add("active", "expanded");
        card.style.boxShadow = "0 0 25px 8px rgb(1, 31, 201)";
      };

        detalhes.appendChild(iframe);

        statusEl.className = "status online";
        detalhes.appendChild(statusEl);
     }


    
    else {
      const btnToggle = document.createElement("button");
      btnToggle.className = "img-btn";
      btnToggle.innerHTML = '<img src="images/desligado.png" alt="Play" class="btn-icon">';

      const visualizer = document.createElement("div");
      visualizer.className = "visualizer";
      visualizer.style.display = "none";

      const bars = [];
      for (let i = 0; i < 30; i++) {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = "5px";
        visualizer.appendChild(bar);
        bars.push(bar);
      }

      let tocando = false;
      let animationId;
      let context = null;
      let source, analyser, dataArray;
      let audio = null;

      function criarAudio() {
        audio = new Audio(stream.url);
        audio.crossOrigin = "anonymous";
        audio.preload = "none";
      }

      criarAudio();

      btnToggle.addEventListener("click", async e => {
        e.stopPropagation();

        if (!tocando) {
          try {
            context = new (window.AudioContext || window.webkitAudioContext)();
            source = context.createMediaElementSource(audio);
            analyser = context.createAnalyser();
            analyser.fftSize = 64;
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            source.connect(analyser);
            analyser.connect(context.destination);

            await audio.play();
            card.classList.add("active", "expanded");

            statusEl.innerHTML = "✅ ONLINE";
            statusEl.className = "status online";
            btnToggle.innerHTML = '<img src="images/ligado.png" alt="Stop" class="btn-icon">';
            visualizer.style.display = "flex";

            function animateBars() {
              analyser.getByteFrequencyData(dataArray);
              for (let i = 0; i < bars.length; i++) {
                const value = dataArray[i] || 0;
                const height = Math.max(5, value / 2) + "px";
                bars[i].style.height = height;
              }
              animationId = requestAnimationFrame(animateBars);
            }

            animateBars();
            tocando = true;
          } catch (err) {
            statusEl.innerHTML = "❌ OFFLINE";
            statusEl.className = "status offline";
            visualizer.style.display = "none";
            btnToggle.innerHTML = '<img src="images/desligado.png" alt="Play" class="btn-icon">';
            if (context) context.close();
            tocando = false;
          }

        } else {
          audio.pause();
          card.classList.remove("active", "expanded");
          statusEl.innerHTML = "";
          statusEl.className = "status";
          btnToggle.innerHTML = '<img src="images/desligado.png" alt="Play" class="btn-icon">';
          visualizer.style.display = "none";
          cancelAnimationFrame(animationId);
          if (context) context.close();
          context = null;

          criarAudio();
          tocando = false;
        }
      });

      detalhes.appendChild(btnToggle);
      detalhes.appendChild(statusEl);
      detalhes.appendChild(visualizer);
    }

    content.appendChild(titulo);
    content.appendChild(detalhes);
    card.appendChild(logoContainer);
    card.appendChild(content);
    container.appendChild(card);
  }
}

gerarCards();
