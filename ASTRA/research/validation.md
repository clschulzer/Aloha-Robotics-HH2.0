# ASTRA validation record

Checked 13 November 2026. This record separates executable policy tests, source-level presentation checks, and visual rehearsal. It does not establish clinical safety or working hospital/robot integrations.

## Current result

**33 tests passed, 0 failed:** 18 ASTRA engine tests and the 15 existing prototype planner tests. The stage script and executable speaker cues match exactly and describe eight contiguous scenes totaling 180 seconds.

The normal workflow, the emergency before installation, and the emergency during installation produce the expected engine states. Preparation, human approval, human start, technical completion and human handback remain distinct. A failed final check supersedes an earlier success receipt and prevents handback.

**Firefox 159.0.1 headless browser checks passed with no console errors.** The real app was exercised through WebDriver BiDi at 1440×900 and 390×844. The run produced [browser-checks.json](previews/browser-checks.json) and 23 PNG captures, covering the opening film, complete clicker sequence, presenter desk, appendix and failure paths. These are real-browser results; Happy DOM was not used.

Projector readability, live three-minute delivery, native fullscreen and the remaining checks below still require rehearsal. Screenshot capture does not by itself establish visual quality, accessibility or compatibility with other browsers.

## Commands and checks performed

```bash
node --test ASTRA/tests/engine.test.mjs \
  team-material-christian/challenge-4/klickdummy/planner.test.cjs

node --check ASTRA/app.mjs
```

Runtime: Node v24.14.1. The local executable used was `/nix/store/2bslrww4ch7my47xxwabj1qy4acq4720-nodejs-slim-24.14.1/bin/node`.

| Check | Result | What it establishes |
|---|---|---|
| ASTRA engine suite | 18 passed | Synthetic constraints, state transitions, invalidation and failure handling. |
| Existing planner suite | 15 passed | Existing baseline behavior remains intact; no original prototype files were changed. |
| `app.mjs` syntax | Passed | JavaScript parses; this is not a browser execution result. |
| HTML IDs | 88 unique | No duplicate IDs in the stage document. |
| Static `$('<id>')` references | 45 resolve | The referenced static elements exist in the HTML. Dynamically created controls are inspected separately in source. |
| HTML local resource references | All 21 resolve | Referenced scripts, style, assets and linked research files exist locally. Existence alone does not prove decodability or visual quality. |
| Copied evidence sources | Byte-identical | The two excerpts copied into `research/sources/` exactly match the corresponding original transcript files. |
| Script/cue consistency | Exact match | The JSON cue block in `research/script.md` equals the exported `STORY` in `story.mjs`. |
| Cue timing | 8 contiguous cues, 180 seconds | Timing metadata is internally consistent. Actual spoken delivery still needs rehearsal. |
| Pre-start emergency sequence | Passed | The selected appointment becomes 20:00–22:00 with Arcus, then requires preparation and fresh human approval. |
| Emergency during installation | Passed | Existing installation is preserved; no abort or forced power removal occurs; backup coordination is requested. |
| Unknown plan after start | Passed | Backup coverage becomes unconfirmed; the trace does not promise an available replacement. |
| Firefox main-stage interaction | Passed | Opening film overlay exits, the punchline appears, the early candidate is rejected, the proposal changes after an emergency, and explicit preparation/approval/start/verification/release/reveal actions complete. |
| Firefox fault interactions | Passed | Unknown clinical state blocks start; an emergency during installation keeps installation active; lost connection is visible; missing backup removes the proposal; a failed check prevents release. |
| Firefox historical emergency | Passed | Starting the later appointment after a pre-start emergency does not fabricate a new continuity alert or a sent backup request. |
| Firefox public API isolation | Passed | Mutating the object returned by `dispatch('RESET')` cannot change the app's internal phase. |
| Firefox browser logging | No errors | No error-level `log.entryAdded` records during the exercised run. This does not establish the absence of all network or browser warnings. |
| Firefox viewport captures | 23 PNGs | Desktop stage and appendix plus narrow-viewport samples are recorded in `previews/`; a physical phone and projector were not tested. |

The directly exercised successful sequences were:

```text
EMERGENCY → PREPARE → ATTEST → START → VERIFY_SUCCESS → RELEASE
PREPARE → ATTEST → START → EMERGENCY → VERIFY_SUCCESS → RELEASE
```

## Policy cases covered

- The early 17:10 candidate is rejected because the post-case handover is incomplete.
- Backup availability covers installation **and** the assumed contingency interval. A backup booked during either is rejected.
- Unknown or stale plans and emergency feeds fail closed.
- Active or unknown clinical use blocks physical preparation and start.
- Device identity, physical access, surroundings, power, network permission and connection status are independent gates.
- An unchecked, unapproved or recalled package does not pass the start gate.
- Approval binds the plan revision, device ID, package ID, selected start/end and backup. Changed timing or identity cannot reuse permission.
- A changed signal before installation withdraws readiness and approval; simply restoring a flag does not silently restore permission.
- An emergency during installation preserves the running operation and requires clinical coordination of backup.
- Lost backup readiness or stale situational data after start yields **coverage unconfirmed**, not an automatic allocation claim.
- Lost communication prevents accepting a completion receipt.
- Successful technical completion still leaves the device unavailable until human release.
- A failure during installation or final checks remains unavailable and cannot be released.
- Motion/calibration updates are excluded from this security-update demonstrator.
- Out-of-order and repeated commands cannot fabricate installation progress.
- Reducer calls preserve the previous state and produce a reproducible event trace.

## Presentation source review

The reviewed integration uses the engine's results for start-button eligibility. The clock does not dispatch a start or approval. Backward navigation and direct scene navigation do not complete or reverse the workflow. The appendix uses a separate synthetic scenario.

The source now includes an explicit **Clinical state unknown** input, visible explanations for failed appendix checks, phase-dependent availability and image descriptions, and connection status derived from the power/link/policy conditions. The rehearsal API's `getState()` and `dispatch()` return cloned snapshots, so their returned objects cannot be used to mutate internal workflow state.

The calendar also recomputes backup acceptance against the current selected slot. Once installation has started, lost readiness or stale plan/alarm data changes the backup bar to **Cover unconfirmed**, with the `coverage-unconfirmed` class. The appointment stays fixed. The second Firefox pass explicitly asserted that lost backup readiness removes the green coverage bar and displays the warning.

The second pass also exercised native ArrowRight, N, Q and Escape events. It verified that the no-eligible-window exception controls fit above the stage footer after a screenshot revealed overflow in the first pass. The revised screenshots were reviewed again. Authorization checklist text was enlarged, pending return steps gained contrast, and the connection/return headlines were kept clear of the actual transparent artwork.

The opening, film, phone, calendar, connection, authorization, return, pilot, finale, presenter desk and character appendix were visually inspected from the recorded Firefox captures. No remaining layout blockers were found in those views. The final message stays hidden on entry and appears only on the explicit final reveal cue.

`RESET` and **Start pitch** reset the simulation. They are not device recovery or cancellation procedures. The JavaScript app is entirely local and is not an authentication boundary: human roles, identity/authorization checks, live data, physical conditions and results are simulated. The trace is not a signed medical audit record.

The read-through found no current claim of a real trained agent, manufacturer integration, robotic manipulation, instant rollback, guaranteed shorter installation or zero failure risk. The named agent and companion layers are marked as proposed. Interview figures and unsupported architecture ideas are discussed with their limitations in [technical.md](technical.md).

## Reproduce the browser check

The dependency-free [browser-check.mjs](../tests/browser-check.mjs) uses Node 24's native `WebSocket` and a Firefox WebDriver BiDi session. It contains the assertions used for the recorded browser run, with configurable paths, a dynamically reported browser version, command timeouts and session cleanup. This portable harness was executed successfully for the second browser pass; the retained receipt and screenshots come from that run.

Start the server from the repository root in one terminal:

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory ASTRA
```

Start a dedicated Firefox profile in another terminal:

```bash
mkdir -p /tmp/astra-firefox-profile
firefox --headless --no-remote --profile /tmp/astra-firefox-profile \
  --remote-debugging-port 9229 about:blank
```

Run the check in a third terminal:

```bash
ASTRA_TEST_URL=http://127.0.0.1:8765/ \
ASTRA_BIDI_URL=ws://127.0.0.1:9229/session \
ASTRA_TEST_OUTPUT=/tmp/astra-browser-check \
node ASTRA/tests/browser-check.mjs
```

Use a dedicated debugging port/profile with no other active BiDi session. The harness creates and closes its test tab and session; it does not start the server or browser. `ASTRA_TEST_OUTPUT` is created automatically. If omitted, results replace the files in `ASTRA/research/previews/`. The film check includes fixed waits, so a heavily loaded machine can require investigation if timing assertions fail. No npm packages are needed.

## Remaining browser and projector QA

These checks remain unverified:

1. Run the entire pitch at the actual speaking pace with one speaker and one operator; verify the reveal timing and total three-minute delivery.
2. Verify media behavior in the intended presentation browser, particularly failure fallback, skip/replay behavior and muted playback policy. The recorded Firefox run confirms the film overlay sequence and captures a film frame.
3. Check every scene at projector resolution and viewing distance: text legibility, clipping, contrast, cable/character placement and the calendar transition.
4. Check native fullscreen, the modal appendix with assistive technology and reduced-motion preference. Native ArrowRight, N, Q and Escape worked in Firefox, but that is not a complete accessibility or native-window test.
5. Review the exported trace and linked Markdown evidence in the presentation environment. Fault controls were exercised automatically; downloaded file contents were not browser-tested.
6. Repeat image/font checks on the intended display and in another browser if it will be used for the live presentation. The captured Firefox scenes have been visually reviewed.

Passing these synthetic checks does not validate a real device update, robot dispatch, power intervention, hospital network connection, clinical approval process or recovery procedure.
