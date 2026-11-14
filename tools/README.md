# Repository maintenance

| Current source | Purpose |
| --- | --- |
| `Website/` | Main public website, technical guide and QR kit |
| `Presentation/hackathon/` | Exact presentation used by the team; preserve as an event record |
| `Care-Companion/` | Detailed prototype and separate phone experience |
| `C-Arcade/` | Both games |
| `Documentation/` | Research, specifications, transcripts and Siemens follow-up |

GitHub Pages publishes `main` from the repository root. Root `index.html` opens `Website/`; `.nojekyll` preserves the static setup.

## Existing public and QR routes

After changing the website or detailed platform, run from the repository root:

```sh
python3 tools/sync-public-routes.py
python3 tools/sync-public-routes.py --check
```

| Canonical source | Retained public route | Behavior |
| --- | --- | --- |
| `Website/` | `ALOHA/` | Generated static copy for previously shared QR links and downloads |
| `Care-Companion/` (detailed platform) | `CARMAGOTCHI_Web_Pitch/klickdummy-christian/` | Generated static copy for the original app QR |
| `Presentation/hackathon/` | `FINAL/v5/` | Entry redirect forwards query and fragment; the deck then applies its own navigation |
| `Archive/FINAL/v1/` | `FINAL/v1/` | Earlier pitch link inside the legacy phone app |

Edit canonical sources, then sync. Never edit generated copies independently. The `FINAL` entry redirects do not preserve old direct asset-download paths; assets travel with their presentation under `Presentation/hackathon/`.

`CARMAGOTCHI_APP/` is a frozen legacy deployment for existing QR codes and installed/offline apps. Keep its runtime, worker and shared arcade assets intact; replacing it with a redirect would disrupt that installation. Current development lives in `Care-Companion/phone/` and `C-Arcade/`. The new phone has its own worker cache namespace.

## Preservation audit

```sh
python3 tools/verify-preservation.py
```

[The manifest](preservation-manifest.json) records the 1,162 files present at `backup/post-hackathon-2026-11-14`. It verifies original-byte retention, the exact 14-file presentation at its new location, existing QR assets, legacy phone/arcade runtime, the Pages marker and generated copies. Updated documents retain an original copy in `Archive/Originals/`.

The manifest is an immutable audit receipt. Do not regenerate it merely to make an unexpected change pass. The earlier cleanup's receipts are in [Archive/Repository-Cleanup](../Archive/Repository-Cleanup/README.md).

[Rollback and backup instructions](../ROLLBACK.md) · [Post-event verification](POST-EVENT-REVIEW.md)
