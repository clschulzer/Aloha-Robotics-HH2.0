# Architecture brief: how a parked C-arm gets its update

**Team Aloha Robotics · Healthcare Hackathon Bavaria 2026 · Siemens Healthineers challenge 04 "Invisible Connectivity"**

Originally created in `breif/`, this comparison now lives in `Documentation/architecture-options/`. Source links and commands below use the organized repository paths. The architecture proposals, synthetic assumptions, saved results, and copied model code retain their original meaning.

This folder answers Christian's ask:

> "can you give it the prompt to spin out architecture with a briefing and diagrams for each and give pros and cons." / "also please maybe tell them to one shot each solution"

| He asked for | Where it is |
|---|---|
| The prompt | [`PROMPT.md`](PROMPT.md): single-agent, spin-out and red-team versions |
| Architecture with a briefing | This page, plus the shared [`00-reference-architecture.md`](00-reference-architecture.md) |
| Diagrams for each | Every option has an architecture diagram and a sequence diagram (Mermaid, renders on GitHub). The visual page is [`index.html`](index.html) |
| Pros and cons | Every option brief, plus the matrix below |
| One shot each solution | Each option was **built once as a policy in the simulator** ([`sim/`](sim/)) and run on the same synthetic hospital. Every brief also ends with a **one-shot build prompt** for a clickable prototype |

## The answer in one paragraph

**Recommend F: one brain, many hands.** The bottleneck Siemens described is a *window* plus *one responsible human*. That's the brain: our rule core and window finder, software only, working on the installed base from day one. The hand is pluggable and comes in stages:

- **Stage 1** is people plus a ≈ €600 data companion on every C-arm. On a 12-C-arm site it patches **91 % by the deadline for about €7k** of hardware.
- **Stage 2** adds one KettyBot where people can't power the window, at nights or with no socket: **92 %, and 91 % even with thin evening staff**.

Bays come with renovations, and built-in hands come with Siemens' next generation. The same brain plans them all. The pilot starts with no robot, which is exactly Christian's ask: *1 hospital · 4–6 C-arms · 8 weeks*.

## The question

How does a parked, switched-off mobile C-arm get about 120 undisturbed minutes of **power**, the **package**, a **switch-on** and one human **"start"**? It has to happen without patient data, without touching the OR schedule, and without a new way into the hospital network.

| What Siemens told us (transcript 04 unless noted) | What it rules out |
|---|---|
| Parked switched off in a hallway, often no socket. The UPS only covers a safe shutdown | "Just leave it on" |
| At most ~1 h from plug-in to incision, and no background work during surgery | Installing before or during a case |
| ~120 min per update, and the time goes into the work, not the CPU | Squeezing it into short gaps |
| A human must press start, ~99 % of security patches are remote-capable, three roles could press it and none feels responsible | Fully automatic starts, and "we'll send an email" |
| ~2 % end dead on arrival, for example unplugged mid-update | Fire and pray |
| No Wi-Fi in Erlangen's ORs. Downloads come in parts | Relying on the OR network |
| Their favourite idea: a companion device beside the C-arm with a wired link | (The idea we build on) |

## Six architectures at a glance

| | Option | The hand | Power without a socket | Package on board | Guards the install | Hardware, 12 C-arms | Simulator: patched by the deadline | Verdict |
|---|---|---|---|---|---|---|---|---|
| [A](01-people.md) | **People-powered** | One named person at the right minute: stay plugged, plug in, push | Only by pushing it | Only if it had a network | Phone only | €0 | 45 % | The first stage, not the whole answer |
| [B](02-bays.md) | **Smart parking bays** | Bays with a socket, wired port, sensor and light | Yes, in the bay | Yes | Bay light | ≈ €30k | 91 % | For new builds and renovations |
| [C](03-companion.md) | **Companion** | C1 data box, C2 plus a 2 kWh battery | C2 only (~20 kg) | Yes | Display | C1 ≈ €7k, C2 ≈ €54k | 92 % (C2) | C1 everywhere, C2 for lone devices |
| [D](04-robot.md) | **Robot courier** | KettyBot brings power and the package, guards, takes logs home | Yes, one install per trip | Yes | Robot screen | ≈ €42k | 92 % (68 % at 30 C-arms) | The scale hand, and the demo |
| [E](05-built-in.md) | **Built-in, next gen** | Service controller, A/B slots, dock inside the C-arm | Yes | Yes | Display | In the device price | 12 % today, 92 % if all next gen | Siemens' roadmap |
| [F](06-hybrid.md) | **One brain, many hands** | Router picks the cheapest hand that works, per window | Via robot or companion | Via data companion | Display or robot | ≈ €7k, then ≈ €49k | 91 % then 92 % | **Recommended** |

## Comparison matrix

Unweighted. ●●●●● is best for the hospital and Siemens. The full reasoning is in each brief.

| Criterion | A People | B Bays | C Companion (C2) | D Robot | E Built-in | F Hybrid |
|---|---|---|---|---|---|---|
| Works on today's C-arms unchanged | ●●●●● | ●●●●○ | ●●●●○ | ●●●○○ | ●○○○○ | ●●●●● |
| Power without a socket | ●○○○○ | ●●●●○ | ●●●●● | ●●●●○ | ●●●●● | ●●●●○ |
| Data without OR Wi-Fi | ●●○○○ | ●●●●● | ●●●●● | ●●●●● | ●●●○○ | ●●●●● |
| Guards the install | ●●○○○ | ●●●○○ | ●●●●○ | ●●●●● | ●●●●○ | ●●●●○ |
| Low clinic effort | ●●○○○ | ●●●●○ | ●●●●○ | ●●●●○ | ●●●●● | ●●●○○ |
| Hospital IT acceptance | ●●●●● | ●●●○○ | ●●●○○ | ●●○○○ | ●●○○○ | ●●●●○ |
| Light regulatory load | ●●●●● | ●●●●○ | ●●○○○ | ●●○○○ | ●●●○○ | ●●●○○ |
| Time to a pilot | ●●●●● | ●●○○○ | ●●●○○ | ●●●○○ | ●○○○○ | ●●●●● |
| Low hardware cost | ●●●●● | ●●●○○ | ●●○○○ | ●●●○○ | ●●●●○ | ●●●●○ |
| Scales to many sites | ●●●○○ | ●●○○○ | ●●●●○ | ●●●○○ | ●●●●● | ●●●●● |
| **Total of 50** | **35** | **34** | **36** | **34** | **33** | **42** |
| *Extra: simple to build, certify and run* | ●●●●● | ●●●●○ | ●●●○○ | ●●○○○ | ●●●●○ | ●●○○○ |

F scores highest because it only uses each hand where that hand is strong. Its real cost is complexity (the extra row): more hands to integrate and support. That's why it ships one hand at a time.

## What the simulator says

The simulator is in [`sim/`](sim/). It uses the same synthetic hospital for every option: 12 C-arms, four weeks, one security patch for the whole fleet, and a 14-day deadline. The brain is the team's code, copied unchanged and hash-checked (`planner.js`, `golden.js`). Only the hand differs. There are 200 runs per option. All numbers are in [`sim/results/RESULTS.md`](sim/results/RESULTS.md).

| Option | Patched by the deadline | Median days to 90 % | Clinic minutes per patched C-arm | Robot missions | Hardware |
|---|---|---|---|---|---|
| Today (illustrative) | 9 % | not reached | 1.4 | n/a | €0 |
| A People | 45 % | not reached | 6.2 | n/a | €0 |
| B Bays | 91 % | 9 | 2.8 | n/a | €30k |
| C Companion (C2) | 92 % | 8 | 3.2 | n/a | €54k |
| D Robot | 92 % | 8 | 3.2 | 14.8 | €42k |
| E Built-in (10 % next gen) | 12 % | not reached | 1.2 | n/a | €0 |
| **F1 People + data companion** | **91 %** | 10 | 6.0 | n/a | **€7k** |
| **F2 F1 + one robot** | **92 %** | 8 | 3.5 | 6.3 | €49k |

These scenarios change the answer:

| Scenario | Best buy (cheapest within 3 points of the top) |
|---|---|
| Base case | **F1** |
| Siemens confirms remote switch-on | F1. B, C and D drop from ~3 to ~1 clinic minute per update |
| Install shrinks to 30 min (A/B slots) | F1 at 98 %. Everything with a hand reaches ~100 % |
| Every C-arm gets the package while in use | **A**: people alone, €0, 91 % |
| No socket near any parking spot | B (bays bring the socket). F2 and D keep 92 %, F1 falls to 84 % |
| Thin evening and night staff | D. F2 91 %, F1 falls to 70 % |
| Big site: 30 C-arms, up to 6 a night | F1. **One robot alone falls to 68 %** |
| Whole fleet is next gen | E |

**Five things it taught us:**

1. **With a brain, any hand that brings power *and* data reaches ~91–92 %.** What's left is the shock-room C-arm. The scorer almost never finds it a window above 80 % undisturbed, so the rules refuse to gamble with it, and medical physics plans a stand-in instead.
2. **Data limits people, not willingness.** People alone reach 45 % because half the C-arms never have the package on board. Fix data cheaply and the same people reach 91 %.
3. **Remote switch-on is worth more than any robot spec.** "Nobody to switch it on" is the top reason bays, companions and robots lose windows. This is a question for Siemens, not a hardware purchase.
4. **One robot doesn't scale on its own.** It manages about 2 installs a night. Hands that live with the device (bays, companions) and people do.
5. **The rule "at most 2 per night" is the speed limit,** not the hardware. Nothing patches 11 C-arms faster than 6 nights, and that's by design (staged rollout, always a backup).

The simulator is a thinking tool. Nearly every input is an assumption, it's all in one place (`PARAMS` in `sim/model.js`), and the page lets you change it live. **Don't put simulator numbers on a slide.** Use them in Q&A, and say "in our synthetic model".

## Recommendation: F, in stages

1. **Pilot (8 weeks, no robot).** Brain, people, one signed tap, audit trail, data companions on two C-arms, and KettyBot on the training-centre C-arm to measure draw, docking and mission success. This is Christian's three asks: SRS status data, a C-arm to test, a pilot.
2. **Stage 1.** Data companion on every C-arm, so the package and logs are always on board, with a display that guards the install.
3. **Stage 2.** One robot, or a power companion, only for the C-arms the pilot showed are never powered when the window comes.
4. **Later.** Bays in renovations. Built-in hands in the next generation. Same brain, same hand contract.

### What would change our mind

| If we learn | Then |
|---|---|
| Installs can shrink to ~30 min | People plus data covers nearly everything, and the robot becomes optional |
| Every OR already has a network link | People alone, no hardware |
| An update draws ~700 W and there's no lighter service mode | Battery hands get heavy, and robots and power companions shrink to edge cases |
| Siemens supports remote switch-on | Robots and companions need no person at all, so stage 2 gets much cheaper to run |
| It's a new building | Bays first |
| Most of the fleet is next gen | Built-in, with the same brain |

## Ideas we ruled out

| Idea | Why not |
|---|---|
| Wi-Fi in every OR | Erlangen doesn't allow it, ORs have lead walls, and it solves data but not power or time |
| Install in the hour before surgery | 120 min doesn't fit into ~60, and no background work is allowed once surgery starts |
| Automatic start without a human | Not allowed in medical imaging, and it removes the one responsible person Siemens is missing |
| Peer-to-peer updates between C-arms | Breaks network segmentation (Christian's research) |
| A cellular modem as the standard | Looks like a hole in the perimeter to hospital IT. At most opt-in for emergency logs |
| A robot arm plugging into wall sockets | ISO 10218, cost, and sockets vary. KettyBot has no arm |
| The robot as a Wi-Fi relay | That's exactly the bridge IT fears. The robot carries, it never routes |
| Robot-assisted mechanical calibration | Out of scope (Siemens) |
| Points and badges for staff | Operators rotate and don't own the device (Christian's research) |

## Using this in the pitch and Q&A

- **On stage:** *"One brain, many hands. The brain finds the window and the one person who can say yes. The hand brings power and the package: a person at 17:00, a small companion on every C-arm, KettyBot at night."*
- **"Why a robot?"** *"The hallway has no socket, and unplugging mid-update is a known cause of dead-on-arrival devices. The robot does the last metre and guards the two hours. It isn't required: the pilot starts without it."*
- **"Why not a battery?"** *"Your Cios Select data sheet says 713 W standby. A full install is about 2 kWh, about 20 kg. That's why we start with people and data, and ask you what an update really draws."*
- **"Is the robot a network bridge?"** *"No. Own storage, a point-to-point cable to exactly one device, no routing. Your C-arm verifies your signature."*
- **Numbers for slides:** only Siemens' own (120 min, ~2 %, ~99 %, three roles). Simulator numbers are for Q&A, and only as "in our synthetic model".

## Files

The source trail is the [merged Siemens interview](../transcripts/04_invisible_connectivity_challenge_interview_merged.md), [hospital workflow interview](../transcripts/02_hospital_workflows_updates_and_remote_support.md), [Christian's architecture](../team-material-christian/challenge-4/architektur-skizze.md), and [clinic IT/security design](../team-material-christian/challenge-4/entwicklung/architektur-klinik-it-security.md). The original [rule core](../team-material-christian/challenge-4/klickdummy/planner.js) and [archived window scorer](../../Archive/OPUS/v2/js/model/golden.js) are recorded with their hashes and historical paths in [`sim/engine/SOURCES.json`](sim/engine/SOURCES.json). The [archived pitch source](../../Archive/CARMAGOTCHI_Web_Pitch/pitch-demo-christian/demo.js) provides historical context; the architecture slide cited here belongs to commit `2a2b60d`, not necessarily its final revision.

| File | What |
|---|---|
| [`PROMPT.md`](PROMPT.md) | The prompt: single agent, spin-out per option, synthesis, red team |
| [`00-reference-architecture.md`](00-reference-architecture.md) | Shared blocks, hand contract, data flows, guardrails, physics budget, zones, sources |
| [`01-people.md`](01-people.md) … [`06-hybrid.md`](06-hybrid.md) | One brief per option, same template, each ends with a one-shot build prompt |
| [`sim/model.js`](sim/model.js) | One hospital, seven hands. Every assumption is in `PARAMS` |
| [`sim/run.cjs`](sim/run.cjs) | Runs every option and the scenarios, and writes `sim/results/` |
| [`sim/sim.test.cjs`](sim/sim.test.cjs) | Invariants: never during a case, a confirmer at every start, ≤ 2 per night, the backup is never itself updating, the robot is never double-booked, the copied code is byte-identical |
| [`sim/engine/`](sim/engine/) | Unchanged copies of `planner.js` and `golden.js`, with hashes in `SOURCES.json` |
| [`index.html`](index.html) | The visual page: options, diagrams, matrix, and the simulator live in the browser |
| [`diagrams/`](diagrams/) | The Mermaid diagrams pre-rendered as SVG |

## Run it

Run these commands from the repository root. Node.js runs the tests and simulator without installing packages; Python's standard HTTP server provides an optional local preview.

```bash
node --test Documentation/architecture-options/sim/sim.test.cjs     # invariants, about 5 s
node Documentation/architecture-options/sim/run.cjs                 # all options and scenarios, about 45 s, writes Documentation/architecture-options/sim/results/
python3 -m http.server 8765
```

Open <http://localhost:8765/Documentation/architecture-options/>. The `index.html` page also works when opened directly from disk. The saved scenario results remain available until the runner above regenerates them; regeneration changes their timestamp and runtime as well as writing the selected run count.
