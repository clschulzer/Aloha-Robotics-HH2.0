# ASTRA technical research and demonstrator contract

Research date: 13 November 2026. The source transcripts are cleaned recollections, not product specifications or regulatory approvals. Numerical interview estimates remain attributed estimates. All ASTRA devices, schedules, signals and outcomes are synthetic.

## The strongest defensible story

**“A maintenance window needs a time, a connection, and a responsible human. C-ARMAGOTCHI brings them together.”**

Mobile C-arms are often switched off and disconnected precisely when they are not needed. Their packages already download in pieces when connected; the missing work is coordinating an uninterrupted installation opportunity, making the parked device physically reachable and connected, securing a responsible human decision, and detecting a failed return to service.

The solution should therefore promise better coordination and visible accountability, rather than faster installation or risk elimination:

1. Read the operating schedule, equipment demand and available backup.
2. Propose a protected window and explain why the other windows fail.
3. Prepare the physical connection through a person, approved companion or future service robot.
4. Require a human to approve the exact plan and explicitly confirm the installation start.
5. Monitor completion, coordinate a backup when needed and keep failed equipment unavailable.
6. Record verified completion and a deliberate handback.

The useful humour is the contrast between an expensive, sophisticated imaging system and the basic problem of being lonely, unplugged and ownerless. “The world's most expensive Tamagotchi still needs someone to plug it in” is memorable; implying careless nurses, certain patient harm, or a robot that cures all failures is not helpful.

## What the interviews actually establish

| Finding | Evidence in repository | Safe pitch wording |
|---|---|---|
| Idle mobile systems are often switched off in corridors; power outlets are not dependable. | [Interview 04, lines 13–27](../../transcripts/04_invisible_connectivity_challenge_interview_merged.md#L13) | “When the device is free, it is often off and disconnected.” |
| Download in pieces and checksum verification already exist. | [Interview 04, line 29](../../transcripts/04_invisible_connectivity_challenge_interview_merged.md#L29) | “The package can already arrive in pieces. Installation still needs protected time.” |
| Background operations during surgery are prohibited in the described workflow. | [Interview 04, line 23](../../transcripts/04_invisible_connectivity_challenge_interview_merged.md#L23); [Walkthrough 02, lines 11–13](../../transcripts/02_hospital_workflows_updates_and_remote_support.md#L11) | “Clinical use blocks maintenance.” |
| Expert describes 120 minutes as a fairly average update duration. | [Interview 04, lines 195–205](../../transcripts/04_invisible_connectivity_challenge_interview_merged.md#L195) | “About two hours, according to our challenge interview.” |
| Expert gives a rough 2% estimate for an update leaving the system unusable. This is not a measured dataset available to the team. | [Interview 04, lines 181–193](../../transcripts/04_invisible_connectivity_challenge_interview_merged.md#L181) | “The expert described a real failure risk.” If showing 2%, attribute it visibly as an interview estimate. |
| Operators fear responsibility; biomedical engineering and IT are informed but may be elsewhere. | [Interview 04, lines 31–87](../../transcripts/04_invisible_connectivity_challenge_interview_merged.md#L31); [Walkthrough 02, lines 79–97](../../transcripts/02_hospital_workflows_updates_and_remote_support.md#L79) | “Three roles. A task between them.” |
| A human must confirm the timing and start; many security packages are remote-capable. | [Interview 04, lines 69–75](../../transcripts/04_invisible_connectivity_challenge_interview_merged.md#L69) | “The agent proposes. A permitted human confirms.” |
| Existing teamplay Fleet does not itself provide the described start button in the walkthrough. “Remote-capable” does not prove an available integration for remote start. | [Walkthrough 02, lines 79–87](../../transcripts/02_hospital_workflows_updates_and_remote_support.md#L79) | “We propose an approval workflow; its execution path needs manufacturer validation.” |
| Emergency alarms are plausible planning inputs. | [Interview 04, lines 163–175](../../transcripts/04_invisible_connectivity_challenge_interview_merged.md#L163) | “When an emergency changes equipment demand, recompute the plan.” |
| Rollback usually exists, but duration depends on progress; interruption can cause an unusable system. | [Interview 04, lines 179–193](../../transcripts/04_invisible_connectivity_challenge_interview_merged.md#L179) | “Before installation, defer. After it starts, protect the update and coordinate backup.” |
| The current architecture does not support the suggested A/B image-switching approach. | [Interview 04, lines 121–131](../../transcripts/04_invisible_connectivity_challenge_interview_merged.md#L121) | “Prepared package does not mean instantly deployed software.” |
| Device identification, physical access, power rating and start mechanics need engineering work. | [Walkthrough 01, lines 81–99](../../transcripts/01_robot_assisted_updates_and_machine_walkthrough.md#L81), [135–145](../../transcripts/01_robot_assisted_updates_and_machine_walkthrough.md#L135), [199–211](../../transcripts/01_robot_assisted_updates_and_machine_walkthrough.md#L199) | “A service robot could establish power and Ethernet at an accessible parked device; this remains a hardware integration task.” |
| The built-in UPS is for safe shutdown, not running an update. | [Walkthrough 01, lines 195–197](../../transcripts/01_robot_assisted_updates_and_machine_walkthrough.md#L195) | “We must validate a continuous power source; the current UPS is not that source.” |
| Missing completion may only be discovered the following morning; recovery can require a service visit. | [Walkthrough 01, lines 153–187](../../transcripts/01_robot_assisted_updates_and_machine_walkthrough.md#L153); [Interview 04, lines 207–223](../../transcripts/04_invisible_connectivity_challenge_interview_merged.md#L207) | “Know which device did not come back, who must respond, and which backup is available.” |
| Hospital policy may prohibit connectivity regardless of signal strength. | [Walkthrough 02, lines 189–203](../../transcripts/02_hospital_workflows_updates_and_remote_support.md#L189) | “Approved connectivity only. A robot must not bypass hospital policy.” |

## Existing code: implemented, proposed, and missing

The existing prototype declares all its data fictional in [klickdummy/README.md:3–5](../../team-material-christian/challenge-4/klickdummy/README.md#L3) and [data.js:1–2](../../team-material-christian/challenge-4/klickdummy/data.js#L1). Its clear separation of pure planning rules and UI is a useful foundation.

### Demonstrably implemented before ASTRA

- [planner.js:8–20](../../team-material-christian/challenge-4/klickdummy/planner.js#L8) defines 120-minute updates, a 30-minute contingency buffer, a 20-minute handover, a risk threshold, minimum data history, and a daily fleet cap. Only 120 minutes is interview-derived; the numerical policy thresholds are assumptions.
- [planner.js:27–76](../../team-material-christian/challenge-4/klickdummy/planner.js#L27) scans candidate times, rejects overlaps with the target's planned use and alarm blocks, excludes remote motion updates, rejects missing or thin data, and accounts for a shared robot.
- [planner.js:81–111](../../team-material-christian/challenge-4/klickdummy/planner.js#L81) plans a fleet in deadline order with backup assignment and a daily cap.
- [planner.js:115–136](../../team-material-christian/challenge-4/klickdummy/planner.js#L115) selects replacement devices and reschedules an affected device on the same day.
- [planner.js:139–149](../../team-material-christian/challenge-4/klickdummy/planner.js#L139) blocks starts for missing approval, missing clear-surroundings report, clinical use, alarm, unchecked/recalled packages and motion updates.
- [app.js:132–159](../../team-material-christian/challenge-4/klickdummy/app.js#L132) differentiates an emergency before an installation from one during it. In the latter case it explicitly does not abort.
- [app.js:594–601](../../team-material-christian/challenge-4/klickdummy/app.js#L594) withdraws a simulated “surroundings clear” report after a stop or lost connection.
- [planner.test.cjs](../../team-material-christian/challenge-4/klickdummy/planner.test.cjs) has 15 tests; all 15 passed during this review.

### Important implementation gaps

1. **Backup coverage is not fully checked.** `pickErsatz()` avoids failed devices and concurrent updates, but does not read the backup's clinical schedule, compatibility or reachability. An isolated read-only counterexample selected C-04 even after its schedule was changed to “busy all day.” This is also acknowledged in [spec-scheduling-ki.md:224–233](../../team-material-christian/challenge-4/entwicklung/spec-scheduling-ki.md#L224).
2. **Power and networking are narrated, not independent start gates.** `canStart()` has no power/network inputs. A read-only call with `strom:false` and `network:false` still returned `{ok:true}` when its existing gates passed. The UI's [app.js:114–129](../../team-material-christian/challenge-4/klickdummy/app.js#L114) sets readiness booleans and announces “power and network are up”; no actual link is measured.
3. **Approval does not bind a plan revision.** [app.js:142–143](../../team-material-christian/challenge-4/klickdummy/app.js#L142) changes the window but preserves `geplant` status; [app.js:129](../../team-material-christian/challenge-4/klickdummy/app.js#L129) treats every non-proposal state as approval. Replanning should require a fresh decision.
4. **Unknown inputs are only partially handled.** Missing schedule and risk arrays are checked, but actual source timestamps, alarm heartbeat, validated role authorization and device identity are not implemented in the planning core.
5. **The “risk” is a synthetic historical frequency, not an emergency prediction.** The largest hourly frequency is a lower bound on use at any time during a multihour window. It is not the probability that the entire window is free. The code itself correctly comments on this limitation.
6. **No trained AI, hospital integration, robotic manipulation or medical update execution is demonstrated by these files.** A rich clickable simulation does not establish those capabilities.

The development specification makes the boundary particularly clear: [spec-scheduling-ki.md:14–33](../../team-material-christian/challenge-4/entwicklung/spec-scheduling-ki.md#L14) describes a rule core, a future usage model, an optional LLM for language, and a future optimizer. [Lines 72–112](../../team-material-christian/challenge-4/entwicklung/spec-scheduling-ki.md#L72) explicitly list missing backup, data-freshness and approval requirements. [Lines 120–141](../../team-material-christian/challenge-4/entwicklung/spec-scheduling-ki.md#L120) prohibit the LLM from overruling constraints or starting an update.

## Architecture claims to reject

[autonomous_c_arm_fleet_architecture.md](../../autonomous_c_arm_fleet_architecture.md) is a brainstorming design, not evidence of the actual device implementation. In particular:

- Its native-boot VHDX slots, partition layout, UWF internals, WinRM access, guaranteed Wake-on-LAN, automatic 30-second rollback, “zero bricking risk” and “100% backward compatible” claims have not been established.
- Its 700 W inverter rating does not establish battery energy capacity in Wh or the number of two-hour missions. The expert explicitly did not know the power consumption. A credible design needs measured load, inrush, required runtime, reserve, medical electrical requirements and physical payload compatibility.
- A camera or LiDAR observation alone does not establish “sterile,” “safe,” or an applicable clinical clearance.
- “RF-silent” is not proof that an air-gap or hospital security policy permits data carriage.
- Precise electrical leakage thresholds and regulatory-compliance conclusions cannot be inferred from a concept sketch.
- Replacing a PC image does not update every distributed component or establish calibration compatibility.
- C-arms should be described as mobile surgical X-ray imaging systems; calling all of them “C-arm CT” is misleading.

The more cautious [architektur-klinik-it-security.md:17–26](../../team-material-christian/challenge-4/entwicklung/architektur-klinik-it-security.md#L17) offers a better future direction: a hospital node, manufacturer-signed packages checked by the device, a constrained transport role for the robot, and a human approval bound to device, package and plan version. It still explicitly declares itself a proposal, not implemented code.

## ASTRA implementation and demo

ASTRA adds a fresh deterministic engine in [engine.mjs](../engine.mjs). It uses no imported historical prototype code, no trained model and no external service. The browser displays the same constraints that determine the transition.

### Three candidate windows

| Candidate | Result | Reason |
|---|---|---|
| 17:10–19:10 | Rejected | Cora's previous case ends at 17:00; the assumed 20-minute handover has not elapsed. |
| 17:30–19:30, reserve to 20:00 | Initially recommended | Fritzi is free through the whole installation-plus-reserve interval. Arcus is booked until 18:30 and is rejected as backup. |
| 20:00–22:00, reserve to 22:30 | Feasible later choice | Arcus is now free; Fritzi has a scheduled case beginning at 20:00 and is rejected as backup. |

The 30-minute reserve is a configurable demonstrator assumption. **It is not a guaranteed recovery or rollback duration.** A real policy needs manufacturer duration bounds and clinical contingency planning; a fixed reserve cannot guarantee that an emergency or prolonged recovery will never disrupt care.

The emergency button adds a synthetic request for Cora from 17:20 to 19:10. The first window becomes impermissible, the later window remains feasible, and the named backup changes. The old preparation and approval are invalidated. That small change demonstrates meaningful reasoning: the result depends on equipment use and coverage, not merely a different animation.

### Event and state contract

Exports: `RULES`, `formatTime`, `createScenario`, `evaluateSlots`, `getRecommendation`, `getStartChecks`, `canStart`, `transition`.

State sequence:

```text
planning → PREPARE → prepared → ATTEST → approved → START → installing
                                                            ├─ VERIFY_SUCCESS → verified → RELEASE → released
                                                            └─ VERIFY_FAILURE → failed
```

- `PREPARE` models a robot mission to an accessible parked device: identification, local surroundings report, power and approved Ethernet. These are simulated conditions, not sensor measurements.
- `ATTEST` is an explicit simulated human approval bound to the plan revision, slot, device, package and backup.
- `START` is a separate human confirmation. The device becomes unavailable only here. The demo advances to the scheduled time explicitly; no future unattended real-world execution is implied.
- `VERIFY_SUCCESS` models an expected-version receipt and manufacturer-specific post-checks. It keeps the device unavailable.
- `RELEASE` requires verified completion and an authorized human, then marks it available.
- `VERIFY_FAILURE` keeps the device unavailable and requests service/backup coordination. A failure reported during the final checks can also supersede an earlier technical success receipt before handback. The engine does not implement recovery or assert rollback success.
- `EMERGENCY` before installation removes old approval and readiness, recomputes the window and backup, and requires preparation again.
- `EMERGENCY` during installation preserves the update phase and power state; it raises a continuity alert and requests clinical coordination of the reserved backup. It does not claim the backup has already been clinically allocated or transported.
- `SET_CONDITION` changes one synthetic signal. Before installation it invalidates approval/readiness. During installation it escalates instead of attempting to abort.

`lastAction` and `audit` record the decision, phase, plan revision and rule version. This is a reproducible local demo trace, not a tamper-resistant medical audit system.

### Start gates

The actual `START` transition uses the same `getStartChecks()` rows shown in the UI:

- Selected calendar interval remains permissible, including handover and reserve.
- Schedule and alarm data are marked fresh.
- The previously reserved, compatible, reachable and ready backup covers the full interval.
- Clinical examination status is explicitly idle.
- Route and surroundings are reported clear.
- Device identity matches.
- Package is checked, locally approved, and explicitly not recalled.
- Update class is eligible for this security-update workflow; motion/service procedures are excluded.
- Continuous power is marked available and connected.
- Connectivity is both permitted and established.
- A permitted operator is present.
- A human approval matches the exact plan/device/package/window/backup.
- The workflow is prepared/approved, not already installing or terminal.

False and unknown (`null`) safety conditions fail closed. Physical checks, package signatures, permissions and freshness are represented as synthetic booleans. The demonstrator tests policy enforcement; it does not establish real-world correctness of those reports.

## A buildable pilot, after the demo

Start with a hospital-approved scheduling assistant and one device family, in shadow mode. It can use an exported operating schedule with equipment/time fields only, manufacturer update metadata, and a manually confirmed equipment inventory. Compare its proposed windows with actual coordinator decisions before enabling any preparation action.

The physical pilot can begin with a human plugging the C-arm into a designated approved service location; the same preparation interface can later be supplied by a companion or robot. Validate device identification, access to the required connectors, power and boot behaviour, approved package transfer, device-specific start procedure, fresh alarm delivery, return-to-service checks, and responsibility for responding to failure. A robot arm and an external supply are separate engineering projects; a wheeled screen is not proof of either.

The learned model, if added, should rank only already permissible windows and be evaluated against a historical-frequency baseline. Language generation can explain structured decisions; it must not invent times, hide a rejected constraint or create an approval. The most useful near-term “agentic” behaviour is the complete propose → observe change → replan → ask → monitor loop, with bounded tools and explicit ownership.

Measure outcomes rather than promise savings:

| Pilot measure | Why it matters |
|---|---|
| Due updates completed before agreed deadlines | Tests actual maintenance adoption. |
| Staff calls, walking time and active interaction minutes per update | Tests whether coordination burden decreases. |
| Time from missed completion to acknowledgement by the responsible team | Tests whether the morning surprise is reduced. |
| Proposed windows rejected because of real equipment demand | Tests proposal quality and workflow fit. |
| Every update with confirmed backup coverage and fresh approval | Tests the operational controls. |
| Unplanned loss of clinical availability attributable to maintenance | Tests safety impact; zero is an aspiration, not a demonstrated outcome. |

## Validation performed

Executed on 13 November 2026 with Node v24.14.1:

```bash
node --test ASTRA/tests/engine.test.mjs \
  team-material-christian/challenge-4/klickdummy/planner.test.cjs
```

Result at initial implementation: **33 passed, 0 failed** — 18 new ASTRA tests plus the 15 existing planner tests. ASTRA tests check:

- A booked backup is rejected and reserve time is covered.
- Missing/stale scheduling data and unknown safety signals do not pass.
- Preparation, human approval, installation, verification and handback remain separate.
- Route blockage, device mismatch, disallowed network access, and missing power/connectivity block preparation or start.
- Every start gate is checked again after approval.
- Emergency replanning changes both the window and backup and invalidates old permission.
- Package or plan changes invalidate permission.
- An emergency during installation neither aborts nor removes power.
- Missing backup coverage is reported as unconfirmed rather than promised.
- Failed updates stay unavailable and cannot be “released” by a successful-looking UI action.
- Lost communication blocks a success receipt and handback.
- Motion updates do not enter this workflow.
- Out-of-order actions cannot fabricate progress.
- State transitions preserve prior snapshots and produce deterministic trace records.

The existing prototype files were inspected and tested without modification.

### Presentation integration review

The first presentation integration passed JavaScript syntax checking, unique HTML element-ID checks, and static resolution of the app's element references. Its eight contiguous speech cues total exactly 180 seconds. The stage's emergency → preparation → approval → start → successful report → human handback sequence was executed directly against the engine and ended with the revised 20:00 window and Arcus backup.

The integration review also added a regression case for a failed final check after a technical success receipt: it supersedes success, remains unavailable and cannot be released. All 18 ASTRA engine tests continued to pass. Browser visual and interaction QA is separate from these source and engine checks.
