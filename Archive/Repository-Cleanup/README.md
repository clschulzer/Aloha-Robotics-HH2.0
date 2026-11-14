# Repository organization history

These are historical receipts, preserved rather than presented as current maintenance instructions.

## First cleanup, before the event

[`pre-event/`](pre-event/) contains the original [review](pre-event/CLEANUP-REVIEW.md), [986-file manifest](pre-event/pre-cleanup-manifest.json) and [verification script](pre-event/verify-preservation.py) from the first organization at commit `d9f5765`.

Its baseline is [backup/pre-cleanup-2026-11-14](https://github.com/clschulzer/Aloha-Robotics-HH2.0/tree/backup/pre-cleanup-2026-11-14). The final-slide QR and spacing were explicitly changed afterward, before the team confirmed that the presentation had been used. The old receipt describes that earlier state and is not a current freeze check. To reproduce its result, check out the first cleanup commit and use its original `tools/` paths.

## Post-event organization

The current baseline is [backup/post-hackathon-2026-11-14](https://github.com/clschulzer/Aloha-Robotics-HH2.0/tree/backup/post-hackathon-2026-11-14), including the team's final slide refinements. Its manifest is [tools/preservation-manifest.json](../../tools/preservation-manifest.json).

Use the current [maintenance guide](../../tools/README.md) and [rollback instructions](../../ROLLBACK.md).
