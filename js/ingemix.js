// INGEMIX · escena de portada (furgoneta + puerta seccional), planta viva, demo de puertas, chispas, carril de trabajos, mapa en ruta
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const movil = () => matchMedia('(max-width: 760px)').matches;
  const visible = (el, cb) => { const io = new IntersectionObserver(([e]) => cb(e.isIntersecting), { rootMargin: '120px' }); io.observe(el); return io; };

  // ---------- cabecera y menú ----------
  const cab = $('#cab'), nav = $('#nav'), menu = $('.cab__menu');
  let yAnt = 0;
  const alBajar = () => {
    const y = scrollY;
    cab.classList.toggle('solida', y > 40);
    cab.classList.toggle('oculta', y > 600 && y > yAnt && !nav.classList.contains('abierta'));
    yAnt = y;
  };
  addEventListener('scroll', alBajar, { passive: true }); alBajar();
  menu?.addEventListener('click', () => { const a = nav.classList.toggle('abierta'); menu.setAttribute('aria-expanded', a); });
  $$('#nav a').forEach((a) => a.addEventListener('click', () => { nav.classList.remove('abierta'); menu.setAttribute('aria-expanded', 'false'); }));

  // ---------- reloj del HUD (hora de Valencia) ----------
  const hora = $('#hud-hora');
  const tic = () => { if (hora) hora.textContent = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }).format(new Date()); };
  tic(); setInterval(tic, 20000);

  // ---------- formulario → WhatsApp ----------
  $('#form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, d = Object.fromEntries(new FormData(f));
    let ok = true;
    ['nombre', 'tel'].forEach((n) => { const c = f.elements[n]; const mal = !String(d[n] || '').trim(); c.classList.toggle('error', mal); if (mal && ok) { c.focus(); ok = false; } });
    if (!ok) return;
    const t = [`Hola, Ingemix. Soy ${d.nombre.trim()}.`, `· Necesito: ${d.tipo}`, d.municipio ? `· Municipio: ${d.municipio.trim()}` : '', `· Teléfono: ${d.tel.trim()}`, d.msg ? `\n${d.msg.trim()}` : ''].filter(Boolean).join('\n');
    window.open(`https://wa.me/${window.WA}?text=${encodeURIComponent(t)}`, '_blank', 'noopener');
  });

  // ---------- demo de puertas ----------
  const demo = $('#demo');
  if (demo) {
    const btn = $('#demo-btn'), est = $('#demo-estado');
    const tipos = $$('[data-tipo]', demo), hojas = $$('[data-hoja]', demo);
    let abierta = false, t = 0;
    const pon = (tipo) => { tipos.forEach((b) => b.setAttribute('aria-selected', b.dataset.tipo === tipo)); hojas.forEach((h) => h.classList.toggle('activa', h.dataset.hoja === tipo)); };
    pon('seccional');
    tipos.forEach((b) => b.addEventListener('click', () => { demo.classList.remove('abierta', 'mueve'); abierta = false; btn.querySelector('span').textContent = 'Abrir'; est.textContent = 'Cerrada'; btn.setAttribute('aria-pressed', 'false'); pon(b.dataset.tipo); }));
    btn.addEventListener('click', () => {
      abierta = !abierta; clearTimeout(t);
      demo.classList.toggle('abierta', abierta); demo.classList.add('mueve');
      btn.setAttribute('aria-pressed', abierta); btn.querySelector('span').textContent = abierta ? 'Cerrar' : 'Abrir';
      est.textContent = abierta ? 'Abriendo…' : 'Cerrando…';
      t = setTimeout(() => { demo.classList.remove('mueve'); est.textContent = abierta ? 'Abierta' : 'Cerrada'; }, 1600);
    });
  }

  // ---------- pestañas del catálogo ----------
  const tabs = $$('.cat__tabs [role=tab]');
  const elegir = (b) => { tabs.forEach((x) => { const s = x === b; x.setAttribute('aria-selected', s); x.tabIndex = s ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !s; }); };
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => elegir(b));
    b.addEventListener('keydown', (e) => { const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); const n = tabs[(i + d + tabs.length) % tabs.length]; elegir(n); n.focus(); } });
  });

  // ---------- HMI vivo (cajas por la cinta) y línea de la planta ----------
  const NS = 'http://www.w3.org/2000/svg';
  const hmiG = $('#hmi-cajas'), prog = $('#hmi-prog');
  const plantaG = $('#planta-cajas'), plantaN = $('#planta-n');
  const cajasHmi = hmiG ? Array.from({ length: 6 }, (_, k) => { const r = document.createElementNS(NS, 'rect'); r.setAttribute('width', 16); r.setAttribute('height', 12); r.setAttribute('rx', 2); r.setAttribute('fill', k % 3 ? '#2fd27a' : '#f5a623'); hmiG.appendChild(r); return { r, o: k / 6 }; }) : [];
  const cajasPlanta = plantaG ? Array.from({ length: 7 }, (_, k) => { const g = document.createElementNS(NS, 'g'); g.innerHTML = '<rect width="46" height="34" rx="3" fill="#c79a5b"/><path d="M0 12H46M23 0V34" stroke="#a87c42" stroke-width="2"/>'; plantaG.appendChild(g); return { g, o: k / 7 }; }) : [];
  let bultos = 1180, vivoA = false, vivoB = false, t0 = performance.now();
  const ciclo = (now) => {
    const s = (now - t0) / 1000;
    if (vivoA) {
      cajasHmi.forEach((c) => { const p = (s * 0.16 + c.o) % 1; let x, y; if (p < 0.55) { x = 30 + (p / 0.55) * 190; y = 64; } else { x = 40 + ((p - 0.55) / 0.45) * 220; y = 154; } c.r.setAttribute('x', x); c.r.setAttribute('y', y - 6); });
      if (prog) prog.setAttribute('width', ((s * 0.08) % 1) * 270);
    }
    if (vivoB) {
      cajasPlanta.forEach((c) => { const p = (s * 0.07 + c.o) % 1; c.g.setAttribute('transform', `translate(${-60 + p * 690} 50)`); });
      if (plantaN && Math.random() < 0.02) { bultos += Math.round(Math.random() * 3 - 1); plantaN.textContent = bultos.toLocaleString('es-ES'); }
    }
    if (vivoA || vivoB) requestAnimationFrame(ciclo); else corriendo = false;
  };
  let corriendo = false;
  const arranca = () => { if (!corriendo && !reduce) { corriendo = true; requestAnimationFrame(ciclo); } };
  if ($('.plc')) visible($('.plc'), (v) => { vivoA = v; if (v) arranca(); });
  if ($('.planta')) visible($('.planta'), (v) => { vivoB = v; if (v) arranca(); });
  if (plantaN) plantaN.textContent = bultos.toLocaleString('es-ES');

  // ---------- chispas de soldadura (taller) ----------
  const cv = $('#chispas');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d'); let W = 0, H = 0, ex = 0, ey = 0, on = false, chis = [];
    const img = $('.taller__fondo img');
    const medir = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5); const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // punto de soldadura en la foto (fracción de la imagen recortada) → posición con object-fit: cover
      const m = movil(); const fx = m ? 0.552 : 0.527, fy = m ? 0.635 : 0.66; const ar = m ? 0.8 : 16 / 9;
      const ir = img.getBoundingClientRect(); const cw = ir.width, ch = ir.height; let dw, dh; if (cw / ch > ar) { dw = cw; dh = cw / ar; } else { dh = ch; dw = ch * ar; }
      ex = ir.left - r.left + (cw - dw) / 2 + fx * dw; ey = ir.top - r.top + (ch - dh) / 2 + fy * dh;
    };
    const paso = () => {
      if (!on) return;
      ctx.clearRect(0, 0, W, H);
      const nCh = movil() ? 2 : 5, vMax = movil() ? 3.8 : 6.5;
      for (let k = 0; k < nCh; k++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6; const v = 1.5 + Math.random() * vMax; chis.push({ x: ex, y: ey, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, v: 1, l: 30 + Math.random() * 40 }); }
      ctx.globalCompositeOperation = 'lighter';
      chis = chis.filter((c) => {
        c.px = c.x; c.py = c.y; c.vy += 0.22; c.vx *= 0.99; c.x += c.vx; c.y += c.vy; c.l--;
        if (c.y > H * 0.94 && c.vy > 0) { c.vy *= -0.35; c.vx *= 0.6; }
        const al = Math.max(0, c.l / 70);
        ctx.strokeStyle = `rgba(255,${170 + Math.random() * 70 | 0},${70 + Math.random() * 60 | 0},${al})`; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(c.px, c.py); ctx.lineTo(c.x, c.y); ctx.stroke();
        return c.l > 0;
      });
      const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 70 + Math.random() * 30); g.addColorStop(0, 'rgba(255,240,210,.9)'); g.addColorStop(0.2, 'rgba(160,210,255,.35)'); g.addColorStop(1, 'rgba(255,150,40,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, 100, 0, 7); ctx.fill();
      requestAnimationFrame(paso);
    };
    visible($('#taller'), (v) => { on = v; if (v) { medir(); requestAnimationFrame(paso); } });
    addEventListener('resize', () => on && medir());
  }

  // ---------- con GSAP: escena, contadores, carril, mapa ----------
  const conGsap = () => {
    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    let lenis = null;
    if (window.Lenis && !reduce && !matchMedia('(pointer: coarse)').matches) {
      lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 1.1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const id = a.getAttribute('href'); if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -60 }); } }));
    }

    // --- portada: la furgoneta llega ---
    const furgo = $('#furgo'), ruedas = $$('.rueda', furgo), freno = $('.freno', furgo), hudF = $('#hud-furgo');
    const destino = () => parseFloat(getComputedStyle(furgo).getPropertyValue('--xn')) || 0.64;
    const meta = destino();
    const estado = { xn: -0.42 };
    const pinta = () => { furgo.style.setProperty('--xn', estado.xn); const ang = (estado.xn + 0.42) * 2707; ruedas.forEach((r) => { r.style.transform = `rotate(${ang}deg)`; }); };
    if (reduce) { estado.xn = meta; pinta(); hudF.textContent = 'EN DESTINO'; hudF.classList.add('ok'); }
    else {
      pinta();
      const tl = gsap.timeline({ delay: 0.5 });
      tl.to(estado, { xn: meta, duration: 2.8, ease: 'power3.out', onUpdate: pinta })
        .to(furgo, { '--yb': '2px', duration: 0.12, yoyo: true, repeat: 9, ease: 'sine.inOut' }, 0)
        .add(() => { freno.classList.add('on'); }, 2.1)
        .to(furgo, { '--yb': '3px', duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }, 2.75)
        .add(() => { hudF.textContent = 'EN DESTINO'; hudF.classList.add('ok'); }, 2.8)
        .add(() => { freno.classList.remove('on'); }, 3.6);
    }

    // --- portada: al bajar se abre la puerta seccional ---
    const lienzo = $('#lienzo'), hoja = $('#hoja'), baliza = $('#baliza'), charco = $('#charco'), luz = $('#luz-suelo');
    const hudP = $('#hud-puerta'), hudM = $('#hud-motor'), barra = $('#hud-barra'), pes = $$('.pe');
    const carretilla = $('#carretilla');
    gsap.set(lienzo, { xPercent: -50 });
    let montacargas = null;
    const lanzaCarretilla = () => { if (montacargas || reduce) return; montacargas = gsap.fromTo(carretilla, { xPercent: -120 }, { xPercent: 440, duration: 8, ease: 'none', repeat: -1, repeatDelay: 1.5 }); };
    const actualiza = (p) => {
      const ab = gsap.utils.clamp(0, 1, p / 0.62);
      gsap.set(hoja, { yPercent: -100 * ab });
      charco.style.opacity = 1 - ab; luz.style.opacity = ab;
      barra.style.width = (ab * 100).toFixed(0) + '%';
      const mov = ab > 0.01 && ab < 0.99;
      baliza.classList.toggle('gira', mov);
      hudP.textContent = ab < 0.01 ? 'CERRADA' : ab > 0.99 ? 'ABIERTA' : `ABRIENDO ${(ab * 100).toFixed(0)} %`;
      hudP.className = 'hud__v' + (ab > 0.99 ? ' ok' : mov ? ' mov' : '');
      hudM.textContent = mov ? 'EN MARCHA' : ab > 0.99 ? 'PARADO · FIN DE CARRERA' : 'EN ESPERA';
      hudM.className = 'hud__v' + (mov ? ' mov' : '');
      if (ab > 0.35) lanzaCarretilla();
      const paso = p < 0.12 ? 0 : p < 0.62 ? 1 : 2;
      pes.forEach((e, i) => e.classList.toggle('activo', i === paso));
    };
    actualiza(0);
    const mm = gsap.matchMedia();
    mm.add({ esc: '(min-width: 761px)', mov: '(max-width: 760px)' }, (c) => {
      if (reduce) { actualiza(0.7); return; }
      const tl = gsap.timeline({ scrollTrigger: { trigger: '#escena', start: c.conditions.mov ? 'top top' : 'top top', end: c.conditions.mov ? '+=110%' : '+=170%', pin: true, scrub: 0.6, onUpdate: (s) => actualiza(s.progress) } });
      tl.to(lienzo, { scale: c.conditions.mov ? 1.12 : 1.22, duration: 0.38, ease: 'power1.in' }, 0.62);
      if (c.conditions.esc) tl.to('.portada__txt', { autoAlpha: 0, y: -40, duration: 0.3 }, 0.05);
      tl.to('.escena__baja', { autoAlpha: 0, duration: 0.1 }, 0);
    });

    // --- contadores ---
    $$('.cuenta').forEach((el) => {
      const n = +el.dataset.n, o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => gsap.to(o, { v: n, duration: 2.2, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('es-ES'); } }) });
    });

    // --- aparición al bajar ---
    const rv = $$('.sec-t, .area, .msrv, .plc, .planta, .demo, .porton, .puertas__reales figure, .puertas__lista li, .cat, .pasos__lista li, .zona__txt, .mapa, .empresa__grid > *, .pq, .resena, .contacto__grid > *, .cifra, .taller__txt');
    rv.forEach((e) => e.classList.add('rv'));
    ScrollTrigger.batch(rv, { start: 'top 88%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }) });

    // --- taller: el fondo se mueve un poco más lento (parallax) ---
    gsap.fromTo('.taller__fondo picture', { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: '#taller', start: 'top bottom', end: 'bottom top', scrub: true } });

    // --- trabajos: carril horizontal fijado (solo pantallas grandes) ---
    mm.add('(min-width: 761px)', () => {
      if (reduce) return;
      const pista = $('#pista');
      const dist = () => pista.scrollWidth - innerWidth;
      gsap.to(pista, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#trabajos', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true } });
    });

    // --- mapa: rutas desde Riba-roja y la furgoneta recorriéndolas ---
    const mapa = $('#mapa');
    if (mapa && window.MAPA) {
      const L = window.MAPA, base = L['Riba-roja de Túria'], g = $('#rutas'), fur = $('#mapa-furgo');
      const rutas = Object.entries(L).filter(([n]) => n !== 'Riba-roja de Túria').map(([, [x, y]]) => {
        const [bx, by] = base; const mx = (bx + x) / 2, my = (by + y) / 2; const dx = x - bx, dy = y - by; const k = 0.18;
        const p = document.createElementNS(NS, 'path'); p.setAttribute('d', `M${bx} ${by}Q${mx - dy * k} ${my + dx * k} ${x} ${y}`); p.setAttribute('class', 'ruta'); g.appendChild(p);
        const len = p.getTotalLength(); p.style.strokeDasharray = `${len}`; p.style.strokeDashoffset = `${len}`; return { p, len };
      });
      ScrollTrigger.create({ trigger: mapa, start: 'top 75%', once: true, onEnter: () => {
        rutas.forEach((r, i) => gsap.to(r.p, { strokeDashoffset: 0, duration: 1.4, delay: i * 0.12, ease: 'power2.inOut', onComplete: () => { r.p.style.strokeDasharray = '6 8'; } }));
        if (reduce) return;
        let i = 0;
        const viaje = () => {
          const r = rutas[i % rutas.length]; i++;
          const o = { t: 0 };
          gsap.timeline({ onComplete: viaje })
            .to(o, { t: 1, duration: 2 + r.len / 220, ease: 'power1.inOut', onUpdate: () => { const a = r.p.getPointAtLength(o.t * r.len), b = r.p.getPointAtLength(Math.min(r.len, o.t * r.len + 1)); const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI; fur.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang})`); } })
            .to(o, { t: 0, duration: 1.2 + r.len / 300, ease: 'power1.inOut', onUpdate: () => { const a = r.p.getPointAtLength(o.t * r.len), b = r.p.getPointAtLength(Math.max(0, o.t * r.len - 1)); const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI; fur.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang})`); } }, '+=0.6');
        };
        viaje();
      } });
    }

    // --- arco Argentina → España ---
    const arco = $('#arco-ruta'), bola = $('#arco-bola');
    if (arco && bola) { const len = arco.getTotalLength(); const o = { t: 0 }; gsap.to(o, { t: 1, duration: 3.4, repeat: -1, ease: 'power1.inOut', onUpdate: () => { const p = arco.getPointAtLength(o.t * len); bola.setAttribute('cx', p.x); bola.setAttribute('cy', p.y); } }); }

    addEventListener('load', () => ScrollTrigger.refresh());
  };
  if (window.gsap) conGsap(); else addEventListener('DOMContentLoaded', conGsap);
})();
