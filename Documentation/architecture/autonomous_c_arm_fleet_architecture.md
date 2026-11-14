# Autonomous Air-Gapped C-Arm CT Fleet Management & Service Architecture

**Target Domain:** Mobile Surgical Imaging Systems (e.g., Main Cart + Monitor Cart with Secondary Status Display) in Air-Gapped Department of Defense (DoD) & Restricted Clinical Facilities  
**OS & Software Stack:** Microsoft Windows IoT Enterprise LTSC, DICOM Modality Worklist (`C-FIND`), **teamplay Fleet** / **Smart Remote Services (SRS)**, ROS 2 Hardware Abstraction Layer (HAL)  
**Robotics Roadmap:** **Phase 1 (Hackathon):** Pudu KettyBot | **Phase 2 (Production):** Force-Sensing Mobile Manipulator (Arm-AMR)

---

## 1. Executive Summary & Core Problem Statement

Mobile surgical C-arm CT systems consist of a **Main Cart** (X-ray generator, flat-panel detector, Windows workstation PC, internal CAN/Ethernet buses) and a **Monitor Cart** (primary live clinical display plus a secondary status/service monitor). Deploying and maintaining these fleets inside air-gapped DoD medical facilities creates five critical operational bottlenecks:

1. **Zero Network Connectivity (RF-Silent & Air-Gapped Enclaves):** Strict DoD Risk Management Framework (RMF) and SCIF/OR rules prohibit active Wi-Fi, Bluetooth, or cellular transmitters inside restricted clinical areas. Systems cannot reach **teamplay Fleet / SRS** for log uploads or software patches.
2. **Manual Patient Worklist Entry:** Because disconnected carts cannot query the hospital Radiology Information System (RIS) over TCP/IP, clinical staff must manually type patient demographics onto the C-arm before surgery—introducing workflow delays and transcription errors.
3. **"Parked Anywhere" & Hard-Switched Off (`0 W` / `S5`) States:** Staff routinely unplug C-arms after procedures and park them in unmarked corridors or storage bays with power switched off, breaking traditional scheduled network maintenance.
4. **2-Hour Update Windows & Bricking Risks:** Standard in-place medical Windows updates take ~90–120 minutes due to write-filter servicing, cryptographic checks, and multi-controller firmware flashing—risking interrupted updates if a cart is unplugged or needed for emergency trauma.
5. **Zero Internal Modification Constraint:** Bolting internal Mini PCs or custom batteries inside an FDA/CE-cleared medical device breaks backward compatibility across hardware generations and triggers costly **IEC 60601-1** electrical safety and regulatory re-certification.

### The Core Solution: "Autonomous Pit Crew on Wheels"
Instead of modifying the C-arm internally, we move all intelligence, edge storage, and auxiliary shore power onto an **Autonomous Service Robot** paired with a **C-Arm "Tamagotchi" Digital Twin**. The robot acts as a physical, RF-silent air-gap bridge—locating parked C-arms anywhere, energizing them safely, cold-booting their Windows workstations via **Wake-on-LAN (WoL)**, harvesting telemetry logs, streaming pre-built **Native Boot `.vhdx`** updates, and injecting the day's **DICOM patient worklist** before morning surgeries begin.

---

## 2. Three-Zone End-to-End System Architecture

```text
+-----------------------------------+       +----------------------------------------+
|   ZONE 1: APPROVED DoD DMZ        |       |   ZONE 2: AUTONOMOUS SERVICE ROBOT     |
|   (Authorized Network Enclave)    |       |   (RF-Silent Inside Clinical Zones)    |
|                                   |       |                                        |
|  - teamplay Fleet & SRS Cloud     | <===> |  - Tamagotchi Fleet Engine             |
|    (Telemetry Ingest & Signed     | Dock  |  - 4-Signal Opportunity Window Gate    |
|     Golden VHDX / SRS Packages)   | Sync  |  - Offline SRS Mirror & WSUS Cache     |
|  - Hospital RIS / PACS            |       |  - Local DICOM C-FIND MWL Server       |
|    (Encrypted Daily Patient MWL)  |       |  - ROS 2 Hardware Abstraction Layer    |
|  - DMZ Charging & Sync Station    |       |  - Edge Payload (700W LiFePO4 + Linux)  |
+-----------------------------------+       +----------------------------------------+
                                                                ||
                                              Embodiment-Specific Physical Dock
                                         (KettyBot Magnetic Dock OR Arm-AMR Plug-In)
                                                                \/
                                            +----------------------------------------+
                                            |   ZONE 3: UNMODIFIED C-ARM CT          |
                                            |   (Parked Anywhere — 0 Internal Mods)  |
                                            |                                        |
                                            |  - Main Cart (Windows IoT Enterprise)  |
                                            |    * Native Boot VHDX (Slot A / B)     |
                                            |    * Protected D:\Calibration Volume   |
                                            |    * Persistent E:\Worklist Cache      |
                                            |  - Monitor Cart + Secondary Display    |
                                            |  - Clip-On Handle Badge                |
                                            |    (UWB + AprilTag + E-Ink Display)    |
                                            +----------------------------------------+
```

### Zone Breakdown
* **Zone 1 — Approved DoD DMZ / Sync Dock:** Sits inside an authorized hospital IT closet or corridor dock. Here, the robot recharges its batteries, uploads PHI-scrubbed diagnostic logs to **teamplay Fleet / SRS**, and downloads signed update packages plus tomorrow's encrypted surgical patient schedule from **Hospital RIS / PACS**.
* **Zone 2 — Autonomous Service Robot (Air-Gap Bridge):** Disables Wi-Fi/Bluetooth (**RF-Silent Mode**) upon entering restricted DoD areas. Uses a **ROS 2 Hardware Abstraction Layer (HAL)** so the exact same fleet brain runs on **KettyBot today** and a **Mobile Manipulator Arm-AMR in production**.
* **Zone 3 — Unmodified C-Arm CT (100% Backward Compatible):** Zero internal electronics added. Each C-arm wears only a passive **Clip-On Handle Badge** (coin-cell UWB tag + AprilTag fiducial + zero-power E-Ink display) and exposes its standard external AC power cord and service RJ45 port.

---

## 3. Low-Level Windows IoT Enterprise LTSC Architecture

Modern surgical imaging workstations run on hardened **Microsoft Windows IoT Enterprise LTSC**. Leveraging native Windows subsystems eliminates custom OS hacks while achieving atomic, rollback-safe updates.

```text
+---------------------------------------+         +-----------------------------------------------+
|      SERVICE ROBOT EDGE PAYLOAD       |         |    UNMODIFIED C-ARM MAIN CART (WINDOWS)       |
|                                       |         |                                               |
|  [700W LiFePO4 Inverter + Relay] -----+--(AC)-->|  [PSU 5VSB Standby Rail] (HV X-Ray Inhibited) |
|                                       |         |         |                                     |
|  [WoL Magic Packet Gen (UDP 9)] ------+-(RJ45)->|  [NDIS Ethernet NIC (HiberbootEnabled=0)]     |
|                                       |         |         | (Cold Boot Trigger)                 |
|  [SMB 3.1.1 / WinRM HTTPS Client] <===+========>|  [x86 Workstation CPU/RAM + Windows Services] |
|                                       |         |         |                                     |
|  [Pre-Built Golden VHDX Store]   =====+========>|  [NVMe SSD Storage Layout]                    |
|                                       |         |    |-- Windows Boot Manager (BCD) + UWF       |
|  [Local DICOM C-FIND Server (104)] ===+========>|    |-- Slot A: Active OS_v1.vhdx (Native Boot)|
|                                       |         |    |-- Slot B: Target OS_v2.vhdx (Robot Write)|
|                                       |         |    |-- D:\Calibration (Protected Factory Data)|
|                                       |         |    +-- E:\Worklist (Local DICOM Cache / SQL)  |
+---------------------------------------+         +-----------------------------------------------+
```

### 3.1 Why Standard Updates Take ~2 Hours & Why They Fail
1. **Unified Write Filter (`UWF`) Servicing Mode:** Clinical Windows systems protect `C:\` using `uwfmgr.exe` so runtime sessions cannot corrupt system binaries. In-place patching requires rebooting into **UWF Servicing Mode**, disabling write protection, running `TrustedInstaller` / `DISM` Component-Based Servicing (`CBS`), re-sealing BitLocker/Device Guard hashes, and rebooting again.
2. **Service Dependency Locks:** Heavy clinical `.NET` imaging pipelines, local SQL databases, and DICOM brokers lock files during live operation, causing `CBS` rollbacks if interrupted.
3. **Sequential Embedded Controller Flashing:** The Windows workstation acts as master over internal PCIe/CAN/Ethernet buses to flash firmware onto the X-ray generator, flat-panel detector FPGA, and collimator controllers with byte-by-byte verification.

### 3.2 Breakthrough: Offline Pre-Built Golden `.vhdx` + Native Boot Swap
Instead of compiling or running a 90-minute Windows Update installer on the C-arm:
1. **Offline Image Assembly (Zone 1):** While docked in the DMZ, the robot downloads a pre-patched, `Sysprep`-generalized, cryptographically signed **`OS_v2.vhdx`** golden disk image containing the updated Windows OS, `.NET` runtime, and clinical imaging binaries.
2. **High-Speed Block Stream (~5–8 Minutes):** After waking the C-arm, the robot streams `OS_v2.vhdx` over **AES-256 encrypted SMB 3.1.1** (1 Gbps Ethernet) directly into **Slot B** on the C-arm's NVMe drive alongside the currently running **`OS_v1.vhdx`** (**Slot A**).
3. **Atomic Boot Pointer Flip (`bcdboot` / `bcdedit`):** A lightweight Windows maintenance service updates the **Windows Boot Manager (`BCD`)** default entry to `OS_v2.vhdx` and reboots.
4. **Data Isolation & 30-Second Rollback:** Factory detector gain/offset calibrations (`D:\Calibration`) and the local patient list (`E:\Worklist`) reside on separate persistent NTFS partitions that mount automatically into whichever `.vhdx` boots. If post-boot self-tests fail, Windows Boot Manager automatically reverts to `OS_v1.vhdx` in 30 seconds—**zero bricking risk**, cutting total update downtime from **~120 minutes to ~25–30 minutes**.

### 3.3 Native Windows Subsystem Integration Matrix

| Workflow Task | Windows Subsystem / Protocol | Technical Implementation |
| :--- | :--- | :--- |
| **Cold-Boot from `S5` Off State** | **UEFI WoL + NDIS Power Management** | Disable Windows Fast Startup (`HiberbootEnabled = 0` in registry) so shutdown enters true `S5` rather than `S4` hibernation; enable *Wake on Magic Packet from S5* in UEFI/NDIS. |
| **Log & Tube Telemetry Harvest** | **WinRM (HTTPS) + WMI + `.evtx`** | Query Windows Event Logs, UWF overlay health (`UWF WMI`), and vendor tube/fault logs over mutually authenticated PowerShell Remoting; strip PHI before saving to robot NVMe. |
| **OS & Clinical App Updates** | **Native Boot `.vhdx` + Offline WSUS** | Stream pre-built `.vhdx` via SMB 3.1.1 for major releases; serve incremental Defender/security patches via an offline WSUS cache on the robot. |
| **Zero-Typing Patient List** | **DICOM `C-FIND` (Port 104) + NTFS/SQL** | Robot hosts a local DICOM Modality Worklist server; a scheduled Windows task on the C-arm pulls today's patients into `E:\Worklist` during the 05:30 AM patrol. |
| **Clinical Readiness Display** | **Windows Kiosk App / Tray Service** | Renders the Tamagotchi readiness banner on the Monitor Cart's secondary screen when powered on. |

---

## 4. Platform-Agnostic Robotics Strategy (ROS 2 HAL)

By decoupling fleet intelligence from physical actuation through a **ROS 2 Hardware Abstraction Layer (`ros2_control` Action API: `execute_service_dock(carm_id)`)**, the exact same software scales from today's hackathon robot to full hospital automation.

### 4.1 Embodiment A: Today's Hackathon Prototype (Pudu KettyBot)
Because KettyBot has no robotic arm, it solves power and docking without manipulating wall outlets:
* **Rear Payload Bay ("Tactical Service Backpack"):** Holds an Edge Linux Compute Node and a **700 W LiFePO4 inverter pack** (well within KettyBot's 30 kg payload capacity), keeping shore power isolated from KettyBot's drive battery.
* **Precision Reverse Magnetic Docking:** KettyBot locks onto an **AprilTag fiducial** on the Main Cart base and reverses to snap a rear spring-loaded **magnetic pogo-pin coupler** onto the cart's external AC + RJ45 adapter—delivering shore power and 1 Gbps Ethernet anywhere in the hospital.
* **18.5" Front Touchscreen:** Displays the interactive **Fleet Tamagotchi Dashboard** to clinical staff and hackathon judges.

### 4.2 Embodiment B: Future Production Platform (Mobile Manipulator / Arm-AMR)
In production, the HAL swaps to a medical AMR chassis equipped with a 6-DoF/7-DoF collaborative robotic arm (e.g., *KUKA LBR Med* or *UR5e*):
* **4-Stage Closed-Loop Wall Outlet Plug-In:**
  1. **Macro Navigation:** LiDAR SLAM + UWB handle tag locates the parked C-arm within $15\text{ cm}$.
  2. **Eye-in-Hand 6D Pose Estimation:** Wrist-mounted RGB-D camera locks onto a hospital wall power board (or AprilTag marker) to resolve $(X, Y, Z, \text{Roll}, \text{Pitch}, \text{Yaw})$ within $\pm 1\text{ mm}$.
  3. **Force-Torque Impedance Insertion:** Parallel jaw gripper with V-groove cable fingers grasps the C-arm's AC plug; a wrist **6-axis Force-Torque sensor** executes compliant spiral insertion once contact exceeds $0.5\text{ N}$, preventing pin bending.
  4. **Electrical Safety Interlock:** Solid-state relay verifies continuity and earth leakage ($< 100\ \mu\text{A}$) before energizing.
* **Three Data Transfer Options for the Arm-AMR:**
  1. **Dual-Plug Umbilical:** Arm plugs C-arm AC cord into the wall outlet, then mates a magnetic RJ45 plug from the robot into the service port ($1\text{--}2.5\text{ Gbps}$).
  2. **Power Line Communication (PLC — Single Plug):** Arm plugs the C-arm's AC cord into an onboard smart outlet equipped with a **HomePlug AV2 PLC modem**, paired with a passive inline PLC-to-RJ45 bridge clipped onto the cart's external power inlet ($500\text{ Mbps--}1\text{ Gbps}$ over one plug).
  3. **Wall Power + Optical Li-Fi / 60 GHz WiGig:** Wall outlet provides power while a directional transceiver on the robot mast beams data contactlessly with zero wall penetration.

---

## 5. End-to-End 6-Step Autonomous Workflow

1. **DMZ Sync & Tamagotchi Triage (Zone 1 $\leftrightarrow$ Zone 2):** At the charging dock, the robot uploads scrubbed logs to **teamplay Fleet / SRS**, downloads signed `.vhdx` updates and tomorrow's encrypted DICOM patient schedule, and ranks C-arm priority scores.
2. **Opportunity Window Gate (Zone 2):** Robot verifies all four safety/schedule conditions before dispatching and switches to **RF-Silent Mode**.
3. **Locate Anywhere & Optical Safety Check (Zone 2 $\rightarrow$ Zone 3):** Robot navigates via LiDAR SLAM + UWB ranging to the C-arm's handle badge. Stopping $1\text{ m}$ away, its RGB-D camera uses OCR to read the **Monitor Cart's secondary status monitor** and power LEDs (confirming `OFF` or `IDLE`) while LiDAR verifies no sterile drapes or staff are within $2\text{ m}$.
4. **Energize & Connect Data (HAL Action):** Robot docks magnetically (KettyBot) or plugs into a wall power board + data link (Arm-AMR), energizing AC shore power ($200\text{--}450\text{ W}$ workstation rail only; high-voltage X-ray generator remains inhibited).
5. **Wake-on-LAN $\rightarrow$ Atomic Sync (Zone 2 $\leftrightarrow$ Zone 3):** Once `5VSB` powers the NIC, the robot sends a UDP Port 9 Magic Packet. Windows cold-boots, uploads diagnostic logs via WinRM, pulls any staged `OS_v2.vhdx` via SMB 3.1.1, and caches today's patient list from the robot's local DICOM `C-FIND` server.
6. **Clean Shutdown & Tamagotchi Badge Update (Zone 3 $\rightarrow$ Zone 2):** Windows executes a clean shutdown, the robot updates the cart's clip-on **E-Ink handle badge** via NFC/optical pulse to *"Happy & Worklist Ready"*, disengages, and proceeds to the next C-arm.

---

## 6. The 4-Signal Opportunity Window Engine

To guarantee a C-arm is never rebooted during an emergency trauma surgery, the robot gates every dispatch and update behind four independent checks:

1. **Historical Utilization Heatmap:** Analyzes prior X-ray exposure timestamps harvested from C-arm logs to identify facility-specific dead zones (e.g., `23:00–05:00` for `.vhdx` updates; `05:30 AM` pre-shift for worklist pushes).
2. **RIS Schedule & MPPS Check:** Confirms zero procedures are `IN PROGRESS` and no scheduled cases exist within the next $120\text{ minutes}$.
3. **Secondary Monitor OCR & LED Vision:** Reads the Monitor Cart's secondary status screen and main breaker LEDs from $1\text{ m}$ away before physical docking.
4. **LiDAR Sterile-Field & Power Reserve Gate:** Confirms the room is unoccupied/unsterile and the robot's auxiliary LiFePO4 battery State of Charge (SoC) exceeds $60\%$.

---

## 7. The "C-Arm Tamagotchi" Fleet UX

Every C-arm serial number has a persistent **Tamagotchi digital twin** that translates complex biomedical/IT maintenance metrics into an intuitive health avatar visible on both **KettyBot's 18.5" touchscreen** and each cart's **Clip-On E-Ink Handle Badge**:

| Tamagotchi Vital | Underlying Engineering Metric | Autonomous Robot Action Triggered |
| :--- | :--- | :--- |
| **Hunger (Log Buffer)** | Unsynced `.evtx` event logs, error codes, and X-ray tube counters on the C-arm. | Dispatches overnight to "feed" (harvest & scrub logs for **teamplay Fleet**). |
| **Immunity (Patch Level)** | Pending **teamplay Fleet / SRS** `.vhdx` release or Windows Defender signature delta. | Schedules a shore-power WoL boot to stream `OS_v2.vhdx` and verify POST. |
| **Prep (Patient List)** | Presence of today's valid **DICOM Modality Worklist** in `E:\Worklist`. | Runs a 05:30 AM pre-op push so clinicians never type patient names manually. |
| **Energy (Tube & Battery)** | Internal transport backup battery health and X-ray tube thermal/lifecycle wear. | Flags predictive maintenance alerts in **teamplay Fleet** before an OR failure. |

---

## 8. Power Engineering, UPS Sizing & Regulatory Compliance

### 8.1 Power Consumption & Auxiliary Battery Sizing
Never route high-voltage X-ray exposure loads through a service robot or small add-on UPS—only energize the workstation/control bus:

| Operating Mode | Typical Power Draw | Auxiliary Power / UPS Spec | Notes |
| :--- | :--- | :--- | :--- |
| **Active X-Ray Exposure (Cine/Fluoro)** | $1,500\text{ W} - 2,250\text{ W}$ peak | *Inhibited during service sync* | Requires dedicated $3\text{ kVA}+$ facility isolation. |
| **Workstation Boot + Dual Displays (No X-Ray)** | $150\text{ W} - 450\text{ W}$ | **$700\text{ W}$ ($1,000\text{ VA}$) Medical LiFePO4 Inverter** | Mounted on KettyBot; easily powers 6–8 cart sync cycles per charge. |
| **Optional On-Cart Telemetry Proxy (If Used)** | $15\text{ W} - 30\text{ W}$ | **$350\text{ VA}$ ($\approx 210\text{ Wh}$) LiFePO4 UPS** | Only needed if deploying an external always-on gateway instead of robot shore power. |

**Battery Capacity Sizing Formula:**
$$\text{Required Capacity (Wh)} = \frac{\text{Average Load (W)} \times \text{Runtime (h)}}{\text{Inverter Efficiency } (\approx 0.85) \times \text{Depth of Discharge } (\approx 0.85)}$$

### 8.2 Medical & DoD Standards Alignment
* **IEC 60601-1 (Clause 16 — ME Systems):** Use medical-grade galvanic isolation ($2\times\text{MOPP}$) on the shore-power inverter and isolated RJ45 magnetics; maintain earth leakage current $< 100\ \mu\text{A}$ (normal) and $< 500\ \mu\text{A}$ (single fault).
* **IEC 60601-1-2 (EMC):** Shielded metallic enclosures and ferrite chokes on robot power electronics prevent RF/EMI artifacts on nearby flat-panel detectors.
* **IEC 62304 & ISO 14971:** Pre-built `.vhdx` cryptographic signing, `D:\Calibration` partition isolation, and automated 30-second boot rollback eliminate clinical software hazards.
* **ISO 27001 & DoD RMF:** Edge PHI scrubbing ensures zero patient identifiers ever enter **teamplay Fleet** logs; RF-Silent patrol mode satisfies SCIF/OR emission security rules.

---

## 9. Additional Breakthrough Features & Future Possibilities

1. **Predictive "Pre-Emptive Pit Stop" Routing (`teamplay Fleet` Guardian Integration):**
   * When **teamplay Fleet** predictive analytics detects early X-ray tube filament degradation or backup battery impedance drift from harvested logs, the Tamagotchi avatar automatically displays a *"Checkup Needed"* badge on the cart handle and guides clinical staff to swap in a healthy backup C-arm before a mid-surgery failure occurs.
2. **TPM 2.0 & BitLocker Zero-Trust Hardware Attestation:**
   * During each Ethernet dock, the robot queries the C-arm's **Windows TPM 2.0** PCR measurements and Secure Boot state—generating a cryptographic compliance receipt for DoD RMF cybersecurity auditors without needing live network connectivity.
3. **Surgeon-Specific Clinical Preset & Protocol Syncing:**
   * Beyond patient worklists, the robot syncs surgeon-specific fluoroscopy dose curves, collimation presets, and image-processing profiles across all C-arms in the hospital—so any C-arm wheeled into an operating room behaves identically for the scheduled surgeon.
4. **NFC / QR "Summon Pit-Crew" Nurse Trigger:**
   * Tapping a hospital badge or phone against the passive **Clip-On Handle Badge** (or pressing a button on the secondary monitor) queues an immediate priority dispatch in the Tamagotchi scheduler if an urgent add-on trauma case needs a fresh worklist or diagnostic log pull.
5. **Multi-Robot "Mothership & Scout" Swarm Scaling:**
   * In large multi-tower medical centers, a heavy utility AMR carrying multi-kilowatt battery reserves and multi-terabyte `.vhdx` storage parks in main corridors as a mobile charging/data hub, while agile **KettyBot** scouts ferry power and data into tight surgical bays.

---

## 10. Hackathon Live Demo Blueprint (KettyBot + Windows Laptop Digital Twin)

You can demonstrate the entire end-to-end architecture live without a physical C-arm CT using **KettyBot** and a **Windows Demo Laptop**:

1. **Setup:**
   * Load the **Fleet Tamagotchi Web Dashboard** onto KettyBot's **18.5" front screen** showing 3 C-arms (`C-Arm #1: Happy`, `C-Arm #2: Hungry + Unprepped`, `C-Arm #3: Low Immunity`).
   * Place a **Windows Laptop** (with Fast Startup disabled and WoL enabled) on a rolling cart with a USB-Ethernet dongle connected to a compact compute node in KettyBot's rear tray, plus a printed **AprilTag** taped to the cart.
2. **Live 3-Minute Demo Sequence:**
   * **Minute 1 (Triage & Dispatch):** Show judges `C-Arm #2` glowing red/amber on KettyBot's Tamagotchi screen (*"Missing Patient List & 48h Logs Unsynced"*). Tap **Dispatch** (or trigger automatic Opportunity Window check).
   * **Minute 2 (Autonomous Approach, Optical Gate & WoL):** KettyBot navigates to the cart, stops $1\text{ m}$ away to scan a mock secondary status display on screen, docks, and fires a real **UDP Port 9 Wake-on-LAN** packet—waking the sleeping Windows laptop live on stage.
   * **Minute 3 (Atomic Sync & Tamagotchi Level-Up):** The Windows laptop automatically runs a script that uploads mock `.evtx`/tube logs, swaps a simulated `.vhdx` version pointer, and populates a **10-patient DICOM surgical worklist** on screen—while KettyBot's 18.5" display plays the celebratory Tamagotchi level-up animation.