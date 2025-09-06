// script.js - Lógica da apresentação

(function(){
  const deck = document.getElementById('deck');
  const progressBar = document.getElementById('progressBar');
  const counterEl = document.getElementById('counter');
  const hintEl = document.getElementById('hint');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const startOverlay = document.getElementById('startOverlay');
  const startBtn = document.getElementById('startBtn');
  const audioToggle = document.getElementById('audioToggle');
  const fxCanvas = document.getElementById('fxCanvas');
  const ctx = fxCanvas.getContext('2d');
  const CONFETTI_ENABLED = false; // Desativado para evitar travamentos

  let audioEnabled = false; // controlado pelo botão de som
  let current = 0;
  let started = false;
  let funMode = false;
  let pageVisible = true;

  // Contador de namoro em tempo real (começou em 05/06/2025)
  const START_DATE = new Date(2025, 5, 5); // meses são 0-indexados

  function diffNowMs() {
    return Math.max(0, Date.now() - START_DATE.getTime());
  }

  function calcDaysTogether() {
    const dayMs = 24 * 60 * 60 * 1000;
    return Math.floor(diffNowMs() / dayMs);
  }

  function formatRealtimeDiff(ms) {
    const dayMs = 24 * 60 * 60 * 1000;
    const hourMs = 60 * 60 * 1000;
    const minMs = 60 * 1000;
    const secMs = 1000;
    let r = ms;
    const d = Math.floor(r / dayMs); r %= dayMs;
    const h = Math.floor(r / hourMs); r %= hourMs;
    const m = Math.floor(r / minMs); r %= minMs;
    const s = Math.floor(r / secMs); r %= secMs;
    const mm = r;
    const pad = (n, w=2) => n.toString().padStart(w, '0');
    return `${d} dias, ${pad(h)}:${pad(m)}:${pad(s)}.${pad(mm,3)}`;
  }

  // Quebra profissional em anos, meses, dias, horas, minutos, segundos, ms
  function breakdownRealtime(now = new Date()) {
    const pad = (n, w=2) => n.toString().padStart(w, '0');
    // Anos e meses variam por calendário: avançamos a partir da data base
    const base = new Date(START_DATE.getTime());
    let years = now.getFullYear() - base.getFullYear();
    // Ajuste se ainda não chegou ao aniversário neste ano
    const anniversaryThisYear = new Date(now.getFullYear(), base.getMonth(), base.getDate());
    if (now < anniversaryThisYear) years--;

    const afterYears = new Date(base.getFullYear() + years, base.getMonth(), base.getDate());
    let months = (now.getFullYear() - afterYears.getFullYear()) * 12 + (now.getMonth() - afterYears.getMonth());
    if (now.getDate() < base.getDate()) months--;
    if (months < 0) months = 0;

    const afterMonths = new Date(afterYears.getFullYear(), afterYears.getMonth() + months, base.getDate());
    let remMs = now - afterMonths;
    if (remMs < 0) remMs = 0;

    const dayMs = 24*60*60*1000, hourMs = 60*60*1000, minMs = 60*1000, secMs = 1000;
    const days = Math.floor(remMs / dayMs); remMs %= dayMs;
    const hours = Math.floor(remMs / hourMs); remMs %= hourMs;
    const minutes = Math.floor(remMs / minMs); remMs %= minMs;
    const seconds = Math.floor(remMs / secMs); remMs %= secMs;
    const millis = remMs;

    return {
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      millis,
      pad,
    };
  }

  // Conteúdo dos slides
  // Lista de imagens (mapeadas do diretório assets)
  const IMAGE_PATHS = [
    'assets/imagens/casal/fotinha_0001.jpeg','assets/imagens/casal/fotinha_0002.jpeg','assets/imagens/casal/fotinha_0003.jpeg','assets/imagens/casal/fotinha_0004.jpeg','assets/imagens/casal/fotinha_0005.jpeg','assets/imagens/casal/fotinha_0006.jpeg','assets/imagens/casal/fotinha_0007.jpeg','assets/imagens/casal/fotinha_0008.jpeg','assets/imagens/casal/fotinha_0009.jpeg','assets/imagens/casal/fotinha_0010.jpeg','assets/imagens/casal/fotinha_0011.jpeg','assets/imagens/casal/fotinha_0012.jpeg','assets/imagens/casal/fotinha_0013.jpeg','assets/imagens/casal/fotinha_0014.jpeg','assets/imagens/casal/fotinha_0015.jpeg','assets/imagens/casal/fotinha_0016.jpeg','assets/imagens/casal/fotinha_0017.jpeg','assets/imagens/casal/fotinha_0018.jpeg','assets/imagens/casal/fotinha_0019.jpeg','assets/imagens/casal/fotinha_0020.jpeg','assets/imagens/casal/fotinha_0021.jpeg','assets/imagens/casal/fotinha_0022.jpeg','assets/imagens/casal/fotinha_0023.jpeg','assets/imagens/casal/fotinha_0024.jpeg','assets/imagens/casal/fotinha_0025.jpeg','assets/imagens/casal/fotinha_0026.jpeg','assets/imagens/casal/fotinha_0027.jpeg','assets/imagens/casal/fotinha_0028.jpeg','assets/imagens/casal/fotinha_0029.jpeg','assets/imagens/casal/fotinha_0030.jpeg','assets/imagens/casal/fotinha_0031.jpeg','assets/imagens/casal/fotinha_0032.jpeg',
    'assets/imagens/eu/perfil.jpeg'
  ];

  // Constrói slides (apenas o primeiro é sério)
  const slides = [
    {
      id: 'capa',
      serious: true,
      html: `
        <div class="slide-card">
          <h1 class="h1">Apresentação Profissional</h1>
          <h2 class="h2">José Paulo Palheta Melo</h2>
          <p class="p">Um panorama direto sobre quem eu sou e no que eu mando bem.</p>
        </div>
      `
    },
    {
      id: 'sobre',
      serious: false,
      html: `
        <div class="slide-card row">
          <div>
            <h1 class="h1">Quem sou eu</h1>
            <ul class="list">
              <li>Nome: <strong>José Paulo Palheta Melo</strong></li>
              <li>Idade: <strong>22 anos</strong></li>
              <li>Hobbies: <strong>estudar programação</strong> e <strong>passar tempo com minha namorada</strong> — coisa boa demais!</li>
              <li>Estilo: <strong>mais caseiro</strong> (quase um caboco raiz: tranquilo, de boa, focado)</li>
              <li>Contato: <strong>(92) 98545-2285</strong></li>
            </ul>
          </div>
          <div class="card-side">
            <p class="p">Sempre aprendendo, com disciplina e boas práticas — daquele jeito firme, sem arrodeio.</p>
            <p class="p">Gosto do que é simples, rápido e confiável. E com um cafezinho pra acompanhar, né? ☕️</p>
          </div>
        </div>
      `
    },
    {
      id: 'skills',
      serious: false,
      html: `
        <div class="slide-card">
          <h1 class="h1">Qualificações</h1>
          <p class="p">Onde eu atuo e o que eu sei fazer na prática:</p>
          <div class="badges">
            <span class="badge">Desenvolvimento Web</span>
            <span class="badge">Redes</span>
            <span class="badge">Servidores</span>
            <span class="badge">Linux</span>
            <span class="badge">Manutenção de Computadores</span>
          </div>
          <p class="p">Também mando bem de comunicação, organização e resolver pepino sem drama. Bônus: piada de programador na ponta da língua 🤖.</p>
        </div>
      `
    },
    {
      id: 'transicao',
      serious: false,
      html: `
        <div class="slide-card">
          <h1 class="h1">Virando a chave 😄</h1>
          <p class="p">Começamos sério, mas eu também curto arrancar um sorriso de quem eu gosto. Bora dar uma leveza? 😉</p>
          <p class="p">Status social: <strong>Jedi do Wi‑Fi</strong> (caseiro, mas sei os pontos com melhor sinal 😄)</p>
          <p class="p">Programação: <strong>debug até o café dizer chega</strong>.</p>
          <p class="p">Namoro: <strong>SLA de carinho 99,99%</strong> e uptime no talo. ❤️</p>
        </div>
      `
    },
    {
      id: 'auditoria',
      serious: false,
      html: `
        <div class="slide-card">
          <h1 class="h1">Por que me apresentar?</h1>
          <p class="p">Porque respeito a senhora e a família da minha namorada. Quero que conheça quem cuida dela, quem tá do lado dela e quais são meus valores.</p>
          <ul class="list">
            <li><strong>Transparência</strong>: quem eu sou, o que faço e onde quero chegar.</li>
            <li><strong>Compromisso</strong>: estudo, trabalho e planos pro futuro ao lado da sua filha.</li>
            <li><strong>Segurança</strong>: ética, respeito e responsabilidade em primeiro lugar.</li>
            <li><strong>Presença</strong>: tô por perto pra somar — na alegria, nos perrengues e até na manutenção dos PCs. 🖥️🔧</li>
          </ul>
          <p class="p">Sei que o voto de confiança vem com o tempo. Essa apresentação é meu primeiro passo pra merecer esse voto.</p>
        </div>
      `
    },
    {
      id: 'dias',
      serious: false,
      html: `
        <div class="slide-card">
          <h1 class="h1">Nosso tempo juntos</h1>
          <p class="p">A gente tá namorando há:</p>
          <div class="time-counter" aria-label="Contador de tempo de namoro">
            <div class="tc-item"><div class="tc-value" id="tcYears">--</div><div class="tc-label">Anos</div></div>
            <div class="tc-item"><div class="tc-value" id="tcMonths">--</div><div class="tc-label">Meses</div></div>
            <div class="tc-item"><div class="tc-value" id="tcDays">--</div><div class="tc-label">Dias</div></div>
            <div class="tc-item"><div class="tc-value" id="tcHours">--</div><div class="tc-label">Horas</div></div>
            <div class="tc-item"><div class="tc-value" id="tcMinutes">--</div><div class="tc-label">Minutos</div></div>
            <div class="tc-item"><div class="tc-value" id="tcSeconds">--</div><div class="tc-label">Segundos</div></div>
            <div class="tc-item"><div class="tc-value" id="tcMillis">--</div><div class="tc-label">ms</div></div>
          </div>
          <p class="p">Cada segundo contando — e cada um valendo demais. 💖</p>
        </div>
      `
    },
    {
      id: 'fim',
      serious: false,
      html: `
        <div class="slide-card">
          <h1 class="h1">Valeu pela atenção! ☕️</h1>
          <p class="p">Se quiser, a gente marca um cafezinho na Ponta Negra ou faz um bolinho em casa — do jeitinho que a senhora curtir.</p>
          <p class="p">Contato: <strong>(92) 98545-2285</strong></p>
        </div>
      `
    }
  ];

  // Inserir slides com fotos (antes do slide final)
  (function addPhotoSlides(){
    const perfil = IMAGE_PATHS.find(p => /imagens\/eu\/perfil\.jpeg$/i.test(p));
    const casal = IMAGE_PATHS.filter(p => /imagens\/casal\//i.test(p)).sort();

    const newSlides = [];
    if (perfil) {
      newSlides.push({
        id: 'perfil',
        serious: false,
        html: `
          <div class="slide-card">
            <h1 class="h1">José Paulo 😎</h1>
            <div class="hero-wrap">
              <span class="hero-badge">Perfil</span>
              <div class="inner">
                <span class="bubble" aria-hidden="true">Prazer! 👋</span>
                <img class="hero-img" src="${perfil}" alt="Foto de perfil do José Paulo" loading="lazy" />
              </div>
            </div>
            <div class="hero-caption">José Paulo • Desenvolvedor • Parceiro presente</div>
            <p class="p">Quero que a senhora veja quem eu sou de verdade — de coração e de responsabilidade.</p>
          </div>
        `
      });
    }

    // Removido: slides de mosaico. Manteremos apenas a colagem criativa.

    if (newSlides.length) {
      // insere antes do último slide (fim)
      slides.splice(Math.max(0, slides.length - 1), 0, ...newSlides);
    }
  })();

  // Gera slide de colagem em formato de coração, usando fotos do casal
  (function addCollageSlide(){
    const casal = IMAGE_PATHS.filter(p => /imagens\/casal\//i.test(p)).sort();
    if (!casal.length) return;
    // Duplicamos fontes se necessário para preencher o coração
    const MAX_TILES = Math.min(120, Math.max(48, casal.length * 2));

    function heartXY(t){
      // Parametrização clássica do coração
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
      return {x, y};
    }

    // Amostragem com preenchimento: pontos quase uniformes no contorno com fator radial aleatório
    const ptsRaw = [];
    for (let i = 0; i < MAX_TILES; i++) {
      const baseT = (i / MAX_TILES) * 2*Math.PI; // cobre 0..2pi
      const t = Math.PI - baseT + (Math.random() - 0.5) * 0.15; // leve variação
      const s = 0.6 + Math.random() * 0.4; // 0.6..1 para preencher de dentro pra fora
      const {x, y} = heartXY(t);
      ptsRaw.push({ x: x * s, y: y * s });
    }

    // Normaliza para 0..100 com margem e offset vertical leve para centralizar melhor
    const xs = ptsRaw.map(p=>p.x), ys = ptsRaw.map(p=>p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const MARGIN = 8; // % em cada lado
    const VSHIFT = -2; // desloca ligeiramente para cima
    const pts = ptsRaw.map(p=>{
      const left = MARGIN + ((p.x - minX)/(maxX-minX))*(100 - 2*MARGIN);
      const top = MARGIN + (1- (p.y - minY)/(maxY-minY))*(100 - 2*MARGIN) + VSHIFT;
      const jx = (Math.random() - 0.5) * 1.6;
      const jy = (Math.random() - 0.5) * 1.6;
      return { left: Math.max(2, Math.min(98, left + jx)), top: Math.max(2, Math.min(98, top + jy)) };
    });

    const tilesHtml = pts.map((pt, i) => {
      const src = casal[i % casal.length];
      const delay = i * 20;
      return `<div class="tile" style="left:${pt.left}%; top:${pt.top}%; animation-delay:${delay}ms"><img src="${src}" alt="Foto do casal" loading="lazy" data-idx="${i}" /></div>`;
    }).join('');

    const collageSlide = {
      id: 'colagem',
      serious: false,
      html: `
        <div class="slide-card no-scroll">
          <h1 class="h1">Nossos momentos 💖</h1>
          <div class="collage-heart" aria-label="Colagem em formato de coração">
            ${tilesHtml}
          </div>
          <p class="p" style="text-align:center">Clique em qualquer foto para ampliar.</p>
        </div>
      `
    };

    // insere antes do slide final
    slides.splice(Math.max(0, slides.length - 1), 0, collageSlide);
  })();

  // Lightbox simples (global)
  const lightbox = (() => {
    const root = document.createElement('div');
    root.className = 'lightbox';
    root.innerHTML = `
      <img class="lightbox-img" alt="Foto ampliada" />
      <div class="lightbox-controls">
        <button class="lightbox-btn" data-act="prev" aria-label="Anterior">⟨</button>
        <button class="lightbox-btn" data-act="next" aria-label="Próxima">⟩</button>
        <button class="lightbox-btn" data-act="close" aria-label="Fechar">✕</button>
      </div>
    `;
    document.body.appendChild(root);
    const img = root.querySelector('.lightbox-img');
    let sources = [];
    let idx = 0;
    function show(i){
      idx = (i + sources.length) % sources.length;
      img.src = sources[idx];
    }
    function open(srcList, startIndex=0){
      sources = srcList.slice();
      root.classList.add('open');
      show(startIndex);
    }
    function close(){ root.classList.remove('open'); img.src = ''; }
    root.addEventListener('click', (e)=>{ if (e.target === root) close(); });
    root.querySelector('[data-act="close"]').addEventListener('click', close);
    root.querySelector('[data-act="prev"]').addEventListener('click', ()=>show(idx-1));
    root.querySelector('[data-act="next"]').addEventListener('click', ()=>show(idx+1));
    document.addEventListener('keydown', (e)=>{
      if (!root.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx-1);
      if (e.key === 'ArrowRight') show(idx+1);
    });
    return { open, close };
  })();

  // Renderização
  function renderSlide(index, direction = 1) {
    const data = slides[index];
    if (!data) return;

    const old = deck.querySelector('.slide');
    if (old) {
      old.classList.remove('enter');
      old.classList.add('leave');
      // remove após animação
      setTimeout(() => old.remove(), 320);
    }

    const slide = document.createElement('section');
    slide.className = 'slide enter';
    slide.setAttribute('role', 'region');
    slide.setAttribute('aria-label', `Slide ${index+1}`);
    slide.innerHTML = data.html;
    deck.appendChild(slide);

    // Liga lightbox para mosaicos (Nossos momentos)
    const mosaic = slide.querySelector('.mosaic');
    const collage = slide.querySelector('.collage-heart');
    if (mosaic || collage) {
      const scope = mosaic || collage;
      const imgs = Array.from(scope.querySelectorAll('img'));
      const sources = imgs.map(img => img.getAttribute('src'));
      imgs.forEach((img, ix) => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => lightbox.open(sources, ix));
      });
    }

    // Gerencia contador em tempo real (inicia ao entrar e cancela ao sair)
    if (typeof window.__counterCancel === 'function') {
      try { window.__counterCancel(); } catch {}
      window.__counterCancel = null;
    }
    const liveEl = slide.querySelector('#liveCounter');
    const daysEl = slide.querySelector('#daysCount'); // compat: fallback se existir
    const tc = {
      years: slide.querySelector('#tcYears'),
      months: slide.querySelector('#tcMonths'),
      days: slide.querySelector('#tcDays'),
      hours: slide.querySelector('#tcHours'),
      minutes: slide.querySelector('#tcMinutes'),
      seconds: slide.querySelector('#tcSeconds'),
      millis: slide.querySelector('#tcMillis'),
    };
    if (liveEl || daysEl || tc.years) {
      let rafId = 0;
      function tick() {
        if (!pageVisible) { rafId = requestAnimationFrame(tick); return; }
        const ms = diffNowMs();
        if (liveEl) liveEl.textContent = formatRealtimeDiff(ms);
        if (daysEl) daysEl.textContent = calcDaysTogether().toString();
        if (tc.years) {
          const b = breakdownRealtime(new Date());
          tc.years.textContent = b.years.toString();
          tc.months.textContent = b.months.toString();
          tc.days.textContent = b.days.toString();
          tc.hours.textContent = b.pad(b.hours);
          tc.minutes.textContent = b.pad(b.minutes);
          tc.seconds.textContent = b.pad(b.seconds);
          tc.millis.textContent = b.pad(b.millis, 3);
        }
        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
      window.__counterCancel = () => cancelAnimationFrame(rafId);
    }

    // Atualiza UI
    const total = slides.length;
    progressBar.style.width = `${((index+1)/total)*100}%`;
    counterEl.textContent = `${index+1}/${total}`;

    // Alterna fun mode: a partir do slide 2 (index 1) fica divertido/misto
    if (index >= 1 && !funMode) enableFunMode();

    // Efeito divertido leve em alguns slides (sem confete)
    if (index >= 1 && (index % 2 === 0)) {
      wiggleH1(slide);
      beep();
    }
  }

  function wiggleH1(slide) {
    const h1 = slide.querySelector('.h1');
    if (!h1) return;
    h1.classList.remove('wiggle');
    void h1.offsetWidth; // restart animation
    h1.classList.add('wiggle');
  }

  function goTo(index) {
    const max = slides.length - 1;
    const clamped = Math.max(0, Math.min(max, index));
    const dir = clamped > current ? 1 : -1;
    current = clamped;
    renderSlide(current, dir);
    updateButtons();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function updateButtons() {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === slides.length - 1;
  }

  // Início
  startBtn.addEventListener('click', () => {
    started = true;
    startOverlay.style.display = 'none';
    deck.focus();
    goTo(0);
  });

  // Navegação por teclado
  document.addEventListener('keydown', (e) => {
    if (!started) return;
    if (['ArrowRight','PageDown',' '].includes(e.key)) { e.preventDefault(); next(); }
    if (['ArrowLeft','PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
  });

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Toque / swipe
  let touchStartX = null;
  deck.addEventListener('touchstart', (e) => {
    if (!started) return;
    touchStartX = e.changedTouches[0].clientX;
  }, {passive:true});
  deck.addEventListener('touchend', (e) => {
    if (!started || touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev();
    }
    touchStartX = null;
  });

  // Som (Web Audio beep)
  audioToggle.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    audioToggle.textContent = audioEnabled ? '🔊' : '🔈';
  });

  function beep() {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'triangle';
      o.frequency.value = 880; // A5
      g.gain.value = 0.0001;
      o.connect(g); g.connect(audioCtx.destination);
      const now = audioCtx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.09, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      o.start(now);
      o.stop(now + 0.14);
    } catch (e) { /* ignora erros de contexto de áudio */ }
  }

  // Fun mode + confetti
  function enableFunMode() {
    funMode = true;
    document.body.classList.add('fun');
    hintEl.textContent = 'Dica: segue no avanço que fica só o ouro!';
  }

  // Ajusta canvas
  function resizeCanvas() {
    if (!CONFETTI_ENABLED) {
      fxCanvas.width = 0; fxCanvas.height = 0;
      fxCanvas.style.width = '0px'; fxCanvas.style.height = '0px';
      return;
    }
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    fxCanvas.width = Math.floor(window.innerWidth * DPR);
    fxCanvas.height = Math.floor(window.innerHeight * DPR);
    fxCanvas.style.width = window.innerWidth + 'px';
    fxCanvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const EMOJIS = ['🎉','✨','🎈','❤️','😂','☕️','🐧'];
  let particles = [];
  const MAX_PARTICLES = 120;
  const TARGET_FPS = 45;
  const FRAME_TIME = 1000 / TARGET_FPS;
  let lastFrameTime = 0;

  function confettiBurst(n = 10) {
    if (!CONFETTI_ENABLED) return;
    const toAdd = Math.min(n, Math.max(0, MAX_PARTICLES - particles.length));
    for (let i = 0; i < toAdd; i++) particles.push(makeParticle());
  }

  function makeParticle() {
    const x = Math.random() * window.innerWidth;
    const y = -20;
    const vy = 1.6 + Math.random() * 2.4;
    const vx = (Math.random() - 0.5) * 1.8;
    const rot = Math.random() * Math.PI * 2;
    const vr = (Math.random() - 0.5) * 0.06;
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const size = 16 + Math.random() * 10;
    const life = 90 + Math.random() * 30; // frames
    return { x, y, vx, vy, rot, vr, emoji, size, life };
  }

  function stepParticles() {
    if (!CONFETTI_ENABLED) return; // não roda o loop
    const now = performance.now();
    if (!pageVisible) {
      // Pausa quando a aba está oculta
      ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
      requestAnimationFrame(stepParticles);
      return;
    }
    if (now - lastFrameTime < FRAME_TIME) {
      requestAnimationFrame(stepParticles);
      return;
    }
    lastFrameTime = now;

    ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    particles = particles.filter(p => p.life > 0 && p.y < window.innerHeight + 60);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.font = `${p.size}px serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 4;
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    }
    requestAnimationFrame(stepParticles);
  }
  requestAnimationFrame(stepParticles);

  // Acessibilidade básica: foco no deck ao iniciar com teclado
  deck.addEventListener('click', () => deck.focus());

  // Pausar quando a página estiver oculta
  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    if (!pageVisible) {
      particles.length = 0; // limpa para reduzir custo quando voltar
      ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    }
  });
})();
