#!/usr/bin/env python3
"""Publish explicit compatibility copies without touching the submitted deck.

Run after editing Website or the detailed Care Companion prototype.
The legacy phone/arcade deployment is intentionally outside this tool.
"""

import argparse
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def mirrors():
    website = ROOT / "Website"
    for file in sorted(website.rglob("*")):
        relative = file.relative_to(website)
        if not file.is_file() or file.suffix in {".md", ".py", ".pyc"}:
            continue
        if relative.parts[0] == "research" or "__pycache__" in relative.parts:
            continue
        yield file, ROOT / "ALOHA" / relative

    companion = ROOT / "Care-Companion"
    for name in ("index.html", "app.js", "data.js", "i18n.js", "planner.js"):
        yield companion / name, ROOT / "CARMAGOTCHI_Web_Pitch/klickdummy-christian" / name
    for file in sorted((companion / "assets").rglob("*")):
        if file.is_file():
            yield file, ROOT / "CARMAGOTCHI_Web_Pitch/klickdummy-christian" / file.relative_to(companion)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check copies without changing any files")
    args = parser.parse_args()
    failures = []
    count = 0
    for source, destination in mirrors():
        if args.check:
            if not destination.is_file() or source.read_bytes() != destination.read_bytes():
                failures.append(str(destination.relative_to(ROOT)))
        else:
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)
        count += 1
    if failures:
        raise SystemExit("Compatibility copies need syncing:\n" + "\n".join(failures))
    print(f"{'Verified' if args.check else 'Published'} {count} compatibility files. FINAL/v5 and CARMAGOTCHI_APP untouched.")


if __name__ == "__main__":
    main()
