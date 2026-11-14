# C-ARMAGOTCHI — Speaker Script & Cue Sheet

> Unofficial Siemens Healthineers hackathon concept; all device interaction is simulated.

## Main presentation (approx. 4 minutes)

### 01. C-ARMAGOTCHI

[0:00–0:18] Begin deadpan. 'This is C-ARMAGOTCHI. A very advanced surgical imaging device. It has one small problem: it hasn't been connected in a while.' Advance. [Let the character grin.] 'He needs an update.' Pause for laugh. 'And maybe some supervision.' This is an unofficial hackathon character, not a Siemens product interface.

*Reveal steps:* 3 (0 to 2).

### 02. OR CHAOS

[0:18–0:42] Two teammates act this out. Surgeon: 'We have a patient.' Radiographer: 'The C-arm has been parked and disconnected.' IT voice: 'It's due for maintenance.' Surgeon: 'Who takes care of the C-arm? Not me.' Make the timing theatrical, not accusatory. This slide is dramatization, not a recorded true clinical incident. End: this is how devices become invisible until they fail.

*Reveal steps:* 5 (0 to 4).

### 03. WHAT AN UPDATE REALLY IS

[0:42–1:04] Explain the observation from Siemens, not an invented benchmark. The challenge is not simply download speed. Some updates require parameter backup, software installation, restoring the device-specific configuration, and verification. Restoring parameters can fail when compatibility changes. Motion sensor calibration can require an engineer to make sure nobody is in the movement zone. Do not promise unattended mechanical calibration. This motivates preflight checks and technician exceptions.

*Reveal steps:* 6 (0 to 5).

### 04. INVISIBLE CONNECTIVITY

[1:04–1:20] The Siemens brief: devices travel between rooms and are frequently off or disconnected when parked. Radiographers have complex clinical responsibilities; connectivity adds friction without a clear personal benefit. Don't call all of this a technology problem. We need a service workflow that goes to the parked device and is as invisible as possible to clinical staff. Not all hospitals or C-arm models have identical network features.

*Reveal steps:* 4 (0 to 3).

### 05. ENTER KETTYBOT

[1:20–1:39] Big theatrical interruption. 'Beep… beep… beep…' Let the KettyBot prop or illustration enter. Optionally have the teammate who looks like Palmer Luckey walk across the stage in silence: 'I heard you needed autonomous systems.' This is a lookalike gag, NOT Palmer himself. The robot is the hands; IT is the brain. Play the physical-connector double entendre gently: 'I heard somebody needed a connection.' This is a proposed service concept, not a real KettyBot capability.

*Reveal steps:* 4 (0 to 3).

### 06. THE SERVICE COMES TO YOU

[1:39–1:56] State the value proposition in one line. Hospital IT or a Siemens technician manages service tasks and device identities centrally. A mobile assistant goes to a parked C-arm with the right approved physical interface. It establishes authorized connectivity, exchanges service logs, and prepares the safe part of the update process. It does not hack patient data, bypass a device login, or replace the service engineer for supervised calibration.

*Reveal steps:* 4 (0 to 3).

### 07. THE BRAIN

[1:56–2:14] This is the proposed service dashboard. We record a C-arm's device identity, version, last successful synchronization, location, and service requirements; everything shown is synthetic demo data. IT schedules tasks centrally. A robot visits where the patient does not have to. Press 'Dispatch KettyBot' for a small in-slide simulation if it helps the rehearsal. This is not connected to Siemens systems.

*Reveal steps:* 4 (0 to 3).

### 08. THE HANDS

[2:14–2:34] This is the animated proof of concept, not real robotics integration. Step 0: device is waiting. Step 1: robot gets a mission and drives to the parked C-arm. Step 2: technician-approved secure connection. Step 3: logs synced and update package prepared only when device is powered/eligible; don't pretend a machine turned off is magically online. Step 4: update classification and the right person takes ownership. The robot is the hands of the service process.

*Reveal steps:* 5 (0 to 4).

### 09. THE SAFETY BOUNDARY

[2:34–2:52] Make the safety distinction explicit. The robot may automate low-risk repeatable handling such as reaching a parked device and connecting an approved service cable. Secure remote services handle eligible logs and updates. A human must still supervise operations such as movement-sensor recalibration, ensure a clear room, and authorize release to clinical use. Authenticating and patient data access must follow hospital and Siemens policies. We don't claim unsupervised movement or a new update engine.

*Reveal steps:* 4 (0 to 3).

### 10. THE FIRMWARE EXPERIMENT

[2:52–3:15] This is the fun climax. We use the character to explain the real update sequence. Step 0: desperate v0.9. Step 1: update begins; backup and install. Step 2: suspiciously blissful v1.0—'Ahhh, operating within approved parameters.' Let it breathe for a laugh. Step 3: restoration fails; old parameters may not match. Step 4: rollback. The joke comes from an actual failure mode described in the conversation, but the character's feelings are fiction. Say the robot reports the exception, not that it magically repairs the device.

*Reveal steps:* 5 (0 to 4).

### 11. THE PLOT TWIST

[3:15–3:27] 'ERROR: backup personality incompatible with firmware.' Let the glitch hit. [Pause] 'The grin returns.' Important: this is our joke illustrating why a maintenance workflow must detect, stop, and escalate failures. We are not claiming the robot will autonomously recover from arbitrary failed updates. This is the perfect bridge to our safety argument.

*Reveal steps:* 3 (0 to 2).

### 12. REALITY CHECK

[3:27–3:47] The business model is a proposed value-added Siemens Customer Services offering, not an existing commercial product. Larger hospitals with many devices may justify a roaming robot. Smaller hospitals with decentralized IT might benefit more from a simple dedicated dock or software-only scheduling. Our MVP metrics would be connectivity events, successful log syncs, operator touches, and exception detection. We haven't measured savings. That is what the next pilot must validate.

*Reveal steps:* 4 (0 to 3).

### 13. LET CLINICIANS CARE FOR PATIENTS

[3:47–4:00] Bring cast back. Start with: 'Dashboard is the brain.' Click. 'Robot is the hands.' Click. 'Tamagotchi is the personality.' Final line: 'Let clinicians care for patients. Let service come to the machine.' Optional final surgeon line after a beat: 'We can get drinks AFTER the shift.' Don't overdo the joke. This is a concept for the hackathon, and a real device implementation would require authorization, technical verification, and clinical safety review.

*Reveal steps:* 3 (0 to 2).

## Technical appendix

### Appendix 1. SYSTEM ARCHITECTURE

Technical Q&A appendix: Proposed architecture, not a claim of any actual device API. Local device identity and service intent would be checked before approaching. Approved authentication and remote services needed. Logs and updates restricted to permitted roles. The robot operates as a physical assistant; safety-critical update execution stays in manufacturer-controlled service workflows.

### Appendix 2. ASSUMPTIONS & EXPERIMENT

Q&A: Before any real-world pilot, verify C-arm model, supported connectivity options, physical port design, power state constraints, cybersecurity certification, hospital permissions, staff workflow, navigational clearance and cost/benefit. The current mock dashboard contains synthetic records. Success criteria should be tested, not assumed.
