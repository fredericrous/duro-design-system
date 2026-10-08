---
canonical: activity-vision:docs/plans/2026-10-08-activity-vision-implementation-plan.md
phases: [1]
status: active
---

Part of [activity-vision implementation plan](https://git.daddyshome.fr/fredericrous/activity-vision/src/branch/feat/capture/docs/plans/2026-10-08-activity-vision-implementation-plan.md) (body sha `65328359b3c2`, reviewed by a 14-role panel).

This repository carries §7 step 1, as one PR: the §5 drag-and-drop contract.

- **DragDrop 5.x**, every change additive:
  - keyboard drag;
  - innermost-zone targeting;
  - rects captured at pick-up, with hysteresis;
  - `renderPlaceholder` and `onDragOver`;
  - edge auto-scroll;
  - `accepts` returning `boolean | {ok: false, reason}`;
  - explicit zone order;
  - a split registry and drag-store context;
  - announcements routed through `announce`.
- **Toast:** pauses while hovered or focused, has a close button and a `warning` variant.
- **Meter:** `role="meter"`, using the existing `meterH` token.
- **Timeline primitive:** a date axis, rows, bars with a progress fill, a today marker, selectable and droppable bars, and edge sliders.

It is released as the next free minor, and the board in activity-vision consumes that release.

## Phase 1 status

- [x] DragDrop 5.x extensions, with stories (including a perf story of 300 items) and tests
- [x] Toast pause, close and warning variant
- [x] Meter
- [x] Timeline primitive
- [x] Registry and docs regenerated, header comment and `.meta.ts` updated
- [ ] Released as the next free minor (the canonical plan records the version)

## Verification record

Observed in the worktree on 2026-10-08: Storybook dev on localhost, driven by
Playwright with real (trusted) mouse and keyboard input. Screenshots and raw
JSON are kept outside the repository, in the session's attestation folder.

| Input                                                                                  | Expected                                                   | Actual                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run typecheck` and `pnpm run lint` (the pre-commit gate, every commit)           | pass                                                       | 29 checks passed on each commit; lint 0 errors (16 warnings, all in files this PR does not touch)                                                                                                                |
| `pnpm exec vitest run --project=unit`                                                  | pass                                                       | 392 passed                                                                                                                                                                                                       |
| `pnpm exec vitest run --project=storybook` (all stories, axe as error on the new ones) | pass                                                       | 423 of 425 passed; the 2 failures were DrawerScroll drag-scroll stories (untouched by this PR) timing out under load (one at 15 s) with Storybook dev running alongside; rerun alone, DrawerScroll passed 7 of 7 |
| Mouse drag of "Write spec" below "Ship beta" (Kanban story)                            | placeholder shown, card lands last                         | placeholder "→ Next" visible mid-drag; Next = Review copy, Ship beta, Write spec                                                                                                                                 |
| Keyboard: focus "Write spec", Space, ↓, →, Space                                       | list-style announcements; focus returns to the card        | "Picked up Write spec. Next, position 1 of 3. …", "Next, position 2 of 3", "In progress, position 2 of 3", "Dropped Write spec in In progress, position 2 of 3."; focus on "Write spec"                          |
| Keyboard: Space, →, →, Escape on "Review copy"                                         | cancelled, nothing moves, focus back                       | "Done, position 1 of 1", then "Cancelled moving Review copy."; focus on "Review copy"; Next unchanged                                                                                                            |
| Mouse drag of an activity onto the "Fix login" card (nested zones)                     | the card's zone wins over its column                       | drop target `attach:d`; "Attached: Session on feat/kb → d"                                                                                                                                                       |
| Mouse drag of an activity onto a task column                                           | refusal with its reason, nothing dropped                   | live region "In progress: Drop an activity on a task to attach it", reason chip on the ghost, release → "Cancelled moving Commit 3f2a."                                                                          |
| Mouse held at the bottom edge of a 30-card scrolling column                            | the column scrolls; drop lands among the cards scrolled in | scrollTop 75 → 345 over 0.9 s; T-1 dropped at index 12                                                                                                                                                           |
| 300-card story, mouse drag across 28 cards                                             | under 5 component renders per frame                        | max 3 per frame (83 frames, real mouse; 40 frames in the play test); drag frames p50 16.7 ms, no long task (headless Chromium)                                                                                   |
| `prefers-reduced-motion: reduce`                                                       | no ghost tilt                                              | tilt wrapper transform `none` (2° rotation matrix without the preference)                                                                                                                                        |
| Toast with a 600 ms timer, hovered 1.5 s / focused 1.5 s                               | stays while hovered or focused, then dismisses             | present after 1.5 s hovered and 1.5 s focused (also with focus moved to its close button); gone 1.2 s after leaving; gone after 1.2 s untouched                                                                  |
| Toast `variant: 'warning'`                                                             | polite status, warning tone                                | `role="status"`, warning border and icon                                                                                                                                                                         |
| Meter tones story                                                                      | `role="meter"`, value text, `meterH`                       | 4 meters named, `aria-valuenow` clamped (4 of 3 → 3) with text "4 of 3, over the limit"; 6 px tall                                                                                                               |
| Timeline "GA, end" slider: ←, PageDown                                                 | value text is a date                                       | "8 Nov" → "31 Oct"                                                                                                                                                                                               |
| Mouse drag of "Load test" onto the Beta bar (Timeline as a DragDrop zone)              | dropped on the milestone                                   | Beta 4/9 → 4/10; "Dropped Load test in Beta."                                                                                                                                                                    |
