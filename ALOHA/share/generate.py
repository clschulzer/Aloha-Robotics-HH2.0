"""Build three presentation QR sets, then verify their raster outputs with ZXing.

Requires qrcode, Pillow and zxing-cpp. The arcade QR is copied byte for byte
from the already published arcade. Pass the verified public clickdummy URL:
    python generate.py --app-url https://.../

The QR symbol is never stylized or overlaid. Card decoration stays outside it.
"""
from argparse import ArgumentParser
from pathlib import Path
import hashlib
import html
import json
import re
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET

import qrcode
import qrcode.image.svg
import zxingcpp
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent
REPO = OUT.parents[1]
CREAM = "#f6f3ec"
INK = "#263b39"
PLUM = "#281b3b"
TEAL = "#285e59"
CORAL = "#bc654d"
CARD_W, CARD_H = 1200, 1700
SHEET_W, SHEET_H = 3840, 2160
FONTS = {}


def font(size, bold=False, mono=False):
    key = (size, bold, mono)
    if key not in FONTS:
        family = ("monospace" if mono else "sans-serif") + (":style=Bold" if bold else "")
        path = subprocess.check_output(["fc-match", family, "-f", "%{file}"], text=True).strip()
        FONTS[key] = ImageFont.truetype(path, size)
    return FONTS[key]


def text(draw, label, x, y, size, color=INK, bold=False, mono=False, centered=False):
    draw.text((x, y), label, font=font(size, bold, mono), fill=color,
              anchor="mt" if centered else "lt")


def svg_text(label, x, y, size, color=INK, bold=False, mono=False, centered=False):
    return (
        f'<text x="{x}" y="{y}" dominant-baseline="text-before-edge" '
        f'text-anchor="{"middle" if centered else "start"}" '
        f'font-family="{"DejaVu Sans Mono,monospace" if mono else "DejaVu Sans,sans-serif"}" '
        f'font-size="{size}" font-weight="{"700" if bold else "400"}" fill="{color}">'
        f'{html.escape(label)}</text>'
    )


def qr_inner(svg_bytes, x, y, size):
    source = svg_bytes.decode()
    view_box = re.search(r'viewBox="([^"]+)"', source).group(1)
    inner = re.search(r"<svg\b[^>]*>(.*)</svg>", source, flags=re.S).group(1)
    return f'<svg x="{x}" y="{y}" width="{size}" height="{size}" viewBox="{view_box}">{inner}</svg>'


def make_qr(item):
    stem = item["id"]
    if stem == "play":
        arcade = REPO / "CARMAGOTCHI_APP/arcade/share"
        for extension in ("png", "svg"):
            shutil.copyfile(arcade / f"qr.{extension}", OUT / f"{stem}-qr.{extension}")
        item["reused_from"] = "CARMAGOTCHI_APP/arcade/share/qr"
        item["qr_version"] = json.loads((arcade / "verification.json").read_text())["qr_version"]
        return Image.open(OUT / f"{stem}-qr.png").convert("RGB")
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H,
                       box_size=20, border=4)
    qr.add_data(item["url"])
    qr.make(fit=True)
    png = qr.make_image(fill_color=item["ink"], back_color="#ffffff").convert("RGB")
    png.save(OUT / f"{stem}-qr.png", optimize=True)
    svg = qr.make_image(image_factory=qrcode.image.svg.SvgPathFillImage).to_string()
    root = ET.fromstring(svg)
    for path in root.iter("{http://www.w3.org/2000/svg}path"):
        path.set("fill", item["ink"])
    ET.register_namespace("", "http://www.w3.org/2000/svg")
    (OUT / f"{stem}-qr.svg").write_bytes(ET.tostring(root, encoding="utf-8", xml_declaration=True))
    item["qr_version"] = qr.version
    return png


def make_card(item, qr_image):
    ink, tint, accent = item["ink"], item["tint"], item["accent"]
    canvas = Image.new("RGB", (CARD_W, CARD_H), CREAM)
    draw = ImageDraw.Draw(canvas)
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{CARD_W}" height="{CARD_H}" viewBox="0 0 {CARD_W} {CARD_H}">',
        f'<rect width="{CARD_W}" height="{CARD_H}" fill="{CREAM}"/>',
        f'<rect x="15" y="15" width="1170" height="1670" rx="44" fill="{tint}" stroke="{ink}" stroke-width="2"/>',
    ]
    draw.rounded_rectangle((15, 15, 1185, 1685), radius=44, fill=tint, outline=ink, width=2)
    draw.line((75, 112, 1125, 112), fill=ink, width=1)
    svg.append(f'<path d="M75 112H1125" fill="none" stroke="{ink}" opacity=".4"/>')
    text(draw, item["eyebrow"], 76, 61, 22, ink, mono=True)
    svg.append(svg_text(item["eyebrow"], 76, 61, 22, ink, mono=True))
    text(draw, item["tag"], 1080, 63, 20, ink, mono=True, centered=True)
    svg.append(svg_text(item["tag"], 1080, 63, 20, ink, mono=True, centered=True))
    text(draw, item["title"], 75, 157, 76, ink, bold=True)
    svg.append(svg_text(item["title"], 75, 157, 76, ink, bold=True))
    for n, line in enumerate(item["description"]):
        text(draw, line, 78, 265 + n * 44, 29, ink)
        svg.append(svg_text(line, 78, 265 + n * 44, 29, ink))
    # The full QR square includes a four-module white quiet zone.
    qr_x, qr_y, qr_size = 100, 420, 1000
    draw.rounded_rectangle((76, 396, 1124, 1444), radius=22, fill="#ffffff")
    svg.append('<rect x="76" y="396" width="1048" height="1048" rx="22" fill="#fff"/>')
    canvas.paste(qr_image.resize((qr_size, qr_size), Image.Resampling.LANCZOS), (qr_x, qr_y))
    svg.append(qr_inner((OUT / f'{item["id"]}-qr.svg').read_bytes(), qr_x, qr_y, qr_size))
    # Tech crop ticks and cartridge corners sit beyond the white QR square.
    if item["id"] == "explore":
        corners = [(63, 383, 1, 1), (1137, 383, -1, 1), (63, 1457, 1, -1), (1137, 1457, -1, -1)]
        for x, y, dx, dy in corners:
            draw.line([(x, y + dy * 27), (x, y), (x + dx * 27, y)], fill=accent, width=4)
            svg.append(f'<path d="M{x} {y+dy*27}V{y}H{x+dx*27}" fill="none" stroke="{accent}" stroke-width="4"/>')
    else:
        for x in (50, 1150):
            draw.ellipse((x - 5, 370, x + 5, 380), fill=accent)
            svg.append(f'<circle cx="{x}" cy="375" r="5" fill="{accent}"/>')
    text(draw, item["cta"], 600, 1490, 29, ink, bold=True, centered=True)
    svg.append(svg_text(item["cta"], 600, 1490, 29, ink, bold=True, centered=True))
    text(draw, item["footer"], 600, 1550, 20, ink, mono=True, centered=True)
    svg.append(svg_text(item["footer"], 600, 1550, 20, ink, mono=True, centered=True))
    draw.line((470, 1623, 730, 1623), fill=accent, width=4)
    svg.append(f'<path d="M470 1623H730" stroke="{accent}" stroke-width="4"/>')
    svg.append("</svg>")
    path = OUT / f'{item["id"]}-card'
    canvas.save(path.with_suffix(".png"), optimize=True)
    path.with_suffix(".svg").write_text("\n".join(svg) + "\n")
    return canvas


def make_sheet(items, cards):
    canvas = Image.new("RGB", (SHEET_W, SHEET_H), CREAM)
    draw = ImageDraw.Draw(canvas)
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{SHEET_W}" height="{SHEET_H}" viewBox="0 0 {SHEET_W} {SHEET_H}">',
        f'<rect width="{SHEET_W}" height="{SHEET_H}" fill="{CREAM}"/>',
    ]
    text(draw, "ALOHA ROBOTICS / YOUR NEXT MOVE", 170, 85, 27, TEAL, mono=True)
    svg.append(svg_text("ALOHA ROBOTICS / YOUR NEXT MOVE", 170, 85, 27, TEAL, mono=True))
    text(draw, "Take Aloha with you.", 160, 151, 100, INK, bold=True)
    svg.append(svg_text("Take Aloha with you.", 160, 151, 100, INK, bold=True))
    text(draw, "Explore the system. Play the chaos. Try the app.", 169, 294, 35, "#647470")
    svg.append(svg_text("Explore the system. Play the chaos. Try the app.", 169, 294, 35, "#647470"))
    for i, (item, card) in enumerate(zip(items, cards)):
        x, y, width, height = 160 + i * 1180, 420, 1080, 1530
        canvas.paste(card.resize((width, height), Image.Resampling.LANCZOS), (x, y))
        source = (OUT / f'{item["id"]}-card.svg').read_text()
        inner = re.search(r"<svg\b[^>]*>(.*)</svg>", source, flags=re.S).group(1)
        svg.append(f'<svg x="{x}" y="{y}" width="{width}" height="{height}" viewBox="0 0 {CARD_W} {CARD_H}">{inner}</svg>')
    text(draw, "Scan what you’re curious about.", 1920, 2011, 29, TEAL, centered=True)
    svg.append(svg_text("Scan what you’re curious about.", 1920, 2011, 29, TEAL, centered=True))
    text(draw, "Concept demos and fictional game scenarios · No account or download needed", 1920, 2060, 21, "#647470", centered=True)
    svg.append(svg_text("Concept demos and fictional game scenarios · No account or download needed", 1920, 2060, 21, "#647470", centered=True))
    svg.append("</svg>")
    canvas.save(OUT / "three-qr-cards.png", optimize=True)
    (OUT / "three-qr-cards.svg").write_text("\n".join(svg) + "\n")
    return canvas


def decode(image, expected, name):
    found = sorted(result.text for result in zxingcpp.read_barcodes(image))
    assert found == sorted(expected), (name, found, expected)
    return {"image": name, "decoded": found, "pass": True}


def main():
    parser = ArgumentParser()
    parser.add_argument("--app-url", required=True, help="Canonical, independently verified public clickdummy URL")
    args = parser.parse_args()
    if not args.app_url.startswith("https://"):
        raise ValueError("The public app URL must use HTTPS.")
    items = [
        {"id": "explore", "title": "Explore Aloha.", "eyebrow": "01 / INSIDE THE SYSTEM", "tag": "BUILD",
         "description": ["The thinking. The architecture.", "The code behind the care."],
         "cta": "Technical deep dive + GitHub", "footer": "LOOK UNDER THE HOOD",
         "url": "https://clschulzer.github.io/Aloha-Robotics-HH2.0/ALOHA/",
         "ink": TEAL, "tint": "#e3ece5", "accent": CORAL},
        {"id": "play", "title": "Play the chaos.", "eyebrow": "02 / THE AFTER-HOURS ARCADE", "tag": "PLAY",
         "description": ["C-CHOMP. PLUG PANIC.", "A very unserious little care break."],
         "cta": "Two games. One hungry C-arm.", "footer": "INSERT ABSOLUTELY NO COINS",
         "url": "https://clschulzer.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_APP/arcade/",
         "ink": PLUM, "tint": "#e5dbf2", "accent": "#9975bb"},
        {"id": "app", "title": "Try the app.", "eyebrow": "03 / THE HANDS-ON EXPERIENCE", "tag": "TRY",
         "description": ["Follow a C-arm’s care journey.", "Make the next move yourself."],
         "cta": "Open the interactive clickdummy", "footer": "THE IDEA, AT YOUR FINGERTIPS",
         "url": args.app_url, "ink": TEAL, "tint": "#f1e5da", "accent": CORAL},
    ]
    qr_images = [make_qr(item) for item in items]
    cards = [make_card(item, image) for item, image in zip(items, qr_images)]
    sheet = make_sheet(items, cards)
    checks = []
    for item, image, card in zip(items, qr_images, cards):
        expected = [item["url"]]
        checks.append(decode(image, expected, f'{item["id"]}-qr-original'))
        for size in (320, 240, 160):
            checks.append(decode(image.resize((size, size), Image.Resampling.LANCZOS), expected, f'{item["id"]}-qr-{size}px'))
        checks.append(decode(card, expected, f'{item["id"]}-card-original'))
        checks.append(decode(card.resize((480, 680), Image.Resampling.LANCZOS), expected, f'{item["id"]}-card-480px'))
    expected = [item["url"] for item in items]
    checks.append(decode(sheet, expected, "three-card-sheet-original"))
    checks.append(decode(sheet.resize((1920, 1080), Image.Resampling.LANCZOS), expected, "three-card-sheet-1920px"))
    checks.append(decode(sheet.resize((1280, 720), Image.Resampling.LANCZOS), expected, "three-card-sheet-1280px"))
    with tempfile.TemporaryDirectory(prefix="aloha-qr-svg-") as tmp:
        for item in items:
            source = OUT / f'{item["id"]}-qr.svg'
            for size in (320, 240, 160):
                target = Path(tmp) / f'{item["id"]}-{size}.png'
                subprocess.run(["magick", "-background", "white", str(source), "-resize", f"{size}x{size}", str(target)], check=True)
                checks.append(decode(Image.open(target).convert("RGB"), [item["url"]], f'{item["id"]}-svg-rendered-{size}px'))
        target = Path(tmp) / "three-qr-cards.png"
        subprocess.run(["magick", "-background", "white", str(OUT / "three-qr-cards.svg"), "-resize", "1920x1080", str(target)], check=True)
        checks.append(decode(Image.open(target).convert("RGB"), expected, "three-card-svg-rendered-1920px"))
    for item in items:
        item["files"] = {format_: f'{item["id"]}-{format_}' for format_ in ("qr.png", "qr.svg", "card.png", "card.svg")}
        item["error_correction"] = "H"
        item["quiet_zone_modules"] = 4
    manifest = {
        "title": "Aloha final QR destinations",
        "generator": "python-qrcode 8.2", "renderer": "Pillow 13.0.0",
        "independent_decoder": "ZXing-C++ 3.1.1",
        "card_size": [CARD_W, CARD_H], "sheet_size": [SHEET_W, SHEET_H],
        "destinations": items, "combined": {"png": "three-qr-cards.png", "svg": "three-qr-cards.svg"},
        "checks": checks,
        "sha256": {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                   for p in sorted(OUT.iterdir()) if p.suffix in (".png", ".svg")},
    }
    (OUT / "destinations.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"result": "passed", "checks": len(checks), "urls": expected}, indent=2))


if __name__ == "__main__":
    main()
