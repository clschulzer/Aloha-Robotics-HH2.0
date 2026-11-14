# Safe rollback

The complete repository before cleanup is preserved at:

- **Tag:** [`backup/pre-cleanup-2026-11-14`](https://github.com/clschulzer/Aloha-Robotics-HH2.0/tree/backup/pre-cleanup-2026-11-14)
- **Commit:** [`01b14a9047fe95e192cf013cdbb48d77ddd57517`](https://github.com/clschulzer/Aloha-Robotics-HH2.0/commit/01b14a9047fe95e192cf013cdbb48d77ddd57517)
- **Submitted deck:** `FINAL/v5/`, all 14 files protected by a byte-for-byte manifest.

The backup tag was pushed and verified before files were reorganized. It must not be moved or reused.

## Inspect the old state alongside the new one

From an existing clone:

```bash
git fetch origin --tags
git worktree add ../Aloha-before-cleanup backup/pre-cleanup-2026-11-14
```

This creates a separate historical checkout. Your current branch and files stay in place. Serve that checkout with `python3 -m http.server 8001` to inspect the old paths.

## Undo the cleanup on GitHub

The organization is delivered as one commit named **`Organize Aloha with preserved presentation and rollback archive`**.

Start with a clean working tree and pull the latest team changes:

```bash
git status
git switch main
git pull --ff-only
git log --oneline --all --grep='Organize Aloha with preserved presentation and rollback archive'
```

Copy that cleanup commit’s hash, then:

```bash
git revert <cleanup-commit-hash>
git push origin main
```

Revert creates a normal, reviewable commit restoring the previous layout; no history rewriting or force push is needed. If teammates have changed affected files afterward, review the conflicts rather than discarding their work. Wait for GitHub Pages deployment, then verify the submitted URL and the three QR routes.

## Restore only a specific file

Review the historical file first:

```bash
git show backup/pre-cleanup-2026-11-14:path/to/file
```

Use the manifest’s original path when a file has moved. Recover into a separate checkout or temporary path first so current work is not overwritten accidentally.

## Independent backups on the cleanup workstation

These backups are outside Git and were not published:

- `/home/haunted/Backups/Aloha-Robotics-HH2.0/pre-cleanup-2026-11-14.bundle` — verified complete Git bundle.
- `/home/haunted/Backups/Aloha-Robotics-HH2.0/pre-cleanup-2026-11-14-local-artifacts.tar` — ignored local screenshots and other generated artifacts.

The Git bundle can be cloned with `git clone /path/to/pre-cleanup-2026-11-14.bundle Aloha-recovered`. It provides an independent recovery route if the remote is unavailable.

## Verify preservation

```bash
python3 tools/verify-preservation.py
python3 tools/sync-public-routes.py --check
```

Every original tracked file has a retained byte-identical copy. Existing QR payloads are unchanged, and the entire submitted presentation stays at **[its exact submitted URL](https://clschulzer.github.io/Aloha-Robotics-HH2.0/FINAL/v5/?s=1)**.
