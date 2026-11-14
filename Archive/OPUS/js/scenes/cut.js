/* ALOHA ROBOTICS / OPUS — scene 4: the Tamagotchi screen dies; one sentence carries the turn. */
(function () {
  'use strict';
  const OPUS = window.OPUS;
  OPUS.scene({ id: 'cut', el: document.getElementById('s-cut'), beats: 1, theme: 'dark',
    enter(ctx) { if (!ctx.instant) setTimeout(() => OPUS.audio.sfx.heartbeat(0.35), 2450); },
  });
})();
