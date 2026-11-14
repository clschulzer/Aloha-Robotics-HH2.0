"""Generate the public app QR with python-qrcode, then decode it with ZXing."""
from pathlib import Path
import hashlib
import json
import subprocess

import qrcode
import qrcode.image.svg
import zxingcpp
from PIL import Image, ImageDraw, ImageFont


URL = "https://clschulzer.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_APP/"
OUT = Path(__file__).resolve().parent
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

# A simple printable card. The actual QR keeps integer-sized modules, a white
# background, its complete quiet zone and no logo or other obstruction.
card_width = max(1200, png.width + 160)
card_height = png.height + 540
card = Image.new("RGB", (card_width, card_height), "#f6f3ec")
draw = ImageDraw.Draw(card)


def font(size, bold=False):
    pattern = "sans-serif:style=Bold" if bold else "sans-serif"
    filename = subprocess.check_output(
        ["fc-match", pattern, "-f", "%{file}"], text=True
    ).strip()
    return ImageFont.truetype(filename, size)


def centered(text, y, size, color="#15181c", bold=False):
    draw.text(
        (card_width / 2, y),
        text,
        font=font(size, bold),
        fill=color,
        anchor="mt",
    )


centered("C-ARMAGOTCHI", 60, 62, bold=True)
centered("Meet your team's C-arms.", 144, 30)
centered("SCAN TO MEET CIO", 232, 24, "#10a596", True)
card.paste(png, ((card_width - png.width) // 2, 294))
centered("Open the app. Give Cio a little attention.", png.height + 344, 25)
centered("ALOHA ROBOTICS", png.height + 404, 22, bold=True)
centered("Interactive demo · no download needed", png.height + 448, 20, "#5b636c")
card.save(OUT / "qr-card.png", optimize=True)

checks = []
for name, image in [
    ("qr-original", png),
    ("qr-320px", png.resize((320, 320), Image.Resampling.LANCZOS)),
    ("card-original", card),
    (
        "card-600px-wide",
        card.resize(
            (600, round(card.height * 600 / card.width)),
            Image.Resampling.LANCZOS,
        ),
    ),
]:
    decoded = zxingcpp.read_barcodes(image)
    texts = [result.text for result in decoded]
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
