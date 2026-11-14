# What runs, what is specified, and why

Source checkpoint: main `984a20d`, freshly fetched before this version. No open pull requests were present. The repository inventory contained browser applications, rule modules, tests and design documents; it did not contain the proposed FastAPI hospital service or a working C-arm/robot adapter.

## Implemented and reused

| Component | Evidence | Role in this version |
|---|---|---|
| Browser workflow | Christian's `klickdummy`, `pitch-demo-christian`, the team's web pitch | Existing interaction and state-machine work; the presentation remains ordinary HTML/CSS/JavaScript |
| Deterministic planner | [`planner.js`](../../../../team-material-christian/challenge-4/klickdummy/planner.js), with 15 existing tests | Pure functions for windows, fleet planning, replacement assignment, rescheduling and the start predicate |
| Golden-window scorer | [`OPUS/v2/js/model/golden.js`](../../../../OPUS/v2/js/model/golden.js), with 12 existing tests | Enumerates candidate starts, rejects forbidden windows, ranks surviving proposals |
| Synthetic hospital day | [`OPUS/v2/js/data/day.js`](../../../../OPUS/v2/js/data/day.js) | Device inventory, case intervals, emergency-rate assumptions and a confirmer roster |
| Stage and audio primitives | OPUS `core.js`, the earlier ASTRA cue engine | Native browser animation, optional synthesized effects, pause, notes, clicker control and a timed rehearsal |
| Presentation adapter | [`kernel.js`](../kernel.js), [`circuit.mjs`](../circuit.mjs) | Actual candidate results, an interactive local start simulation and executable checks |

The copied planner and scorer remain unchanged. The adapter does not introduce a language model or a network dependency.

## Two planning layers, not one unexplained AI box

The original `findWindow` returns the earliest window under its rule thresholds. It handles the handover interval, update duration, recovery buffer, robot occupancy and a usage-history threshold. Missing plan/history data produces a reason rather than an optimistic guess.

The OPUS scorer adds a search across candidate starts. Its hard checks include motion firmware, data sufficiency, case and alarm overlap, a confirmer on duty, robot occupancy and a replacement available through the recovery margin. It then ranks accepted candidates by a product of illustrative survival factors:

`no unplanned use × no emergency pull × no preceding-case overrun`

The emergency term uses an assumed arrival rate and device pull share. The overrun term decays with time since the preceding case. This is executable modeling, not evidence that the assumptions are calibrated or independent in a real hospital.

The original planner's `windowRisk` uses the busiest hourly usage share as a lower bound for use at some point in a window. That is a different quantity from the OPUS product. Neither should be relabeled “clinical confidence.” The stage therefore shows ordering, the selected time and the replacement, with synthetic inputs identified.

The scorer chooses a candidate for this example; it is not a complete multi-device, multi-night optimizer. Deadline-aware fleet allocation, approval expiry, data freshness and all resource interactions need the complete integration described in Christian's specification.

## Proposed stack and its purpose

| Proposed component | Why it belongs | Source / status |
|---|---|---|
| Python + FastAPI | A small service boundary for adapters, commands and validation around the rule core | Stack proposed in [`briefing.md`](../../../../team-material-christian/challenge-4/briefing.md), line 148, and the research synthesis; no service implementation found |
| SQLite | Local operational state and a prototype journal while the node is disconnected | Proposed prototype stack; SQLite alone does not provide signed, immutable audit history |
| Server-sent events | A simple server-to-browser stream for status, mission progress and exceptions | Proposed prototype stack; explicit commands would still use authenticated requests |
| Hospital node / VM or appliance | Keep operational inputs, rules, cache and orchestration inside the hospital | Christian's [`IT/security architecture`](../../../../team-material-christian/challenge-4/entwicklung/architektur-klinik-it-security.md), sections 1–3 |
| Read-only input adapters | Reduce theatre data to room/time/equipment and roster data to role/shift/area at import | Specified allow-list contract; current data is synthetic, so no live patient-data filtering is being claimed |
| teamplay Fleet / SRS route | Approved package metadata, recall and technical status through a hospital-controlled outbound route | Named integration targets; exact API availability remains a manufacturer question |
| ROS 2 / Nav2 and a platform adapter | Separate a mission from the navigation and physical platform that executes it | Robot specification, section 9, and the alternate robot architecture; not a deployed docking interface |
| mTLS and scoped commands | Authenticate components and limit what the robot may receive or do | Security architecture, conduit C-05; MQTT 8883 is an example, not a demonstrated broker |
| Manufacturer signatures | Establish package origin and integrity at the approved endpoint | Security architecture, sections 4.1 and 5.3; the existing device's signature-validation interface must be confirmed |
| WebAuthn / hospital PKI | Bind a human decision to device, package, plan version and expiry | Specified authorization design; no hardware-key or signed-permission implementation in this browser prototype |
| LLM or fixed templates | Explain a structured result and tailor a message; no start authority | Scheduling specification, section 4 |
| OR-Tools CP-SAT | Possible later allocation across fleet/resource constraints | Explicitly a future optimizer in the scheduling specification |

The earlier blueprint mentions Ed25519 and QR transport. The newer security specification separates manufacturer package signatures, person authentication and service signatures. Those are different trust relationships; one “signed” badge should not collapse them into a single mechanism.

## The gate that exists today

The actual `canStart` function checks:

1. No update involving arm movement.
2. An explicit release.
3. Clear surroundings.
4. Device not in use.
5. No alarm.
6. Package checked and not recalled.

The stage toggles real inputs to that function. “Eligible” is not “started.” The local demonstration only records a start after a click.

Production requirements go further: site package admission, authenticated roles, fresh signals, identity at the cable, an unexpired approval tied to the current plan, and enforcement at the permitted device interface. Those requirements are documented in the team's specifications; the six booleans in a browser are not a replacement for them.

## Physical and system boundaries

The preferred Christian architecture says the robot is a carrier, not an IP bridge: it transports an approved package from local storage through a constrained handoff to one identified device. Operational network access is not inferred from merely being close to the machine.

The alternate [`autonomous_c_arm_fleet_architecture.md`](../../../../autonomous_c_arm_fleet_architecture.md) proposes Windows IoT LTSC, native-boot VHDX images, Wake-on-LAN, WinRM/SMB and DICOM worklist delivery. These are useful design hypotheses. The repository does not demonstrate a validated C-arm boot-image swap, cross-generation calibration preservation, guaranteed rollback time, or approved worklist transport.

This cut includes the target workstation stack but does not promise instant image replacement or universal support. The interviews explain that updates can touch distributed components, compatibility and parameters, and that the internal UPS supports safe shutdown rather than a maintenance session.

The next engineering deliverable is a validated adapter contract and physical handoff, with identity, package checking, power behavior, authorization and exception reporting proven together.
