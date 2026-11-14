# FINAL v2

FINAL v1 plus Marc's notes from 14 Nov, 10:48. See [`../README.md`](../README.md) for where each scene comes from, and [`SCRIPT.md`](SCRIPT.md) for the words and timing.

What changed against v1:

1. **The Tamagotchi is back.** The orange toy drops in, its LCD blinks, and the camera zooms into the screen until the slide grows out of it (the transition from `OPUS/v2`, ported as is). The screen opens into the phone.
2. **The top bar is back.** C-ARMAGOTCHI by Aloha Robotics, with the three pillars lit per act (`OPUS/christian`).
3. **The phones look like real phones.** A Pro Max-sized screen (430 × 932 pt), Dynamic Island, iOS status bar, home indicator and side buttons. The app is styled after `CARMAGOTCHI_APP` (header, mood tag, data tiles, tab bar). Each new mood arrives as a notification that drops out of the island with Cio's own sound. Lena's phone is asleep and wakes up for the request, a tap opens it as a sheet (Christian's klickdummy). The three-step decision pushes screen by screen, and the four checks tick one by one. In the loop, the lock screen wakes up twice.
4. **It ends on the booked room**, with a QR code to the repository, like TALOS. The logo and "Any technical questions?" slide is gone.

Run `python3 OPUS/serve.py 8000` from the repo root, then open http://localhost:8000/FINAL/finalV2/ (projector, press F) and `presenter.html` (presenter view). The presenter channel is `aloha-final-v2`, so v1 and v2 can be open at the same time.

The QR code (`assets/qr-github.svg`) encodes https://github.com/clschulzer/Aloha-Robotics-HH2.0 and was checked by decoding the rendered slide. To regenerate it: `python3 tools/qr.py` (needs `pip install qrcode`).
