(() => {
  'use strict';

  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const closeMenu = (restoreFocus = false) => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    mobileNav.hidden = true;
    if (restoreFocus) menuButton.focus();
  };
  menuButton.addEventListener('click', () => {
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
    mobileNav.hidden = !opening;
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!mobileNav.hidden && !event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(min-width: 801px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });

  const radios = [...document.querySelectorAll('input[name="event-date"]')];
  const selectedLabel = document.getElementById('selected-night');
  const calendarButton = document.getElementById('calendar-button');
  const status = document.getElementById('opening-status');
  const dateFormat = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', weekday: 'long', month: 'long', day: 'numeric'
  });
  const eventTime = (date, hour) => new Date(`${date}T${hour}:00:00-06:00`);
  const labelDate = date => dateFormat.format(eventTime(date, '19'));
  let allFinished = false;

  function updateSelection() {
    const selected = radios.find(radio => radio.checked && !radio.disabled);
    calendarButton.disabled = !selected;
    selectedLabel.textContent = selected ? `Your night: ${labelDate(selected.value)}` : 'The 2026 event has ended. Visit the official site for the latest events.';
  }

  function updateEventStatus() {
    const now = new Date();
    radios.forEach(radio => {
      const expired = now >= eventTime(radio.value, '23');
      radio.disabled = expired;
      radio.closest('label').classList.toggle('is-past', expired);
    });
    const next = radios.find(radio => !radio.disabled);
    if (!next) {
      status.textContent = '2026 EVENT COMPLETE';
      if (!allFinished) {
        radios.forEach(radio => { radio.checked = false; });
        updateSelection();
      }
      allFinished = true;
      return;
    }
    const selected = radios.find(radio => radio.checked && !radio.disabled);
    if (!selected) {
      next.checked = true;
      updateSelection();
    }
    const start = eventTime(next.value, '19');
    const days = Math.ceil((start - now) / 86400000);
    if (now >= start) status.textContent = 'THE FRIGHT IS ON TONIGHT';
    else if (days === 1) status.textContent = 'THE NEXT FRIGHT IS LESS THAN A DAY AWAY';
    else status.textContent = `${days} DAYS UNTIL ${next === radios[0] ? 'OPENING NIGHT' : 'THE NEXT FRIGHT'}`;
  }

  radios.forEach(radio => radio.addEventListener('change', updateSelection));
  updateEventStatus();
  updateSelection();
  window.setInterval(updateEventStatus, 60000);

  const icsEscape = text => text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const icsDate = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  let toastTimer;
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 6500);
  }

  calendarButton.addEventListener('click', () => {
    const selected = radios.find(radio => radio.checked && !radio.disabled);
    if (!selected) return;
    const date = selected.value;
    const body = [
      'BEGIN:VCALENDAR', 'VERSION:2.0',
      'PRODID:-//Field of Screams Branson//Fright Before Christmas//EN',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      `UID:fright-before-christmas-${date}@fieldofscreamsbranson.com`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(eventTime(date, '19'))}`,
      `DTEND:${icsDate(eventTime(date, '23'))}`,
      'SUMMARY:The Fright Before Christmas - Field of Screams Branson',
      `LOCATION:${icsEscape('Ballparks of America, 1000 Pat Nash Drive, Branson, MO 65616')}`,
      `DESCRIPTION:${icsEscape('Halloween / Christmas crossover at Field of Screams Branson. Box office opens at 6 PM Central. Attraction hours are 7 PM to 11 PM Central. This calendar entry is not an admission ticket. Open the ticket buttons at https://fright-before-christmas-branson-2026-sg.briskmars1028.chatgpt.site/#dates for tickets and availability.')}`,
      'URL:https://fright-before-christmas-branson-2026-sg.briskmars1028.chatgpt.site/#dates',
      'END:VEVENT', 'END:VCALENDAR', ''
    ].join('\r\n');
    const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fright-before-christmas-${date}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    showToast(`Calendar file downloaded for ${labelDate(date)}. Tickets are purchased separately.`);
  });
})();
