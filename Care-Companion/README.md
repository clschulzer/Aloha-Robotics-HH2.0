# C-ARMAGOTCHI Care Companion

**[Open the Care Companion](https://clschulzer.github.io/Aloha-Robotics-HH2.0/Care-Companion/)** · **[Phone companion](phone/)** · **[Project website](../Website/)** · **[Research and specifications](../Documentation/)**

The interactive prototype behind Aloha Robotics' mobile C-arm care concept. Explore the planning board, device records, human handovers and simulated robot missions in German or English, with night and paper themes.

This is Christian's detailed prototype, reorganized from `CARMAGOTCHI_Web_Pitch/klickdummy-christian/`. Its interface and behavior are preserved. The original public address remains a compatibility destination for existing QR codes and links:

<https://clschulzer.github.io/Aloha-Robotics-HH2.0/CARMAGOTCHI_Web_Pitch/klickdummy-christian/>

## Explore the prototype

- Follow a device from an outstanding maintenance need to a proposed update window.
- Review planned procedures, alarm blocks, replacement devices and robot bookings.
- Accept or decline a nearby task, prepare the device and confirm the start.
- Explore the companion, device file, robot view, control room, helpers and service concepts.
- Use the guided journeys to see the handovers between a person at the device and medical physics.

The [phone companion](phone/) is a separate mobile experience. Its state is independent of this detailed prototype.

## Run locally

From the repository root:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/Care-Companion/>. No package installation, account or backend is required. The detailed prototype can also be opened directly from `index.html`; its runtime files are local. It does not register a service worker.

Optional presentation parameters:

```text
?lang=en
?lang=de&tour=tief
?lang=en&tour=pitch&notes=0
```

These parameters are applied once and removed from the address. Reloading then preserves the stored demonstration state.

## Code and checks

| File | Responsibility |
| --- | --- |
| [index.html](index.html) | Page structure and styles |
| [app.js](app.js) | Screens, guided journeys and simulated interactions |
| [planner.js](planner.js) | Pure JavaScript window planning and start rules |
| [data.js](data.js) | Fictional devices, schedules and usage history |
| [i18n.js](i18n.js) | German and English strings |
| [planner.test.cjs](planner.test.cjs) | Planning and start-condition tests |
| [assets/carmagotchi/](assets/carmagotchi/) | The team's original character artwork |

Run the rule checks from the repository root:

```sh
node --test Care-Companion/planner.test.cjs
```

An optional browser journey runner requires Playwright and its browser:

```sh
node Care-Companion/tools/journeys.mjs /tmp/care-companion-journeys en
```

Browser progress uses the unchanged local-storage key `ia-klickdummy-v6`. Because the public paths share one origin, the original and reorganized detailed app can read the same saved demonstration state.

## Prototype scope

The browser interface and deterministic planning code run locally. All people, devices, procedures, notifications, contracts and telemetry in the demonstration are fictional. A screen confirmation is a local state change, not an authenticated clinical approval. No robot, hospital system, manufacturer service or medical device is connected.

The rule engine rejects proposed work during booked procedures or alarm blocks, checks the available history and applies preparation and recovery margins. Its start gate checks clearance, surroundings, use, alarm state, package status and the update type. The current replacement selection does not establish every aspect of substitute-device availability or suitability. Its historical-use measure is not a calibrated prediction of emergency demand.

The [scheduling specification](../Documentation/team-material-christian/challenge-4/entwicklung/spec-scheduling-ki.md) records these limits and the proposed evaluations. The [clinical IT and security design](../Documentation/team-material-christian/challenge-4/entwicklung/architektur-klinik-it-security.md) describes future integration work; it is not a claim of deployment or certification.

This is an independent hackathon prototype, not a medical device or a Siemens Healthineers product. Character provenance and usage notes are preserved in [the artwork README](assets/carmagotchi/README.md).
