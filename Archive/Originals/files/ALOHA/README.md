# ALOHA — Let care keep moving

**[Open the Aloha homepage](https://clschulzer.github.io/Aloha-Robotics-HH2.0/ALOHA/)** · **[Technical brief](technical.html)** · **[Three-QR download kit](share/)**

A public starting point for the team’s project: the idea, the code, the technical documentation and the demos. It lives in its own folder. The repository’s existing root redirect is unchanged.

## Three choices on the final frame

| QR | Destination | Why |
| --- | --- | --- |
| Explore | `ALOHA/` | A short introduction plus the technical brief and direct GitHub/source links. Repository and documentation share one QR. |
| Play | `CARMAGOTCHI_APP/arcade/` | The existing arcade. Its raw QR files are preserved byte for byte. |
| Try | `CARMAGOTCHI_Web_Pitch/klickdummy-christian/` | The published copy of Christian’s `challenges/04-invisible-connectivity/klickdummy/` source. |

These are standalone assets for the team to place in its chosen final slide. This delivery changes no presentation files. Keep the final frame still for scanning.

For PowerPoint or another cut, [download the 3840×2160 three-card PNG](share/three-qr-cards.png), the [vector sheet](share/three-qr-cards.svg), or the individual PNG/SVG codes in `share/`.

## Site

- `index.html`: introduction, interactive five-step care loop, build overview and source notebook.
- `technical.html`: evidence-backed technical guide with direct source links. Distinguishes the current browser rule engine from proposed integrations.
- `site/palm.mjs`: original procedural native-WebGL palm, with horizontal drag/keyboard rotation, technical wireframe, pause, reduced-motion and visibility handling. No 3D library, CDN or downloaded model.
- `site/palm-fallback.svg`: original fallback for unavailable or lost WebGL contexts.
- `share/`: QR codes, designed cards, generator and independent decode receipt.

The sculptural, spacious approach takes inspiration from [TALOS](https://ibrahimify.github.io/talos/). The theme, palm geometry, site copy and page implementation are original to Aloha. The Manrope and JetBrains Mono font files are reused from the existing phone app’s embedded font assets. Character art is reused from that app.

## Preview

From the repository root:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/ALOHA/`. No install, account, backend or build step. The technical brief links the actual prototype and rule tests. No real hospital, device or robot data is sent by this website.
