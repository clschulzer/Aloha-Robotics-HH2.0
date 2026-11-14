# Aloha QR assets

Three public destinations, ready for the final slide, PowerPoint or printing.

| Destination | Raw QR | Designed card |
| --- | --- | --- |
| Explore Aloha — technical guide + GitHub | [SVG](explore-qr.svg) · [PNG](explore-qr.png) | [SVG](explore-card.svg) · [PNG](explore-card.png) |
| Play the arcade | [SVG](play-qr.svg) · [PNG](play-qr.png) | [SVG](play-card.svg) · [PNG](play-card.png) |
| Try Christian’s clickdummy | [SVG](app-qr.svg) · [PNG](app-qr.png) | [SVG](app-card.svg) · [PNG](app-card.png) |

The full three-card sheet is available as [SVG](three-qr-cards.svg) and [3840 × 2160 PNG](three-qr-cards.png). Individual cards are 1200 × 1700. Use the raw SVGs when arranging your own slide.

Exact destinations:

- Explore: <https://clschulzer.github.io/Aloha-Robotics-HH2.0/ALOHA/>
- Arcade: <https://clschulzer.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_APP/arcade/>
- Clickdummy: <https://clschulzer.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_Web_Pitch/klickdummy-christian/>

The clickdummy is the publicly published mirror of Christian’s source folder `challenges/04-invisible-connectivity/klickdummy/`, as documented in its own repository README. Its public URL was verified with HTTP 200 before creating the QR.

All symbols have a white quiet zone and high error correction. The arcade raw QR files are unchanged, byte-for-byte copies of `CARMAGOTCHI_APP/arcade/share/qr.png` and `qr.svg`.

## Validation

[destinations.json](destinations.json) records exact URLs, QR versions, file hashes and all 31 successful independent ZXing checks:

- Raw PNG symbols at original size, 320, 240 and 160 pixels.
- Raw SVG symbols independently rasterized at 320, 240 and 160 pixels.
- Individual cards at original size and 480 pixels wide.
- The combined PNG at 3840, 1920 and 1280 pixels wide.
- The combined SVG independently rasterized at 1920 pixels wide.

These are digital image checks. For a live presentation, test a phone scan from the actual audience position; projection, viewing angle and distance also affect scanning. Keep the white border visible and avoid placing logos or decoration over the symbols.

## Regenerate

Requires Python 3.12+, `qrcode==8.2`, `Pillow==13.0.0`, `zxing-cpp==3.1.1`, ImageMagick (`magick`) and Fontconfig (`fc-match`). DejaVu Sans is used for the cards.

```bash
python generate.py --app-url 'https://clschulzer.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_Web_Pitch/klickdummy-christian/'
```

Run from this folder or pass the full path to `generate.py`. The generator resolves the repository and writes only its own assets in this folder. It stops if any independent scan check fails.
