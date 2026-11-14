/* ALOHA ROBOTICS / OPUS — Q&A appendix (press A). Static, readable, honest. */
(function () {
  'use strict';
  const OPUS = window.OPUS;
  ['app-score', 'app-real', 'app-robot'].forEach((id) => OPUS.scene({ id, el: document.getElementById('s-' + id), beats: 1, theme: 'dark', appendix: true }));
})();
