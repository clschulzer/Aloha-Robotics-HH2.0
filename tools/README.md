# Repository maintenance

The public source lives in `Website/`, `Care-Companion/` and `C-Arcade/`. The submitted presentation stays in `FINAL/v5/`, at its original URL.

## Existing QR routes

Run from the repository root after changing the website or detailed platform:

```bash
python3 tools/sync-public-routes.py
python3 tools/sync-public-routes.py --check
```

This makes explicit static copies:

| Source | Existing public route |
| --- | --- |
| `Website/` | `ALOHA/` |
| `Care-Companion/` — detailed platform only | `CARMAGOTCHI_Web_Pitch/klickdummy-christian/` |

Copies preserve relative assets, query strings, URL fragments, direct downloads and existing QR destinations. There is no redirect between these pairs. Edit the source, then run the script; never edit the generated runtime copy.

`CARMAGOTCHI_APP/` is a separate frozen legacy deployment for installed phone apps and their offline arcade. Its cache and original assets remain intact. Current development lives in `Care-Companion/phone/` and `C-Arcade/`; the new phone uses its own cache namespace.

[Cleanup verification record](CLEANUP-REVIEW.md) · [Rollback instructions](../ROLLBACK.md)

## Preservation audit

```bash
python3 tools/verify-preservation.py
```

The manifest records every file tracked immediately before cleanup, its original hash, and where its original bytes were retained. Changed documentation has an untouched copy under `Archive/Originals/`. The checker additionally protects the complete submitted deck, the legacy phone runtime and the existing QR kit.

The manifest is an audit receipt, not a baseline to regenerate after future edits. If a protected file needs to change, first review [ROLLBACK.md](../ROLLBACK.md) and the original preservation requirements. Do not weaken checks to make a changed presentation pass.
