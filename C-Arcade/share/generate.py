"""Generate the Carecade QR assets and verify them independently with ZXing.

Requires python-qrcode, Pillow and zxing-cpp. Run with Python matching the
installed Pillow wheel. Output is deterministic apart from installed fonts.
"""
from pathlib import Path
import hashlib
import json
import subprocess

import qrcode
import qrcode.image.svg
import zxingcpp
from PIL import Image, ImageDraw, ImageFont


URL = "https://clschulzer.github.io/Aloha-Robotics-HH2.0/C-Arcade/"
OUT = Path(__file__).resolve().parent
INK = "#281b3b"
CREAM = "#f6f3ec"
LAVENDER = "#ded2f7"

qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=20,
    border=4,
)
qr.add_data(URL)
qr.make(fit=True)
png = qr.make_image(fill_color="#000000", back_color="#ffffff").convert("RGB")
png.save(OUT / "qr.png", optimize=True)
qr.make_image(image_factory=qrcode.image.svg.SvgPathFillImage).save(OUT / "qr.svg")

width = max(1300, png.width + 160)
height = png.height + 660
card = Image.new("RGB", (width, height), CREAM)
draw = ImageDraw.Draw(card)


def font(size, bold=False, mono=False):
    pattern = ("monospace" if mono else "sans-serif") + (":style=Bold" if bold else "")
    filename = subprocess.check_output(
        ["fc-match", pattern, "-f", "%{file}"], text=True
    ).strip()
    return ImageFont.truetype(filename, size)


def centered(text, y, size, bold=False, mono=False, color=INK):
    draw.text(
        (width / 2, y), text, font=font(size, bold, mono), fill=color, anchor="mt"
    )


# Toy-cartridge styling stays clear of the QR and its full quiet zone.
draw.rounded_rectangle((35, 35, width - 35, height - 35), radius=35, outline=INK, width=3)
draw.rounded_rectangle((width / 2 - 240, 66, width / 2 + 240, 112), radius=23, fill=LAVENDER)
centered("ALOHA ROBOTICS / AFTER HOURS", 78, 22, mono=True)
centered("THE CARECADE", 148, 80, bold=True)
centered("TWO GAMES. ONE HUNGRY C-ARM.", 260, 27, mono=True)
centered("SCAN. PLAY. PASS THE PHONE.", 321, 23, bold=True)

qr_top = 380
card.paste(png, ((width - png.width) // 2, qr_top))
centered("C-CHOMP  +  PLUG PANIC", qr_top + png.height + 30, 32, bold=True, mono=True)
centered("Care, then chaos.", qr_top + png.height + 87, 27)
centered("No coins. No download. Questionable enthusiasm.", qr_top + png.height + 137, 21)
centered("Fictional arcade games from Aloha Robotics.", qr_top + png.height + 183, 19, color="#766b80")
card.save(OUT / "qr-card.png", optimize=True)

checks = []
for name, image in [
    ("qr-original", png),
    ("qr-320px", png.resize((320, 320), Image.Resampling.LANCZOS)),
    ("card-original", card),
    ("card-600px-wide", card.resize((600, round(height * 600 / width)), Image.Resampling.LANCZOS)),
]:
    texts = [result.text for result in zxingcpp.read_barcodes(image)]
    assert texts == [URL], (name, texts)
    checks.append({"image": name, "decoded": texts[0], "pass": True})

receipt = {
    "url": URL,
    "generator": "python-qrcode 8.2",
    "renderer": "Pillow 13.0.0",
    "independent_decoder": "ZXing-C++ 3.1.1",
    "qr_version": qr.version,
    "error_correction": "H",
    "quiet_zone_modules": 4,
    "pixels_per_module": 20,
    "png_size": list(png.size),
    "card_size": list(card.size),
    "checks": checks,
    "files": {
        name: hashlib.sha256((OUT / name).read_bytes()).hexdigest()
        for name in ["qr.svg", "qr.png", "qr-card.png"]
    },
}
(OUT / "verification.json").write_text(json.dumps(receipt, indent=2) + "\n")
print(json.dumps(receipt, indent=2))
