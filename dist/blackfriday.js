(() => {
  'use strict';
  // Black Friday takeover. The inline script in <head> decides the page state before first paint:
  // html.bf-live while the sale runs, plus html.bf-intro when the fog intro should play.
  window.__bfStarted = true;
  const root = document.documentElement;
  const cl = root.classList;
  if (!cl.contains('bf-live')) return;

  // Friday, November 27, 2026 at 11:59:59 PM Central (CST = UTC-6).
  const END = Date.UTC(2026, 10, 28, 5, 59, 59);
  const forced = /[?&]bf=on\b/.test(location.search);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const easeIn = p => p * p * p;
  const easeOut = p => 1 - Math.pow(1 - p, 3);
  const easeInOut = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

  /* ---------- Fog renderer (WebGL, with a CSS fallback) ---------- */
  const AMBIENT = 0.55;
  // Where in the fog pattern the intro starts: a stretch that stays evenly lit while the fog
  // covers the screen (sampled on phone and desktop sizes).
  const T_START = 276;
  const fog = { rise: 0.05, clear: 0, amb: 0.45, flash: 0 };
  let fogEl = null;
  let draw = () => {};

  const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime, uRise, uClear, uAmb, uFlash;
// Integer-exact lattice hash: cell coordinates wrap to 0..288 and go through the
// permutation polynomial (34x^2 + x) mod 289, so every intermediate value is an exact
// integer below 2^24. Phone GPUs that fuse or reorder float math still get the same value
// on both sides of a cell edge. (A fract()-based hash flips on a 1-ulp rounding difference,
// which showed up on phones as hard, blocky seams in the fog.)
float m289(float x){ return x - floor(x * (1. / 289.)) * 289.; }
float h(vec2 i){
  i = vec2(m289(i.x), m289(i.y));
  float a = m289((i.x * 34. + 1.) * i.x);
  a = m289(((a + i.y) * 34. + 1.) * (a + i.y));
  a -= step(288.5, a) * 289.;
  return a * (1. / 289.);
}
float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1., 0.)), u.x), mix(h(i + vec2(0., 1.)), h(i + vec2(1., 1.)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * n(p); p = m * p; a *= .5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * asp, uv.y) * 2.4;
  float t = uTime;
  vec2 q = vec2(fbm(p + vec2(0., -t * .09)), fbm(p + vec2(5.2, 1.3) + vec2(t * .06, 0.)));
  float f = fbm(p * 1.2 + 2.2 * q + vec2(t * .14, -t * .05));
  // Wall of fog rising from the floor with a wispy leading edge.
  float front = uRise * 1.9 - .3;
  float cover = smoothstep(-.05, .25, front - uv.y + (f - .5) * .55);
  // A ragged hole that tears open from the center.
  vec2 c = (uv - .5) * vec2(asp, 1.);
  float r = length(c) / (.5 * sqrt(asp * asp + 1.));
  float hole = smoothstep(uClear * 1.8 - .5, uClear * 1.8 - .2, r + (f - .5) * .6);
  // Low ground fog that lingers afterwards.
  float ground = smoothstep(.6, 0., uv.y + (f - .5) * .4);
  float amb = uAmb * ground * smoothstep(.28, .72, f);
  float a = clamp(max(cover * hole * (.9 + .6 * f), amb), 0., 1.);
  float lum = smoothstep(.3, .85, f);
  vec3 col = mix(vec3(0., .045, .012), vec3(.02, .36, .07), lum);
  col = mix(col, vec3(.5, 1., .4), pow(lum, 3.) * .75);
  col += uFlash * vec3(.55, 1., .5) * (.25 + f);
  col = min(col, vec3(1.));
  gl_FragColor = vec4(col * a, a);
}`;

  function initWebGL() {
    const canvas = document.createElement('canvas');
    const opts = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' };
    const gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
    if (!gl) return false;
    // Without 32-bit floats in fragment shaders the noise cannot hold together: use the CSS fog.
    const highp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    if (!highp || highp.precision < 23) return false;
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ['uRes', 'uTime', 'uRise', 'uClear', 'uAmb', 'uFlash'].forEach(k => { U[k] = gl.getUniformLocation(prog, k); });

    const size = () => {
      // Fog is soft, so a reduced resolution is plenty. Phones get a little more,
      // since their small CSS viewport is stretched over many device pixels.
      const s = innerWidth < 760 ? 0.6 : 0.5;
      canvas.width = Math.max(1, Math.round(innerWidth * s));
      canvas.height = Math.max(1, Math.round(innerHeight * s));
    };
    size();
    addEventListener('resize', () => { size(); if (reduced) draw(T_START); }, { passive: true });

    canvas.className = 'bf-fog';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    fogEl = canvas;
    draw = time => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uTime, time);
      gl.uniform1f(U.uRise, fog.rise);
      gl.uniform1f(U.uClear, fog.clear);
      gl.uniform1f(U.uAmb, fog.amb);
      gl.uniform1f(U.uFlash, fog.flash);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    return true;
  }

  function initFallback() {
    const el = document.createElement('div');
    el.className = 'bf-fog-fallback';
    el.setAttribute('aria-hidden', 'true');
    document.body.prepend(el);
    fogEl = el;
    draw = () => {
      const cover = clamp01((fog.rise - 0.05) / 0.95) * (1 - fog.clear);
      el.style.opacity = cover.toFixed(3);
    };
  }

  if (!initWebGL()) initFallback();

  const flash = document.createElement('div');
  flash.className = 'bf-flash';
  flash.setAttribute('aria-hidden', 'true');
  document.body.append(flash);
  const strike = power => {
    fog.flash = power;
    flash.classList.remove('is-striking');
    void flash.offsetWidth;
    flash.classList.add('is-striking');
  };

  /* ---------- Headline letters ---------- */
  const black = document.querySelector('.bf-title-black');
  if (black && !reduced) {
    let i = 0;
    black.innerHTML = black.textContent.trim().split(/\s+/).map(word =>
      '<span class="w">' + [...word].map(ch => `<span class="ch" style="--i:${i++}">${ch}</span>`).join('') + '</span>'
    ).join(' ');
  }

  /* ---------- Cards: ignite on view, tilt with the pointer ---------- */
  const cards = [...document.querySelectorAll('.bf-card')];
  if (!reduced) cl.add('bf-fx');
  let cardsArmed = false;
  function armCards() {
    if (cardsArmed || reduced) return;
    cardsArmed = true;
    if (!('IntersectionObserver' in window)) { cards.forEach(c => c.classList.add('is-lit')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      io.unobserve(card);
      setTimeout(() => card.classList.add('is-lit'), Number(card.dataset.delay) || 0);
    }), { threshold: 0.2 });
    cards.forEach((card, i) => { card.dataset.delay = String(i * 280); io.observe(card); });
  }
  if (finePointer && !reduced) {
    cards.forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.classList.add('is-hover');
        card.style.setProperty('--ry', `${((x - 0.5) * 14).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${((0.5 - y) * 14).toFixed(2)}deg`);
        card.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
        card.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-hover');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- Intro timeline: Coming Soon → fog → Black Friday ---------- */
  let seen = false;
  try { seen = sessionStorage.getItem('bf-intro') === '1'; } catch (e) { /* storage blocked */ }
  let HOLD = seen ? 300 : 1100;
  let RISE = 1000;
  const COVER = 160;
  const CLEAR = 1500;
  const SETTLE = 1800;
  let phase = cl.contains('bf-intro') ? 'intro' : 'none';
  let tPhase = performance.now();
  let struck = false;
  let running = false;
  let lastDraw = 0;
  const t0 = performance.now();

  function swap() {
    cl.remove('bf-intro', 'bf-dissolve');
    cl.add('bf-reveal');
    scrollTo(0, 0);
    try { sessionStorage.setItem('bf-intro', '1'); } catch (e) { /* storage blocked */ }
    removeSkip();
    setTimeout(armCards, 1700);
  }

  function step(now) {
    if (phase === 'none') {
      phase = 'settle';
      tPhase = now;
      fog.rise = 0;
      fog.amb = 0;
      if (fogEl) fogEl.classList.add('is-behind');
    }
    const p = clamp01((now - tPhase) / ({ intro: HOLD, rise: RISE, cover: COVER, clear: CLEAR, settle: SETTLE }[phase] || 1));
    if (phase === 'intro') {
      fog.rise = 0.05;
      if (p >= 1) { phase = 'rise'; tPhase = now; cl.add('bf-dissolve'); }
    } else if (phase === 'rise') {
      fog.rise = 0.05 + 0.95 * easeIn(p);
      if (p > 0.7 && !struck) { struck = true; strike(1); }
      if (p >= 1) { phase = 'cover'; tPhase = now; swap(); }
    } else if (phase === 'cover') {
      if (p >= 1) { phase = 'clear'; tPhase = now; }
    } else if (phase === 'clear') {
      fog.clear = easeOut(p);
      fog.amb = 0.45 * (1 - p);
      if (p >= 1) {
        phase = 'settle';
        tPhase = now;
        fog.rise = 0;
        fog.clear = 0;
        fog.amb = 0;
        if (fogEl) fogEl.classList.add('is-behind');
      }
    } else if (phase === 'settle') {
      fog.amb = AMBIENT * easeInOut(p);
      if (p >= 1) phase = 'steady';
    }
    fog.flash *= 0.9;
  }

  let lastFrameAt = 0;
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    lastFrameAt = performance.now();
    if (document.hidden) return;
    // Once the transition is over, the ambient fog only needs ~30 fps.
    if (phase === 'steady' && now - lastDraw < 32) return;
    lastDraw = now;
    step(now);
    draw((now - t0) / 1000 + T_START);
  }

  // Any input during the opening beat jumps straight into the fog.
  const skip = () => {
    if (phase !== 'intro') return;
    RISE = 650;
    phase = 'rise';
    tPhase = performance.now();
    cl.add('bf-dissolve');
  };
  const skipEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
  skipEvents.forEach(ev => addEventListener(ev, skip, { passive: true }));
  function removeSkip() { skipEvents.forEach(ev => removeEventListener(ev, skip)); }

  if (reduced) {
    // No intro, no animation: a single still frame of ground fog behind the page.
    fog.rise = 0; fog.amb = AMBIENT;
    if (fogEl) fogEl.classList.add('is-behind');
    draw(T_START);
    armCards();
  } else {
    running = true;
    requestAnimationFrame(frame);
    if (phase === 'none') setTimeout(armCards, 300);
    // Watchdog: if the page is on screen but no animation frames ever arrive (some embedded
    // browsers, screenshot tools), show the specials without the intro instead of waiting forever.
    if (phase === 'intro') {
      const watchdog = () => {
        if (!['intro', 'rise', 'cover'].includes(phase)) return;
        if (document.visibilityState !== 'visible' || performance.now() - lastFrameAt < 500) {
          setTimeout(watchdog, 1000);
          return;
        }
        if (cl.contains('bf-intro')) swap();
        cl.remove('bf-reveal', 'bf-fx'); // CSS entrances would stall too, so show everything as-is
        phase = 'steady';
        Object.assign(fog, { rise: 0, clear: 0, amb: AMBIENT, flash: 0 });
        if (fogEl) fogEl.classList.add('is-behind');
        draw(T_START);
      };
      setTimeout(watchdog, HOLD + RISE + 2500);
    }
  }

  /* ---------- Countdown + automatic shut-off ---------- */
  function endSale() {
    running = false;
    cl.remove('bf-live', 'bf-intro', 'bf-dissolve', 'bf-reveal', 'bf-fx');
    cl.add('bf-ended');
    if (fogEl) fogEl.remove();
    flash.remove();
    document.title = 'Field of Screams Branson | 2027 Season Coming Soon';
  }

  const cd = document.getElementById('bf-countdown');
  if (cd) {
    const cells = {};
    cd.querySelectorAll('[data-u]').forEach(b => { cells[b.dataset.u] = b; });
    const put = (k, v) => { if (cells[k] && cells[k].textContent !== v) cells[k].textContent = v; };
    const pad = v => String(v).padStart(2, '0');
    let timer = 0;
    const tick = () => {
      const ms = END - Date.now();
      if (ms <= 0 && !forced) { clearInterval(timer); endSale(); return; }
      const s = Math.max(0, Math.floor(ms / 1000));
      put('d', String(Math.floor(s / 86400)));
      put('h', pad(Math.floor((s % 86400) / 3600)));
      put('m', pad(Math.floor((s % 3600) / 60)));
      put('s', pad(s % 60));
    };
    cd.hidden = false;
    tick();
    timer = setInterval(tick, 1000);
  }
})();
