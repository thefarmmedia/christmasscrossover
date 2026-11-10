(() => {
  'use strict';
  // Animated components layer. Adds decorative elements only; never touches links or ticket buttons' attributes.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const effectsOn = () => !document.body.classList.contains('effects-off') && !document.hidden;

  // Scroll progress
  const bar = document.createElement('div');
  bar.className = 'fx-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);
  let ticking = false;
  const syncProgress = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--fx-progress', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(syncProgress); } }, { passive: true });
  addEventListener('resize', syncProgress, { passive: true });
  syncProgress();

  // Hero fog + lightning
  const hero = document.querySelector('.hero');
  if (hero) {
    const fog = document.createElement('div');
    fog.className = 'fx-fog';
    fog.setAttribute('aria-hidden', 'true');
    fog.innerHTML = '<i></i><i></i>';
    const flash = document.createElement('div');
    flash.className = 'fx-flash';
    flash.setAttribute('aria-hidden', 'true');
    hero.append(fog, flash);
    if (!reduced) {
      const strike = () => {
        if (effectsOn() && hero.getBoundingClientRect().bottom > 0) {
          flash.classList.remove('is-striking');
          void flash.offsetWidth;
          flash.classList.add('is-striking');
        }
        setTimeout(strike, 7000 + Math.random() * 9000);
      };
      setTimeout(strike, 2200);
    }
  }

  // Neon flicker headings + creeping cameos on scroll
  const flickers = document.querySelectorAll('.section-wrap h2, .final-cta h2');
  flickers.forEach(h => h.classList.add('fx-flicker'));
  const creepers = document.querySelectorAll('.character-peek');
  if ('IntersectionObserver' in window) {
    creepers.forEach(c => c.classList.add('fx-creep'));
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('fx-on'); io.unobserve(entry.target); }
    }), { threshold: 0.25 });
    [...flickers, ...creepers].forEach(el => io.observe(el));
  } else {
    flickers.forEach(h => h.classList.add('fx-on'));
  }

  // Pointer spotlight + tilt
  if (finePointer) {
    document.querySelectorAll('.date-ticket, .venue-panel, .event-facts > div').forEach(card => {
      card.classList.add('fx-spot');
      const glow = document.createElement('span');
      glow.className = 'fx-glow';
      glow.setAttribute('aria-hidden', 'true');
      card.prepend(glow);
      const tilt = card.classList.contains('date-ticket') && !reduced;
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        card.style.setProperty('--fx-a', 1);
        if (tilt) {
          card.style.setProperty('--ry', `${(x - 0.5) * 10}deg`);
          card.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
        }
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--fx-a', 0);
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  // Countdown digit drop-in
  if (!reduced && 'MutationObserver' in window) {
    document.querySelectorAll('.countdown-clock strong').forEach(digit => {
      let last = digit.textContent;
      new MutationObserver(() => {
        if (digit.textContent === last) return;
        last = digit.textContent;
        digit.classList.remove('fx-tick');
        void digit.offsetWidth;
        digit.classList.add('fx-tick');
      }).observe(digit, { childList: true, characterData: true, subtree: true });
    });
  }
})();
