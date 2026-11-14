# Preparing the Siemens Healthineers follow-up

The hackathon pitch is complete: Aloha Robotics placed fourth. The next step is a longer internal Siemens Healthineers pitch in the coming weeks. The meeting date, audience and duration remain to be confirmed.

**[Project website](https://clschulzer.github.io/Aloha-Robotics-HH2.0/Website/)** · **[Hackathon presentation](https://clschulzer.github.io/Aloha-Robotics-HH2.0/Presentation/hackathon/?s=1)** · **[Care Companion](../Care-Companion/)** · **[Phone companion](../Care-Companion/phone/)**

## What the meeting should decide

Agree whether finding and coordinating maintenance windows is the right first problem to validate, which device family and hospital workflow to examine, and who can provide the necessary evidence. Leave with named next steps for Siemens and the team, rather than an assumed integration or pilot commitment.

The product hypothesis is a service platform that joins device needs, usable maintenance time, physical access and human responsibility. A robot or separately powered companion could help establish contact; the platform should also be useful with people doing the physical work.

## Read before the meeting

1. **[Post-interview synthesis](team-material-christian/challenge-4/synthese-nach-gespraech.md):** the current concept, corrected assumptions and open questions.
2. **[Challenge interview](transcripts/04_invisible_connectivity_challenge_interview_merged.md)** and **[workflow interview](transcripts/02_hospital_workflows_updates_and_remote_support.md):** the underlying evidence.
3. **[Scheduling specification](team-material-christian/challenge-4/entwicklung/spec-scheduling-ki.md)** and **[clinical IT/security proposal](team-material-christian/challenge-4/entwicklung/architektur-klinik-it-security.md):** proposed interfaces, safeguards and development gaps.

These interviews contain oral estimates and model-specific descriptions. The roughly two-hour installation time and other quoted figures are starting points to verify, not measured benefits.

## What exists today

The [Care Companion](../Care-Companion/README.md) is a working browser prototype with fictional device records, planning, role handovers and simulated robot missions. Its [deterministic planner](../Care-Companion/planner.js) and [tests](../Care-Companion/planner.test.cjs) make selected scheduling and start conditions executable. The phone companion and hackathon pitch demonstrate the interaction and story.

Hospital/manufacturer connections, authenticated approvals, remote update execution, robot docking, predictive models and clinical validation remain proposed work. Browser confirmations change demonstration state. The current historical-use measure is not a calibrated emergency prediction, and replacement selection does not establish every aspect of clinical availability.

## Suggested meeting structure

Adapt this to the invitation; the existing [follow-up concept](team-material-christian/challenge-4/pitch-und-demo-konzept.md#format-2-der-folgetermin-in-der-tiefe) proposes 30–45 minutes with substantial discussion.

| Time | Purpose |
| --- | --- |
| 3 minutes | Replay the hackathon presentation if useful for new attendees. |
| 7 minutes | Show the planner, an alarm that closes a window, a human handover and the device record. Explain the demonstration boundaries. |
| 15–25 minutes | Let Siemens challenge the hypotheses and resolve the questions below. |
| 5–10 minutes | Choose the next validation step, owners and evidence required. |

## Six questions that unlock the next step

1. **What can initiate an update today?** For which models and update classes, through which supported path, and with whose authorization? The [workflow interview](transcripts/02_hospital_workflows_updates_and_remote_support.md) says teamplay Fleet cannot start it; the [later team notes](team-material-christian/challenge-4/gespraech-challenge-geber.md#11-nachtrag-start-aus-der-ferne-und-art-der-updates) describe possible remote initiation. Resolve this before assuming an API.
2. **What data can we actually use?** Which status, usage, package eligibility/deadline/revocation, progress/completion and permitted log fields are accessible? Request sample records, interface documentation and permitted pilot use. See the [scheduling questions](team-material-christian/challenge-4/entwicklung/spec-scheduling-ki.md#9-offene-fragen-und-annahmen).
3. **What is the measured baseline?** Installation and recovery durations, adoption delay, staff effort, log freshness and time to discover failures determine useful targets. The [synthesis](team-material-christian/challenge-4/synthese-nach-gespraech.md#was-der-ansatz-erreichen-soll) deliberately leaves target values open.
4. **What makes a hospital window usable?** Confirm schedule/actual-use/alarm sources and freshness, reserve-device coverage, release authority and night coverage. See the [clinic questions](team-material-christian/challenge-4/entwicklung/spec-scheduling-ki.md#fragen-an-die-klinik).
5. **Which physical assumptions can we test?** Identify a training-center machine; measure service power draw and check permitted external power/data coupling, wake behavior and access around parked devices. The [walkthrough](transcripts/01_robot_assisted_updates_and_machine_walkthrough.md) leaves these unresolved.
6. **Who would own and evaluate a narrow pilot?** Agree the Siemens sponsor, clinical/IT counterparts, scope, responsibilities and evidence needed to progress. The [pilot proposal](team-material-christian/challenge-4/entwicklung/architektur-klinik-it-security.md#9-pilot-schnitt) provides a discussion starting point.

## Proposed first validation step

Run the planner in shadow mode against permitted schedules and device history: propose windows without initiating work, then compare them with actual use and clinical review. Record rejected windows, reserve coverage, data gaps and coordination effort. Agree acceptance criteria from that baseline before connecting execution.

This follows the [historical development brief](../Archive/CARMAGOTCHI_Web_Pitch/pitch-demo-christian/docs/briefing-killer-features.md#2-goldenes-fenster-fenster-lotse) and the software-only first stage in the [IT proposal](team-material-christian/challenge-4/entwicklung/architektur-klinik-it-security.md#9-pilot-schnitt). Their durations and fleet sizes are proposals, not commitments.

## Historical appendices

- [English research recap](../Archive/ASTRA/RESEARCH_RECAP.md): careful evidence synthesis; implementation descriptions and links reflect its earlier snapshot.
- [Development brief](../Archive/CARMAGOTCHI_Web_Pitch/pitch-demo-christian/docs/briefing-killer-features.md): staged feature and pilot ideas.
- [Architecture alternatives and simulator](architecture-options/README.md): synthetic comparison of assumptions, not hospital outcomes or validated costs.
- [Source-snapshot provenance](team-material-christian/README.md): origin and known missing research files.
