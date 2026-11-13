# Ember — verification

Reviewed in the installed headless Firefox at a requested 1440 × 810 viewport. The user's earlier permission covers this browser method.

- Full native movie played, including its original sound: 30.442667 seconds.
- All 24 cues traversed in the live clock.
- Final presentation clock stopped at 180 seconds; measured wall time including checks/last screenshot was 180.96 seconds.
- Average observed animation rate: 57.4 frames per second in this headless environment. This is a development measurement, not a guarantee for a projector laptop.
- No browser console errors during the complete run.
- Original team planner suite: 15 tests passed.
- Every cue and original image loaded. Keyboard previous/next, notes, sound choice, pause and reset were exercised.

The full numerical receipt is [rehearsal.json](rehearsal/rehearsal.json); the [contact sheet](rehearsal-contact.webp) contains actual frames from that run.

Visual corrections made before this run: initialize new canvases at stage size, separate the three workflow inputs, anchor lines to icon centres, and use wall time for the presentation clock while retaining bounded animation steps.

Source audit: new work only in `ASTRA/versions/`. All shared media is referenced, not modified. OPUS PR 8 was merged while this version was being verified.
