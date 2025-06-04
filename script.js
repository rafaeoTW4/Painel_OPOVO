const streams = [
  { nome: "Rádio O POVO CBN", url: "https://ice.fabricahost.com.br/cbnfortaleza", img: "https://www.opovo.com.br/reboot/includes/assets/img/menu/icon-cbn.webp" },
  { nome: "Rádio Club FM", url: "https://ice.fabricahost.com.br/clubefmfortaleza", img: "https://tudoradio.com/img/uploads/noticias/664762a4e9075.png" },
  { nome: "Rádio CBN Cariri", url: "https://ice.fabricahost.com.br/cbncariri", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxiI5Jsq6y1ggcPoXwzY28s-RZ1EXeoqoRcA&s" },
  { nome: "Rádio Nova Brasil", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/NOVABRASIL_FORAAC.aac", img: "https://www.opovo.com.br/reboot/includes/assets/img/menu/icon-nova-br.webp" },
  { nome: "Canal FDR", url: "https://wise-stream.mycloudstream.io/player/pxf9amx8", img: "https://fdr.org.br/canalfdr/wp-content/themes/canalfdr/img/logo-tv-opovo.png", tipo: "video" },
  { nome: "TV O Povo", url: "https://wise-stream.mycloudstream.io/player/aovhqllh", img: "https://streamings.opovo.com.br/logotvopovo.jpg", tipo: "video" },
];

const audiosAtivos = [];

function renovarAudiosAtivos() {
  audiosAtivos.forEach(player => {
    player.audio.pause();
    player.card.classList.remove("active", "expanded");
    player.statusEl.innerHTML = "";
    player.statusEl.className = "status";
    player.btnToggle.innerHTML = '<img src="images/ligado2.png" alt="Play" class="btn-icon">';
    player.visualizer.style.display = "none";
    cancelAnimationFrame(player.animationId);
    if (player.context) player.context.close();

    const novoAudio = new Audio(player.stream.url);
    novoAudio.crossOrigin = "anonymous";
    novoAudio.preload = "none";
    player.audio = novoAudio;

    player.context = new (window.AudioContext || window.webkitAudioContext)();
    player.source = player.context.createMediaElementSource(novoAudio);
    player.analyser = player.context.createAnalyser();
    player.analyser.fftSize = 64;
    player.dataArray = new Uint8Array(player.analyser.frequencyBinCount);

    player.source.connect(player.analyser);
    player.analyser.connect(player.context.destination);

    novoAudio.play();
    player.card.classList.add("active", "expanded");
    player.statusEl.innerHTML = "✅ ONLINE";
    player.statusEl.className = "status online";
    player.btnToggle.innerHTML = '<img src="images/ligado2.png" alt="Stop" class="btn-icon">';
    player.visualizer.style.display = "flex";

    function animateBars() {
      player.analyser.getByteFrequencyData(player.dataArray);
      for (let i = 0; i < player.bars.length; i++) {
        const value = player.dataArray[i] || 0;
        const height = Math.max(5, value / 2) + "px";
        player.bars[i].style.height = height;
      }
      player.animationId = requestAnimationFrame(animateBars);
    }

    animateBars();
  });
}

setInterval(renovarAudiosAtivos, 300000); // A cada 5 minutos

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
    //titulo.textContent = stream.nome;

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
      iframe.style.maxWidth = "none";
      iframe.style.height = "310px";
      iframe.style.maxHeight = "none";
      iframe.style.border = "none";
      iframe.style.borderRadius = "12px";
      iframe.style.marginTop = "10px";
      iframe.style.marginBottom = "0px";
      iframe.style.lineHeight = "0";
      iframe.style.boxShadow = "0 2px 8px rgba(4, 70, 250, 0.158)";

      card.classList.add("active", "expanded", "card-video");
      

      detalhes.appendChild(iframe);

      statusEl.className = "status online";
      detalhes.appendChild(statusEl);
    } 
    
    else {
      const btnToggle = document.createElement("button");
      btnToggle.className = "img-btn";
      btnToggle.innerHTML = '<img src="images/desligado2.png" alt="Play" class="btn-icon">';

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
            dataArray = new Uint8Array(analyser.frequencyBinCount);

            source.connect(analyser);
            analyser.connect(context.destination);

            await audio.play();
            card.classList.add("active", "expanded");

            statusEl.innerHTML = "✅ ONLINE";
            statusEl.className = "status online";
            btnToggle.innerHTML = '<img src="images/ligado2.png" alt="Stop" class="btn-icon">';
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

            audiosAtivos.push({
              stream,
              audio,
              context,
              source,
              analyser,
              dataArray,
              bars,
              card,
              statusEl,
              btnToggle,
              visualizer,
              animationId
            });

          } catch (err) {
            statusEl.innerHTML = "❌ OFFLINE";
            statusEl.className = "status offline";
            visualizer.style.display = "none";
            btnToggle.innerHTML = '<img src="images/desligado2.png" alt="Play" class="btn-icon">';
            if (context) context.close();
            tocando = false;
          }

        } else {
          audio.pause();
          card.classList.remove("active", "expanded");
          statusEl.innerHTML = "";
          statusEl.className = "status";
          btnToggle.innerHTML = '<img src="images/desligado2.png" alt="Play" class="btn-icon">';
          visualizer.style.display = "none";
          cancelAnimationFrame(animationId);
          if (context) context.close();
          context = null;

          criarAudio();
          tocando = false;

          const index = audiosAtivos.findIndex(p => p.audio === audio);
          if (index !== -1) audiosAtivos.splice(index, 1);
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

window.addEventListener("load", () => {
  if (!sessionStorage.getItem("reloaded")) {
    sessionStorage.setItem("reloaded", "true");
    setTimeout(() => {
      location.reload();
    }, 2000);
  }
});

// Detectar preferência inicial
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}

// Alternar tema manualmente
const toggleBtn = document.getElementById('theme-toggle');
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

