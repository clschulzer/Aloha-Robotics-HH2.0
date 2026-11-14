# Aloha — let care keep moving

**[Visit the website](https://clschulzer.github.io/Aloha-Robotics-HH2.0/Website/)** · **[Technical guide](https://clschulzer.github.io/Aloha-Robotics-HH2.0/Website/technical.html)** · **[Three-QR kit](https://clschulzer.github.io/Aloha-Robotics-HH2.0/Website/share/)**

The public starting point for Aloha: the idea, interactive care loop, source evidence, technical documentation and demos. The repository’s root URL opens this website.

## Explore, play, try

| Experience | Current source | Existing QR destination |
| --- | --- | --- |
| Project and technical guide | `Website/` | `ALOHA/` |
| C-CHOMP and PLUG PANIC | `C-Arcade/` | `CARMAGOTCHI_APP/arcade/` |
| Care Companion platform | `Care-Companion/` | `CARMAGOTCHI_Web_Pitch/klickdummy-christian/` |

The existing QR payloads and artwork are unchanged. The website and detailed platform have static compatibility copies at their original URLs. The old phone/arcade deployment is preserved separately for installed apps.

[Download the three-card PNG](share/three-qr-cards.png), [vector sheet](share/three-qr-cards.svg), or [individual codes](share/README.md). These are standalone assets; the submitted presentation was not edited.

## Inside the website

| File | Role |
| --- | --- |
| `index.html` | Project introduction, interactive five-step care loop, build overview and source notebook. |
| `technical.html` | Technical guide linking the implementation and evidence; current rule engine and proposed integrations are identified separately. |
| `site/site.mjs`, `site/site.css` | Navigation, interaction and styling. |
| `site/palm.mjs` | Procedural WebGL palm: drag/keyboard rotation, wireframe, pause and reduced motion. No 3D library or downloaded model. |
| `site/palm-fallback.svg` | Fallback for unavailable or lost WebGL contexts. |
| `site/characters/`, `site/fonts/` | Local copies of team artwork and embedded fonts, with font licenses. |
| `share/` | QR images, designed cards, generator and independent decode receipt. |
| `research/` | Previous delivery QA and provenance. |

The sculptural approach takes inspiration from [TALOS](https://ibrahimify.github.io/talos/). The palm geometry, theme, text and website implementation are Aloha’s. Characters, Manrope and JetBrains Mono were reused from the team’s embedded app assets.

## Preview and maintain

From the repository root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/Website/`. No package installation, account, backend or build step is needed.

After changing this source, refresh the existing QR route and verify it:

```bash
python3 tools/sync-public-routes.py
python3 tools/sync-public-routes.py --check
```

The publisher copies only runtime assets and downloads to `ALOHA/`. See [repository maintenance](../tools/README.md) and [rollback](../ROLLBACK.md) for the protected paths.

This website sends no real hospital, patient, device or robot data. Its care loop illustrates the concept; the linked prototype contains the executable planning rules.
