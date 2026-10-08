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

- [ ] DragDrop 5.x extensions, with stories (including a perf story of 300 items) and tests
- [ ] Toast pause, close and warning variant
- [ ] Meter
- [ ] Timeline primitive
- [ ] Registry and docs regenerated, header comment and `.meta.ts` updated
- [ ] Released as the next free minor (the canonical plan records the version)

## Verification record

| Input | Expected | Actual |
| ----- | -------- | ------ |
