# Aloha site and QR checks

Checked on 14 November 2026.

## Website

- Firefox: desktop and 390 px phone layouts, no horizontal page overflow or JavaScript console errors.
- Native WebGL palm: solid/wireframe toggle, pointer and keyboard rotation, pause, reduced motion, offscreen suspension, cleanup and SVG fallback.
- All five care-loop steps and the looping Next button update their character, copy and source link.
- Homepage, technical brief and QR download page checked in the browser.
- Local page, asset and source-document links checked. Technical claims reviewed against Christian’s planner and architecture notes.

## QR assets

[The machine-readable receipt](../share/destinations.json) records 31 successful independent ZXing checks, covering PNG and SVG symbols, individual cards and the combined sheet at multiple sizes.

Each QR returns its exact expected public destination. The combined card sheet is verified at 3840, 1920 and 1280 pixels wide. This delivery includes standalone assets only; the presentations are unchanged.

The arcade’s raw PNG and SVG are byte-identical to its existing download assets.

## Scope

The Aloha website is buildless and has no server component. Browser testing verifies its links, presentation, interactions and QR images. It does not validate the proposed clinical system or replace a scan test with the actual projector and audience distance.
