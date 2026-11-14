# Browser validation

Tested in headless Firefox 159 at 1440 × 810.

- The complete 180-second show ran in real time: 181.06 seconds including launch and final capture, approximately 57.6 frames per second.
- The original 30.442667-second movie played natively, with its audio, before the title transition. It is byte-for-byte identical to the team's original asset.
- All 32 cues rendered at their scheduled times. The last frame held at 180 seconds.
- Every embedded Christian-template screen reached the expected scene and step. All outer and embedded image assets loaded.
- Pausing the outer presentation also paused the embedded update timer; resuming continued it. Keyboard navigation, notes, optional sound and reset passed.
- No browser console errors occurred.

The screenshots were reviewed for phone readability, uncluttered character states, schedule legibility, the mission/map relationship and the final message. The presentation uses a scripted mission, not a live hospital or robot connection. The displayed maintenance duration is illustrative; rehearsal time is compressed.

[Cue and interaction receipt](previews/review.json) · [Real-time rehearsal receipt](rehearsal/rehearsal.json) · [Full-show contact sheet](rehearsal-contact.webp)
