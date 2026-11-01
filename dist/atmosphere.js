(() => {
  'use strict';

  const toggle = document.getElementById('atmosphere-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const snowfield = document.querySelector('.snowfield');
  const snow = document.createElement('canvas');
  snow.setAttribute('aria-hidden', 'true');
  snowfield.replaceChildren(snow);
  const context = snow.getContext('2d');
  // A six-armed crystal with small branches stays recognizable on phone screens.
  const crystal = new Path2D();
  for (let arm = 0; arm < 6; arm++) {
    const angle = arm * Math.PI / 3;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    crystal.moveTo(0, 0);
    crystal.lineTo(x, y);
    for (const side of [-1, 1]) {
      crystal.moveTo(x * .56, y * .56);
      crystal.lineTo(x * .79 - y * .24 * side, y * .79 + x * .24 * side);
    }
  }
  let width = 0;
  let height = 0;
  let flakes = [];
  let enabled = false;
  let animation = 0;
  let lastFrame = 0;

  function resizeSnow() {
    width = window.innerWidth;
    height = window.innerHeight;
    const density = Math.min(window.devicePixelRatio || 1, 2);
    snow.width = Math.round(width * density);
    snow.height = Math.round(height * density);
    if (!context) return;
    context.setTransform(density, 0, 0, density, 0, 0);
    const count = Math.max(24, Math.min(60, Math.round(width * height / 21000)));
    flakes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 3.4 + Math.random() * 3,
      speed: 13 + Math.random() * 19,
      opacity: .18 + Math.random() * .36,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - .5) * .18,
      phase: Math.random() * Math.PI * 2,
      sway: 3 + Math.random() * 11
    }));
  }

  function drawSnow(timestamp) {
    animation = 0;
    if (!enabled || document.hidden || !context) return;
    const delta = Math.min((timestamp - (lastFrame || timestamp)) / 1000, .05);
    lastFrame = timestamp;
    context.clearRect(0, 0, width, height);
    for (const flake of flakes) {
      flake.y += flake.speed * delta;
      flake.x += (2.2 + Math.sin(timestamp / 6000 + flake.phase) * 3) * delta;
      if (flake.y > height + 10) { flake.y = -10; flake.x = Math.random() * width; }
      if (flake.x > width + 15) flake.x = -15;
      const sway = Math.sin(timestamp / 4700 + flake.phase) * flake.sway;
      flake.rotation += flake.spin * delta;
      context.save();
      context.translate(flake.x + sway, flake.y);
      context.rotate(flake.rotation);
      context.scale(flake.radius, flake.radius);
      context.lineWidth = .13;
      context.lineCap = 'round';
      context.strokeStyle = `rgba(245,248,255,${flake.opacity})`;
      context.stroke(crystal);
      context.restore();
    }
    animation = window.requestAnimationFrame(drawSnow);
  }

  function updatePlayback() {
    if (enabled && !document.hidden && context) {
      if (!animation) { lastFrame = 0; animation = window.requestAnimationFrame(drawSnow); }
    } else {
      window.cancelAnimationFrame(animation);
      animation = 0;
      lastFrame = 0;
      if (context) context.clearRect(0, 0, width, height);
    }
  }

  function setAtmosphere(requested) {
    enabled = requested && !reducedMotion.matches;
    document.body.classList.toggle('snow-off', !enabled);
    document.body.classList.toggle('effects-off', !enabled);
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.textContent = `Atmosphere: ${enabled ? 'on' : 'off'}`;
    updatePlayback();
  }

  // Positions are measured in the original 1536 × 1024 artwork.
  const frameBulbs = [
    [104,74,'240,0,0'], [244,53,'0,248,0'], [547,39,'240,0,0'],
    [1089,39,'0,248,0'], [1344,62,'240,0,0'], [1508,144,'0,248,0'],
    [35,232,'240,0,0'], [174,301,'0,248,0'], [1476,340,'240,0,0'],
    [39,585,'0,248,0'], [104,747,'240,0,0'], [1389,602,'0,248,0'],
    [1500,775,'240,0,0']
  ];
  const emblemBulbs = [
    [360,145,'240,0,0'], [983,212,'0,248,0'],
    [233,1000,'0,248,0'], [981,1029,'240,0,0']
  ];
  const lightGroups = [];

  function makeLight(layer, [x,y,color], tile) {
    const light = document.createElement('span');
    light.className = 'practical-light';
    light.style.setProperty('--light-color', color);
    light.style.setProperty('--cycle', `${5.5 + Math.random() * 4.5}s`);
    light.style.setProperty('--phase', `${-Math.random() * 25}s`);
    layer.appendChild(light);
    return { light, x, y, tile };
  }

  function addLights(host, bulbs, spread, sourceWidth = 1536, sourceHeight = 1024) {
    if (!host) return;
    const layer = document.createElement('div');
    layer.className = 'light-layer';
    layer.setAttribute('aria-hidden', 'true');
    const lights = bulbs.map(bulb => makeLight(layer, bulb, 0));
    host.appendChild(layer);
    lightGroups.push({ host, layer, bulbs, lights, spread, sourceWidth, sourceHeight, tileStart: 0, tileEnd: 1 });
  }

  function positionLights() {
    for (const group of lightGroups) {
      const { host, layer, bulbs, spread, sourceWidth, sourceHeight } = group;
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) continue;
      const style = window.getComputedStyle(host);
      const size = style.backgroundSize.split(/\s+/);
      let imageWidth;
      let imageHeight;
      if (size[0] === 'cover' || size[0] === 'contain') {
        const scale = size[0] === 'cover'
          ? Math.max(w / sourceWidth, h / sourceHeight)
          : Math.min(w / sourceWidth, h / sourceHeight);
        imageWidth = sourceWidth * scale;
        imageHeight = sourceHeight * scale;
      } else {
        const dimension = (value, available) => !value || value === 'auto'
          ? null : value.endsWith('%') ? available * parseFloat(value) / 100 : parseFloat(value);
        const specifiedWidth = dimension(size[0], w);
        const specifiedHeight = dimension(size[1], h);
        imageWidth = specifiedWidth ?? (specifiedHeight !== null ? specifiedHeight * sourceWidth / sourceHeight : w);
        imageHeight = specifiedHeight ?? (specifiedWidth !== null ? specifiedWidth * sourceHeight / sourceWidth : h);
      }
      const offset = (value, outer, inner) => value.endsWith('%')
        ? (outer - inner) * parseFloat(value) / 100 : parseFloat(value) || 0;
      const xOffset = offset(style.backgroundPositionX, w, imageWidth);
      const yOffset = offset(style.backgroundPositionY, h, imageHeight);
      const repeatY = style.backgroundImage !== 'none'
        && ['repeat-y', 'repeat', 'no-repeat repeat'].includes(style.backgroundRepeat);
      const tileStart = repeatY ? Math.floor(-yOffset / imageHeight) : 0;
      const tileEnd = repeatY ? Math.ceil((h - yOffset) / imageHeight) : 1;
      if (group.tileStart !== tileStart || group.tileEnd !== tileEnd) {
        layer.replaceChildren();
        group.lights = [];
        for (let tile = tileStart; tile < tileEnd; tile++) {
          group.lights.push(...bulbs.map(bulb => makeLight(layer, bulb, tile)));
        }
        group.tileStart = tileStart;
        group.tileEnd = tileEnd;
      }
      for (const { light, x, y, tile } of group.lights) {
        light.style.left = `${xOffset + x / sourceWidth * imageWidth}px`;
        light.style.top = `${yOffset + y / sourceHeight * imageHeight + tile * imageHeight}px`;
        light.style.setProperty('--spread', `${Math.max(17, Math.min(100, spread * imageWidth / sourceWidth))}px`);
      }
    }
  }

  const frame = document.querySelector('.world-backdrop');
  addLights(frame, frameBulbs, 82);
  for (const side of ['left', 'right']) {
    const edge = document.createElement('div');
    edge.className = `mobile-frame mobile-frame-${side}`;
    edge.setAttribute('aria-hidden', 'true');
    frame.appendChild(edge);
    const edgeBulbs = frameBulbs.filter(([x]) => side === 'left' ? x < 300 : x > 1300);
    addLights(edge, edgeBulbs, 65);
  }
  addLights(document.querySelector('.hero-emblem'), emblemBulbs, 52, 1254, 1254);
  const resizeObserver = new ResizeObserver(positionLights);
  lightGroups.forEach(({ host }) => resizeObserver.observe(host));
  window.addEventListener('resize', resizeSnow, { passive: true });
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('atmosphere-paused', document.hidden);
    updatePlayback();
  });
  toggle.addEventListener('click', () => setAtmosphere(!enabled));
  reducedMotion.addEventListener('change', event => setAtmosphere(!event.matches));
  resizeSnow();
  positionLights();
  setAtmosphere(!reducedMotion.matches);
})();
