#!/usr/bin/env python3
"""Read-only verification of the repository cleanup's preservation promises."""

import hashlib
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None


def main():
    manifest = json.loads((ROOT / "tools/pre-cleanup-manifest.json").read_text())
    errors = []
    rows = manifest["files"]
    for row in rows:
        if digest(ROOT / row["retained_original"]) != row["sha256"]:
            errors.append("Original missing or changed: " + row["original"])
        if not (ROOT / row["current"]).is_file():
            errors.append("Organized file missing: " + row["current"])

    frozen = [r for r in rows if r["original"].startswith("FINAL/v5/")]
    actual = {str(p.relative_to(ROOT)) for p in (ROOT / "FINAL/v5").rglob("*") if p.is_file()}
    expected = {r["original"] for r in frozen}
    if actual != expected:
        errors.append("Submitted deck file set changed")
    for row in frozen:
        if digest(ROOT / row["original"]) != row["sha256"]:
            errors.append("Submitted deck changed: " + row["original"])

    legacy = [r for r in rows if r["original"].startswith("CARMAGOTCHI_APP/")
              and r["original"] != "CARMAGOTCHI_APP/README.md"]
    for row in legacy:
        if digest(ROOT / row["original"]) != row["sha256"]:
            errors.append("Legacy app changed: " + row["original"])

    qr = json.loads((ROOT / "Website/share/destinations.json").read_text())
    for name, sha in qr["sha256"].items():
        for folder in ("Website/share", "ALOHA/share"):
            if digest(ROOT / folder / name) != sha:
                errors.append("Existing QR asset changed: " + folder + "/" + name)
    baseline_qr = next(r for r in rows if r["original"] == "ALOHA/share/destinations.json")
    if digest(ROOT / "Website/share/destinations.json") != baseline_qr["sha256"]:
        errors.append("Original QR manifest changed")

    nojekyll = next(r for r in rows if r["original"] == ".nojekyll")
    if digest(ROOT / ".nojekyll") != nojekyll["sha256"]:
        errors.append("GitHub Pages .nojekyll changed")

    spec = importlib.util.spec_from_file_location("sync_public_routes", ROOT / "tools/sync-public-routes.py")
    publisher = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(publisher)
    pairs = list(publisher.mirrors())
    for source, destination in pairs:
        if digest(source) != digest(destination):
            errors.append("Compatibility copy out of sync: " + str(destination.relative_to(ROOT)))

    # Cache isolation matters for returning visitors on the same GitHub Pages origin.
    phone_sw = (ROOT / "Care-Companion/phone/sw.js").read_text()
    if "aloha-care-companion-phone-" not in phone_sw:
        errors.append("New phone cache namespace missing")
    legacy_sw = (ROOT / "CARMAGOTCHI_APP/sw.js").read_text()
    if "aloha-care-companion-phone-" in legacy_sw:
        errors.append("New cache namespace leaked into legacy worker")

    if errors:
        raise SystemExit("Preservation FAILED:\n" + "\n".join(errors))

    print(f"PASS: all {len(rows)} original tracked files have byte-identical retained copies.")
    print(f"PASS: submitted deck's {len(frozen)} files are preserved at their exact original paths.")
    print(f"PASS: {len(legacy)} legacy phone/arcade files, 14 QR assets and Pages marker unchanged.")
    print(f"PASS: {len(pairs)} compatibility files match their canonical sources.")


if __name__ == "__main__":
    main()
