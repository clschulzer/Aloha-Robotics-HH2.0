# Recovery and preservation

## Current recovery point

The complete repository immediately before post-event organization is preserved at:

- **Tag:** [backup/post-hackathon-2026-11-14](https://github.com/clschulzer/Aloha-Robotics-HH2.0/tree/backup/post-hackathon-2026-11-14)
- **Commit:** [3b8065afbe38e6b70054e5b1e8ce5423a448ace6](https://github.com/clschulzer/Aloha-Robotics-HH2.0/commit/3b8065afbe38e6b70054e5b1e8ce5423a448ace6)
- **Presentation at that point:** `FINAL/v5/`, including the final QR and alignment changes used by the team.

That tag was pushed before reorganization. It must not be moved or reused. The same 14 presentation files now live unchanged in `Presentation/hackathon/`.

## Inspect or recover beside current work

From an existing clone:

```sh
git fetch origin --tags
git worktree add ../Aloha-after-hackathon backup/post-hackathon-2026-11-14
```

Serve that separate checkout with `python3 -m http.server 8001` to use its old paths. Current work stays in place.

To inspect a single historical file:

```sh
git show backup/post-hackathon-2026-11-14:FINAL/v5/demo.css
```

Recover files into a separate checkout first so later work is not accidentally overwritten.

## Undo this organization

The post-event organization is one commit named **`Organize post-hackathon repository and Siemens follow-up`**. Start with a clean working tree:

```sh
git status
git switch main
git pull --ff-only
git log --oneline --grep='Organize post-hackathon repository and Siemens follow-up'
```

Copy its hash, then:

```sh
git revert <cleanup-commit-hash>
git push origin main
```

This adds a normal recovery commit. No history rewriting or force push is required. If later team changes conflict, review them rather than discarding them. Wait for Pages publication and check the website, pitch and QR destinations.

## Verify the organized repository

```sh
python3 tools/verify-preservation.py
python3 tools/sync-public-routes.py --check
```

[The current manifest](tools/preservation-manifest.json) records all 1,162 files tracked before this cleanup and where their original bytes are retained. Files with updated links or guidance have historical copies under `Archive/Originals/post-hackathon-2026-11-14/`. Moved files retain their bytes at their new locations. The checks additionally protect the complete used deck, legacy app runtime, QR assets and generated compatibility copies.

This is a historical preservation record, not a baseline to regenerate to hide changes. Future development should preserve the used deck and use a separate presentation folder.

## Earlier checkpoint

[backup/pre-cleanup-2026-11-14](https://github.com/clschulzer/Aloha-Robotics-HH2.0/tree/backup/pre-cleanup-2026-11-14), commit `01b14a9`, preserves the repository before the first cleanup. It predates the team's later authorized QR and alignment edits. Its [manifest and verification receipt](Archive/Repository-Cleanup/README.md) remain unchanged in the archive; run those historical checks in that historical checkout, not against today's presentation.

## Independent local backups

On the cleanup workstation, outside Git:

- `/home/haunted/Backups/Aloha-Robotics-HH2.0/post-hackathon-2026-11-14.bundle` — verified complete Git bundle before this cleanup.
- `/home/haunted/Backups/Aloha-Robotics-HH2.0/post-hackathon-2026-11-14.manifest.json` — immutable file hashes for the same checkpoint.
- `/home/haunted/Backups/Aloha-Robotics-HH2.0/pre-cleanup-2026-11-14.bundle` — earlier complete repository backup.
- `/home/haunted/Backups/Aloha-Robotics-HH2.0/pre-cleanup-2026-11-14-local-artifacts.tar` — earlier ignored screenshots and generated files.

A bundle can be cloned with `git clone /path/to/backup.bundle Aloha-recovered`. The published tags are the recovery route available to every teammate.
