# Aloha Robotics — Research and Technical Documentation

The evidence, design decisions and engineering proposals behind C-ARMAGOTCHI and Invisible Connectivity. Start with the conversations and synthesis, then follow the specifications into the working browser prototype.

**[Project website](../Website/)** · **[Care Companion](../Care-Companion/)** · **[Phone companion](../Care-Companion/phone/)** · **[Hackathon presentation](../Presentation/hackathon/)**

## Preparing the Siemens discussion

**[Start with the follow-up brief](siemens-follow-up.md).** It links the essential evidence, distinguishes the running prototype from proposed integrations, and sets out questions for the longer internal pitch. The hackathon is complete; the next phase is validating the problem, interfaces and a useful first pilot.

## Start here

| Document | What it provides |
| --- | --- |
| [Siemens follow-up brief](siemens-follow-up.md) | Recommended reading, suggested meeting flow, six open questions and a first validation step |
| [Challenge overview](team-material-christian/challenge-4/README.md) | The original Invisible Connectivity challenge and the team's supporting material |
| [Briefing](team-material-christian/challenge-4/briefing.md) | Problem, users, proposed solution and demonstration flow |
| [Conversation synthesis](team-material-christian/challenge-4/synthese-nach-gespraech.md) | Christian's synthesis of the challenge-owner discussions |
| [Platform concept](team-material-christian/challenge-4/plattform-konzept.md) | The broader device-care concept and proposed services |
| [People and their goals](team-material-christian/challenge-4/menschen-und-ziele.md) | Responsibilities, concerns and needs |
| [User journeys](team-material-christian/challenge-4/personas/user-journeys.md) | The handovers between clinical users, medical physics, IT and service |

Christian's material is primarily in German. [Its provenance README](team-material-christian/README.md) identifies the source repository and snapshot commit. That snapshot also contains an earlier prototype and screenshots, retained as research history rather than substituted for the current Care Companion.

## Interview transcripts

| Transcript | Subject |
| --- | --- |
| [01 — Robot-assisted updates and machine walkthrough](transcripts/01_robot_assisted_updates_and_machine_walkthrough.md) | Physical access, power, ports, update confirmation and support |
| [02 — Hospital workflows, updates and remote support](transcripts/02_hospital_workflows_updates_and_remote_support.md) | Responsibilities, logs, deployment constraints and service processes |
| [03 — Team debrief on the core problem](transcripts/03_team_debrief_on_the_core_problem.md) | The team's interpretation and early hypotheses |
| [04 — Invisible Connectivity challenge interview](transcripts/04_invisible_connectivity_challenge_interview_merged.md) | The central problem, possible technical approaches and a merged version of the two supplied transcripts |

These are cleaned transcripts of the supplied text. Speaker estimates, examples and opinions remain attributed to their conversations; they are not independent measurements or verified clinical guidance.

## Engineering notebook

| Document | Scope |
| --- | --- |
| [Architecture sketch](team-material-christian/challenge-4/architektur-skizze.md) | Proposed layers, interfaces and data flows |
| [Scheduling specification](team-material-christian/challenge-4/entwicklung/spec-scheduling-ki.md) | Rule core, optimisation, usage modelling, explanations, tests and current gaps |
| [Robot cockpit specification](team-material-christian/challenge-4/entwicklung/spec-robot-cockpit.md) | Roles, task states, physical checks and failure handling |
| [Clinical IT and security architecture](team-material-christian/challenge-4/entwicklung/architektur-klinik-it-security.md) | Deployment choices, trust boundaries, proposed approvals and pilot questions |
| [Prototype QA notes](team-material-christian/challenge-4/entwicklung/qa-klickdummy.md) | Findings from Christian's prototype review |
| [Research synthesis](team-material-christian/challenge-4/research/00-synthese.md) | Summary of the research retained in the source snapshot |
| [Architecture options and simulator](architecture-options/README.md) | Comparison of people, parking bays, companions and robot support using explicit synthetic assumptions |
| [Autonomous fleet architecture proposal](architecture/autonomous_c_arm_fleet_architecture.md) | A separate exploratory hardware and software proposal, preserved in its original form |

The architecture documents are proposals. They do not establish access to manufacturer APIs, implemented robotics, clinical validation, certification or regulatory compliance. The autonomous fleet proposal includes unverified assumptions about air-gapped operation, operating-system updates, remote power-on and patient worklists; read it as an exploration, not as the specification of the working prototype. Prefer the clinical IT design and scheduling specification when tracing the documented boundaries and open questions.

The [architecture-options simulator](architecture-options/index.html) is executable, but its devices, people, timings, costs and outcomes are synthetic. Its results compare assumptions; they are not measured hospital performance or forecasts.

Some source-snapshot links refer to research files that were never included in this repository. They are retained to preserve provenance; moving the snapshot did not create those gaps.

## Working implementation and tests

The [Care Companion](../Care-Companion/) implements the interface, fictional demonstration data and a deterministic browser planner. The [planner source](../Care-Companion/planner.js) is shared between browser execution and Node tests. The separately organized [phone companion](../Care-Companion/phone/) has its own state and interaction flow.

Run the detailed prototype's rule checks from the repository root:

```sh
node --test Care-Companion/planner.test.cjs
```

The checks exercise proposed windows, margins, deadline handling, replacement conflicts, robot bookings and explicit start conditions against invented cases. Passing them verifies those modeled behaviors; it is not a clinical acceptance test.

## Folder provenance

| Previous repository location | Current location |
| --- | --- |
| `team-material-christian/` | `Documentation/team-material-christian/` |
| `transcripts/` | `Documentation/transcripts/` |
| `breif/` | `Documentation/architecture-options/` |
| `autonomous_c_arm_fleet_architecture.md` | `Documentation/architecture/autonomous_c_arm_fleet_architecture.md` |

The source documents, transcript files and historical prototype assets have been preserved. The presentation used at the hackathon now lives in `Presentation/hackathon/`; its former `FINAL/v5/` entry link forwards there.
