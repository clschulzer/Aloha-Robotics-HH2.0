#!/usr/bin/env python3
"""Read-only checks for preserved originals, public routes and the submitted deck."""

import hashlib
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "tools/preservation-manifest.json"
DECK = "Presentation/hackathon"
PHONE_CACHE_PREFIX = "aloha-care-companion-phone-"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None


def main():
    try:
        manifest = json.loads(MANIFEST.read_text())
        rows = manifest["files"]
        deck = manifest["final_presentation"]
        legacy = manifest["legacy_runtime"]
        qr_assets = manifest["qr_assets"]
    except (OSError, ValueError, KeyError) as exc:
        raise SystemExit(f"Preservation FAILED: cannot read {MANIFEST.relative_to(ROOT)}: {exc}")

    errors = []
    originals = {}
    for row in rows:
        original = row["original"]
        if original in originals:
            errors.append("Duplicate original in preservation manifest: " + original)
        originals[original] = row
        if digest(ROOT / row["retained_original"]) != row["sha256"]:
            errors.append(
                f"Original missing or changed: {original} "
                f"(retained at {row['retained_original']})"
            )
        if not (ROOT / row["current"]).is_file():
            errors.append("Organized file missing: " + row["current"])

    if not rows:
        errors.append("Original-file inventory is empty")

    # Keep the complete submitted tree tied to its original baseline hashes.
    if deck["directory"] != DECK:
        errors.append(f"Unexpected presentation directory: {deck['directory']} (expected {DECK})")
    deck_rows = deck["files"]
    expected = {row["path"]: row["sha256"] for row in deck_rows}
    baseline_deck = {
        path.removeprefix("FINAL/v5/"): row["sha256"]
        for path, row in originals.items()
        if path.startswith("FINAL/v5/")
    }
    if len(deck_rows) != 14 or len(expected) != 14 or expected != baseline_deck:
        errors.append("Submitted deck inventory must contain all 14 original files and hashes")
    actual = {
        path.relative_to(ROOT / DECK).as_posix()
        for path in (ROOT / DECK).rglob("*")
        if path.is_file()
    }
    for path in sorted(expected.keys() - actual):
        errors.append(f"Submitted deck file missing: {DECK}/{path}")
    for path in sorted(actual - expected.keys()):
        errors.append(f"Unexpected file in submitted deck: {DECK}/{path}")
    for path, sha in expected.items():
        if path in actual and digest(ROOT / DECK / path) != sha:
            errors.append(f"Submitted deck changed: {DECK}/{path}")

    for label, records in (("Legacy app", legacy), ("Existing QR asset", qr_assets)):
        if not records:
            errors.append(label + " inventory is empty")
        seen = set()
        for row in records:
            path = row["path"]
            if path in seen:
                errors.append(f"Duplicate {label.lower()} in preservation manifest: {path}")
            seen.add(path)
            if digest(ROOT / path) != row["sha256"]:
                errors.append(f"{label} missing or changed: {path}")

    # Verify both public copies of every QR image against the preserved QR receipt.
    qr_receipt = originals.get("ALOHA/share/destinations.json")
    if qr_receipt is None:
        errors.append("Original QR destination receipt is missing from the manifest")
    else:
        for folder in ("Website/share", "ALOHA/share"):
            if digest(ROOT / folder / "destinations.json") != qr_receipt["sha256"]:
                errors.append("Original QR destination receipt changed: " + folder)
        original_qr = json.loads((ROOT / qr_receipt["retained_original"]).read_text())
        qr_inventory = {row["path"]: row["sha256"] for row in qr_assets}
        for name, sha in original_qr["sha256"].items():
            for folder in ("Website/share", "ALOHA/share"):
                path = folder + "/" + name
                if qr_inventory.get(path) != sha:
                    errors.append("Original QR asset missing from protected inventory: " + path)
                if digest(ROOT / path) != sha:
                    errors.append("Original QR asset missing or changed: " + path)

    nojekyll = originals.get(".nojekyll")
    if nojekyll is None or digest(ROOT / ".nojekyll") != nojekyll["sha256"]:
        errors.append("GitHub Pages .nojekyll missing or changed")

    # Import the publisher without creating __pycache__ during this read-only check.
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location(
        "sync_public_routes", ROOT / "tools/sync-public-routes.py"
    )
    publisher = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(publisher)
    pairs = list(publisher.mirrors())
    for source, destination in pairs:
        source_sha = digest(source)
        if source_sha is None:
            errors.append("Compatibility source missing: " + str(source.relative_to(ROOT)))
        elif source_sha != digest(destination):
            errors.append("Compatibility copy out of sync: " + str(destination.relative_to(ROOT)))

    phone_sw = ROOT / "Care-Companion/phone/sw.js"
    legacy_sw = ROOT / "CARMAGOTCHI_APP/sw.js"
    if not phone_sw.is_file() or PHONE_CACHE_PREFIX not in phone_sw.read_text():
        errors.append("Care Companion phone cache namespace missing")
    if not legacy_sw.is_file():
        errors.append("Legacy phone service worker missing")
    elif PHONE_CACHE_PREFIX in legacy_sw.read_text():
        errors.append("Care Companion cache namespace leaked into legacy worker")

    if errors:
        raise SystemExit("Preservation FAILED:\n" + "\n".join("- " + error for error in errors))

    print(f"PASS: all {len(rows)} original files have byte-identical retained copies.")
    print(f"PASS: all 14 submitted presentation files are unchanged in {DECK}/.")
    print(f"PASS: {len(legacy)} protected legacy phone/arcade files are unchanged.")
    print(f"PASS: {len(qr_assets)} protected QR files and the Pages marker are unchanged.")
    print(f"PASS: {len(pairs)} compatibility files match their canonical sources.")
    print("PASS: canonical and legacy phone service workers keep separate cache namespaces.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, TypeError) as exc:
        raise SystemExit(f"Preservation FAILED: invalid or unreadable preservation data: {exc}")
