# Post-event organization review

Reviewed on 14 November 2026, before publication of the cleanup commit.

## Recovery and scope

The baseline is `3b8065afbe38e6b70054e5b1e8ce5423a448ace6`, saved and pushed as `backup/post-hackathon-2026-11-14` before changes. A complete Git bundle was independently verified. See [recovery instructions](../ROLLBACK.md).

The presentation used by the team moved from `FINAL/v5/` to `Presentation/hackathon/`. Its 14 files are unchanged. The former entry URL forwards to the new location, including the requested slide. No presentation, app or game behavior was edited.

The root Pages entry opens the website. Current guides now lead to the used pitch, research and [Siemens preparation brief](../Documentation/siemens-follow-up.md). Earlier cleanup receipts join the existing archived presentations and experiments. Updated documents and website HTML retain their prior bytes under `Archive/Originals/post-hackathon-2026-11-14/`.

## Checks completed

| Check | Result |
| --- | --- |
| Original content retention | All 1,162 baseline files have byte-identical retained copies |
| Used presentation | Exact 14-file set and hashes preserved at the new location |
| Legacy phone and arcade | 57 protected runtime files unchanged |
| Existing QR kit | 30 protected files unchanged |
| Public compatibility copies | All 44 files match their canonical sources |
| Phone workers | Canonical and legacy cache namespaces remain separate |
| Current guides and website links | 409 local, repository and Pages targets audited; the pending receipt link is satisfied by this file |
| Existing regression suites | Detailed planner, phone state, offline behavior, C-CHOMP, PLUG PANIC and architecture simulator passed |
| Whitespace | `git diff --check` passed |

## Browser verification

Headless Firefox loaded the repository through a local HTTP server. The checks confirmed:

- The root opens `Website/` and retains the query and fragment.
- The website, technical guide and QR download page load through both canonical and `ALOHA/` routes, with their images and interactive website controls.
- Care Companion and its original QR route boot the English guided journey.
- `FINAL/v5/?s=17&auto=0` opens the relocated closing slide with both QR images; the canonical pitch URL opens the introduction and resolves its movie source.
- The legacy phone's `FINAL/v1/` link reaches the archived presentation.
- The technical guide has no horizontal overflow at a 390-pixel viewport.
- No application console errors or failed asset responses were observed. Browser favicon autodiscovery was excluded.

The closing slide and mobile technical guide were visually inspected. Browser reports and screenshots are retained outside the repository in the cleanup workstation's backup directory.

## Boundaries to retain

The actual hackathon deck contains scripted scheduling and robot scenes. Care Companion contains the executable planning rules. The website now makes that distinction explicit.

Some imported research links refer to files absent from the original source snapshot; these are recorded in its provenance guide. No substitute evidence was invented.

The old presentation entry URL is preserved; old direct `FINAL/v5/assets/` download paths are not forwarded. Use the canonical presentation directory for its assets.

This receipt records the local review. GitHub Pages deployment and live routes must also be checked after pushing the cleanup commit.
