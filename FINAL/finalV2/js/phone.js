/* ALOHA ROBOTICS · FINAL v2 — a real phone. Fills in what every phone on stage shares: the iOS status bar
   (signal, Wi-Fi, battery), the app's tab bar and its icons (icon shapes from CARMAGOTCHI_APP/app.mjs),
   and the lock-screen glyphs. Also the two things phones do when something arrives: wake up and buzz. */
(function () {
  'use strict';
  const OPUS = window.OPUS;
  const SHAPES = {
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    arrow: '<path d="m9 5 7 7-7 7"/>', back: '<path d="m15 5-7 7 7 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10.5" rx="2.6"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/>',
    torch: '<path d="M8 3h8v3.5l-2 3.5V21h-4V10L8 6.5Z"/><path d="M12 13v2.5"/>',
    camera: '<path d="M4 8.5h3.2L9 6h6l1.8 2.5H20V19H4Z"/><circle cx="12" cy="13.3" r="3.3"/>',
  };
  const icon = (n) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${SHAPES[n] || ''}</svg>`;
  const STATUS =
    '<svg class="sb-sig" viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="7.6" width="3.2" height="4.4" rx="1"/><rect x="4.9" y="5.2" width="3.2" height="6.8" rx="1"/><rect x="9.8" y="2.6" width="3.2" height="9.4" rx="1"/><rect x="14.7" y="0" width="3.2" height="12" rx="1"/></svg>' +
    '<svg class="sb-wifi" viewBox="0 0 17 12" aria-hidden="true"><path d="M8.5 11.6 5.9 9a3.7 3.7 0 0 1 5.2 0Z"/><path d="M3.3 6.4a7.4 7.4 0 0 1 10.4 0l-1.4 1.4a5.4 5.4 0 0 0-7.6 0Z"/><path d="M.7 3.8a11.1 11.1 0 0 1 15.6 0l-1.4 1.4a9.1 9.1 0 0 0-12.8 0Z"/></svg>' +
    '<svg class="sb-bat" viewBox="0 0 28 13" aria-hidden="true"><rect x=".6" y=".6" width="23.8" height="11.8" rx="3.6" fill="none" stroke="currentColor" stroke-opacity=".38" stroke-width="1.1"/><rect x="2.3" y="2.3" width="17.6" height="8.4" rx="2" /><path d="M25.7 4.4v4.2a2.3 2.3 0 0 0 0-4.2Z" fill-opacity=".45"/></svg>';
  const TABS = [['heart', 'C-arms'], ['bell', 'Requests'], ['clock', 'Activity'], ['user', 'You']];

  document.querySelectorAll('.ph-status .ic').forEach((n) => { n.innerHTML = STATUS; });
  document.querySelectorAll('[data-tabs]').forEach((n) => {
    const on = +n.dataset.tabs;
    n.innerHTML = TABS.map(([ic, label], i) => `<span class="${i === on ? 'on' : ''}${i === 1 ? ' dot' : ''}">${icon(ic)}<b>${label}</b></span>`).join('');
  });
  document.querySelectorAll('[data-icon]').forEach((n) => { n.insertAdjacentHTML('afterbegin', icon(n.dataset.icon)); });

  // a short haptic buzz: the phone shivers when a notification lands (uses `translate`, so it stacks with transforms)
  function buzz(phone) { if (!phone) return; phone.classList.remove('buzz'); void phone.offsetWidth; phone.classList.add('buzz'); }
  OPUS.phone = { icon, buzz };
})();
