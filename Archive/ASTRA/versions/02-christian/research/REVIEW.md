# Version 2 — review and reasoning

Source review was restarted before this build. No open pull requests remained at the checkpoint. Newly available OPUS v2 and UNITED were inspected in addition to Christian's storyboard and product demo.

## The source decision

Christian's `storyboard-pitch-v4.md` is more specific than the earlier encore. It ties the emotional connection to responsibility and prioritization, then makes timing a result of clinical operations. The service request can be declined without penalty. The same person can decline the physical trip and later approve from a phone. The final thank-you is functional closure, not a decorative mascot return.

That sequence is the reason to make this a separate version. An architecture-first rewrite would defeat its purpose.

## What was reused

The HTML, scene renderers, phone components, synthetic plan, CSS mission and checking list are copied from `CARMAGOTCHI_Web_Pitch/pitch-demo-christian/`. Refinements are in `demo/refine.css`. The embedding approach was informed by `UNITED/js/scenes/demo.js`, but here the same-origin bridge also checks its sender, preserves within-scene transitions and pauses the child animation/timer system with the parent.

OPUS v2's simpler mascot staging reinforces the restraint used here. Its new probabilistic scorer is an illustrative model, not a validated clinical prediction. We do not import its confidence percentages into this template.

## Intentional differences

The full original video takes 30.44 seconds rather than the storyboard's 20-second placeholder. The closing speeches and held screens are shortened to preserve the three-minute limit. Three moods are used, as Christian specifies. The input-led variant Ember remains available for the user's six-state performance.

The report and robot status are visibly a simulated demonstration. The fixed example does not establish a live integration. Detailed claims in other team documents, including universal remote start, instant rollback, exact battery capacity and guaranteed availability, are not adopted as verified facts.

## Visual inspection

The phone has a recognizable app layout. Priority changes are legible as two highlighted devices. The map, mission headline and progressing checks share one screen. The human start request remains separate from the robot's own readiness assessment. The final frame speaks about care rather than claimed percentage improvements.
