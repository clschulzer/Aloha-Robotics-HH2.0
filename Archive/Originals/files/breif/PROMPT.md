# The prompt: spin out the architectures, one shot each

What Christian asked in the team chat on 14 Nov:

> "can you give it the prompt to spin out architecture with a briefing and diagrams for each and give pros and cons."
> "also please maybe tell them to one shot each solution"

This file is that prompt. It has been run once already, and the output is this folder: `README.md`, `00` to `06`, and `sim/`. Run it again whenever the facts change, for example after Siemens answers the open questions. It works with any capable agent.

## How to run it

- **One agent:** paste the prompt below at the repo root.
- **Spin out in parallel:** give each agent the prompt plus the "You own option X" header further down, then run the synthesis prompt and the reviewer prompt.
- **One shot** means each agent finishes its option completely in one pass, with no questions back. Missing facts get labelled instead of asked about.

## The prompt

```text
ROLE
You are the solution architect of team Aloha Robotics at the Healthcare Hackathon Bavaria 2026, Siemens Healthineers
challenge 04 "Invisible Connectivity" (mobile C-arms). Your readers are the team today and two Siemens product and tech
people from X-ray imaging tomorrow. They care about the share of the installed fleet that is connected and up to date,
on-site visits, service cost, angry phone calls, and never disturbing the OR.

THE QUESTION
How does a parked, switched-off mobile C-arm get about 120 undisturbed minutes of power, the package, a switch-on and one
human "start", without patient data, without touching the OR schedule and without a new way into the hospital network?

FACTS YOU MAY USE (do not invent others; cite the file)
- Siemens interview, transcripts/04_invisible_connectivity_challenge_interview_merged.md:
  parked switched off in hallways, often no socket; the UPS only covers a safe shutdown;
  at most ~1 h from plug-in to incision, and no background activity during surgery; downloads come in parts and are checked;
  ~120 min per update; a human must press start, and ~99 % of security patches are remote-capable;
  three roles could press start and none feels responsible; ~2 % of updates end dead on arrival (e.g. unplugged mid-update);
  Siemens learns of failures from angry calls; 85–90 % of daytime cases are planned, and the polytrauma alarm is a usable trigger;
  their favourite idea is a companion device beside the C-arm with a wired link; Schuko plug, 230 V;
  Uniklinikum Erlangen has no Wi-Fi in its ORs;
  logs are a flight recorder without patient data, kept ~2 weeks (transcript 02).
- Team code: team-material-christian/challenge-4/klickdummy/planner.js (rules), OPUS/v2/js/model/golden.js (P undisturbed).
- Christian's architecture: architektur-skizze.md, entwicklung/architektur-klinik-it-security.md (clinic node, zones,
  robot never a bridge, signed approvals, pilot cut), entwicklung/spec-robot-cockpit.md (12-step robot mission),
  research/00-synthese.md, the pitch demo's architecture slide (scene 14 in commit 2a2b60d: architecture line, guardrails)
  and its closing call to action (three asks: status data, a C-arm to test, a pilot).
- Data sheet: Cios Select standby draw 713 W at 230 V, 7 m power cable, Gigabit LAN. Verify for other Cios models.
- Anything that changes over time (prices, specs, laws): look it up, cite it, date it.

OPTIONS TO SPIN OUT, one brief each
A People-powered: the brain asks one named person at the right minute (stay plugged after the last case, plug in, push).
B Smart parking bays: parking spots with a socket, a wired port, a presence sensor and a status light.
C Companion: C1 data companion (cache, link, display, logs); C2 power companion (adds a battery for a full install).
D Robot courier: KettyBot brings power and the package, docks, guards, takes logs home.
E Built-in: Siemens' next generation, with a service controller, maintenance power, A/B slots and a dock.
F One brain, many hands: one brain and one hand contract, hands added where the brain's data says.
Add an option only if it differs in how power and data reach the device. List rejected ideas with one reason each.

ONE SHOT EACH SOLUTION
- Produce each option completely in a single pass. No questions back, no "TBD". Where a fact is missing,
  write [assumption] or [ask Siemens] and keep going.
- Each brief stands alone: a reader who opens only that file understands the option.
- Use the same template, the same headings and the same 10 scoring criteria for every option, so they compare one to one.
- Then implement each option once, as a policy in the shared simulator (breif/sim), and report the same metrics.
- End each brief with a copy-paste one-shot build prompt. It must build a runnable prototype of that option in one agent run,
  reuse the team's rule core and scorer unchanged, add no new dependencies, and work from file://.

TEMPLATE FOR EVERY BRIEF
1. One-line pitch, a one- or two-sentence verdict, best for / not for.
2. What it looks like: one concrete evening, with names (Cio, Arcus) and times.
3. How it works: numbered steps.
4. An architecture diagram (Mermaid flowchart) and a sequence diagram of a normal evening plus the polytrauma or failure
   path. Both must render on GitHub.
5. What it needs: from Siemens, from the hospital, from us.
6. Pros, then cons. Make them concrete (name the actor, the number, the failure), never generic.
7. Risks and what we do about them (table).
8. Effort and cost. Label every number with its source or as an assumption.
9. Fit against the challenge, scored ●○ on: works on today's C-arms unchanged, power without a socket,
   data without OR Wi-Fi, guards the install, low clinic effort, hospital IT acceptance, light regulatory load,
   time to a pilot, low hardware cost, scales to many sites.
10. In the simulator: the base-case numbers and the scenario that flips the answer.
11. An 8-week pilot, if this were the only option.
12. Questions the jury may ask, with short answers.
13. Open questions for Siemens.
14. The one-shot build prompt.

GUARDRAILS (non-negotiable in every option)
No patient data, ever. The OR plan is read only. Never during a planned case, never without a buffer, never without a
free backup C-arm, never more than 2 per night. A human starts every update (one signed tap, then canStart()).
Packages are signed and verified by the C-arm; caches, robots and companions are only transport. No hand is ever a
network bridge (point-to-point cable, own storage, no routing). Logs leave through an allow-list, outbound only.
If the platform is down, the clinic works as it does today.

DELIVERABLES
- breif/README.md: the briefing (question, options at a glance, comparison matrix, simulator summary, recommendation,
  what would change your mind, how to use it in the pitch).
- breif/00-reference-architecture.md: shared blocks, hand contract, data flows, guardrails, physics budget.
- breif/01..06: one brief per option.
- breif/sim: one policy per option on the same synthetic hospital, with tests and results.
- breif/index.html: one visual page.
Work only inside breif/. Do not change anything else in the repository.

QUALITY BAR
Pick one recommendation and defend it. Say what would change your mind. No hype, no invented numbers, and no slide
claims the simulator can't back. Short sentences. Write for a busy engineer.
```

## Spin-out version: one agent per option

Give every agent the prompt above with this header on top:

```text
You own option <X> only. Read breif/00-reference-architecture.md first and keep to its blocks, hand contract and guardrails.
Write breif/0<n>-<name>.md using the template. Add your policy to MODES and OPTIONS in breif/sim/model.js without
changing other options. Run node --test breif/sim/sim.test.cjs, then stop. One shot: no questions back.
```

Then one synthesis agent:

```text
Read breif/01..06 and breif/sim/results/RESULTS.md. Write breif/README.md: options at a glance, the matrix with the same
10 criteria, the simulator summary, one recommendation, what would change your mind, and rejected ideas.
Do not soften the cons.
```

## Reviewer prompt: red team, run after

```text
Review breif/ as three people, one pass each. List only concrete defects, with file and line.
1. Siemens X-ray R&D: physics (power draw, battery size, cable), device changes we claim are "none", regulatory claims.
2. The hospital's IT security officer (Christian's persona P5: "devices that somehow go on the internet don't get on my
   network"): every new network path, every radio, every port in a public corridor, every bridge risk.
3. An OR nurse on a late shift: every ask to staff, every cable or robot in a corridor, every minute.
Then check every number in the briefs against breif/sim/results/RESULTS.md and the cited sources.
```
