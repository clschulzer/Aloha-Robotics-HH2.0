/* ALOHA ROBOTICS / OPUS — scenes 0–2: standby, the film, the ember intro. */
(function () {
  'use strict';
  const OPUS = window.OPUS;
  const video = document.getElementById('film');
  const playBtn = document.getElementById('film-play');
  const standby = document.getElementById('s-standby');
  const EMBER_AT = 29.62;          // the fireball fills the frame here; embers take over on top of it
  let lastPress = 0, embersStarted = false, filmActive = false;

  video.addEventListener('canplaythrough', () => standby.classList.add('ready'));
  video.addEventListener('ended', () => { if (filmActive) OPUS.next(true); });
  playBtn.addEventListener('click', (e) => { e.stopPropagation(); video.play().then(() => playBtn.classList.remove('show')).catch(() => {}); });

  /* 0 · standby: black, nothing for the audience to read */
  OPUS.scene({ id: 'standby', el: standby, beats: 1, theme: 'dark',
    enter() { OPUS.embers.reset(); video.pause(); },
  });

  /* 1 · the film (sound on, untouched) */
  OPUS.scene({ id: 'film', el: document.getElementById('s-film'), beats: 1, theme: 'dark',
    enter(ctx) {
      filmActive = true; embersStarted = false; lastPress = 0;
      OPUS.embers.reset();
      document.getElementById('s-film').classList.remove('fading');
      video.muted = false; video.currentTime = 0;
      const p = video.play();
      if (p && p.then) p.then(() => playBtn.classList.remove('show')).catch(() => playBtn.classList.add('show'));
    },
    leave(ctx) {
      filmActive = false;
      if (ctx.forward && ctx.to === 'intro') { document.getElementById('s-film').classList.add('fading'); setTimeout(() => video.pause(), 650); return 650; }
      video.pause(); return 0;
    },
    onNext() {
      if (video.ended || video.currentTime >= EMBER_AT) { video.pause(); return false; }
      const now = performance.now();
      if (now - lastPress < 900) { lastPress = 0; video.currentTime = EMBER_AT - 1.6; return true; }
      lastPress = now; OPUS.toast('→ AGAIN TO SKIP'); return true;
    },
    frame() { if (filmActive && !embersStarted && video.currentTime >= EMBER_AT) { embersStarted = true; OPUS.embers.explode(); } },
  });

  /* 2 · intro: the explosion becomes the team name */
  OPUS.scene({ id: 'intro', el: document.getElementById('s-intro'), beats: 1, theme: 'dark',
    enter(ctx) { OPUS.embers.runIntro(ctx.instant); },
    onNext() { if (!OPUS.embers.locked) { OPUS.embers.lockNow(false); return true; } return false; },
    leave() { OPUS.embers.fadeOut(0.35); return 0; },
  });
})();
