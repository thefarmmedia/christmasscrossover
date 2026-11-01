(() => {
  'use strict';

  const starts = [...document.querySelectorAll('input[name="event-date"]')]
    .map(input => new Date(`${input.value}T19:00:00-06:00`));
  const clock = document.getElementById('fright-countdown');
  const clockLabel = document.getElementById('countdown-label');
  const clockDate = document.getElementById('countdown-date');
  const dateFormat = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', month: 'short', day: 'numeric'
  });
  function updateCountdown() {
    document.getElementById('countdown-panel').hidden = false;
    const now = Date.now();
    const current = starts.find(start => now >= start.getTime() && now < start.getTime() + 4 * 3600000);
    const next = starts.find(start => start.getTime() > now);
    if (current || !next) {
      clock.hidden = true;
      clockLabel.textContent = current ? 'The fright is on tonight' : 'The 2026 event has ended';
      clockDate.textContent = current ? '7 PM–11 PM · BRANSON, MO' : 'THANK YOU FOR THE SCREAMS';
      return;
    }
    clock.hidden = false;
    clockLabel.textContent = next === starts[0] ? 'The nightmare begins in' : 'The next fright begins in';
    clockDate.textContent = `${dateFormat.format(next).toUpperCase()} · 7 PM · BRANSON, MO`;
    const minutes = Math.max(0, Math.floor((next.getTime() - now) / 60000));
    document.getElementById('count-days').textContent = String(Math.floor(minutes / 1440)).padStart(2, '0');
    document.getElementById('count-hours').textContent = String(Math.floor(minutes / 60) % 24).padStart(2, '0');
    document.getElementById('count-minutes').textContent = String(minutes % 60).padStart(2, '0');
  }
  updateCountdown();
  window.setInterval(updateCountdown, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateCountdown(); });

  const photos = [...document.querySelectorAll('[data-gallery]')];
  const dialog = document.getElementById('character-gallery');
  const photo = document.getElementById('gallery-photo');
  const caption = document.getElementById('gallery-caption');
  const photoIndex = document.getElementById('gallery-index');
  let activePhoto = 0;
  let opener;
  let previousOverflow = '';
  function showPhoto(index) {
    activePhoto = (index + photos.length) % photos.length;
    const link = photos[activePhoto];
    photo.src = link.href;
    photo.alt = link.dataset.photoAlt;
    caption.textContent = link.dataset.caption;
    if (photoIndex) photoIndex.textContent = `${activePhoto + 1} / ${photos.length}`;
  }
  if (dialog && typeof dialog.showModal === 'function') {
    photos.forEach((link, index) => {
      link.setAttribute('aria-haspopup', 'dialog');
      link.addEventListener('click', event => {
        event.preventDefault();
        opener = link;
        showPhoto(index);
        previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = 'hidden';
      });
    });
    dialog.querySelector('.photo-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-photo-prev]').addEventListener('click', () => showPhoto(activePhoto - 1));
    dialog.querySelector('[data-photo-next]').addEventListener('click', () => showPhoto(activePhoto + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(activePhoto - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(activePhoto + 1); }
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus({ preventScroll: true });
    });
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px 35px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
    document.body.classList.add('reveal-ready');
  }
})();
