---
status: active
branch: feat/icon-choices
canonical: fredericrous/website-builder docs/plans/2026-10-06-icon-choice-list.md
phases: [1a, 1b, 1c, 1d]
---

# Icon choice list: the design-system slice

Pointer. The plan, its reviews and its binding implementation notes live in
website-builder (`docs/plans/2026-10-06-icon-choice-list.md`, branch
`feat/icon-picker`). This repository carries Phase 1:

- **1a**: Popover counts a nested Select/Combobox layer as inside (context
  registration); Select, Menu and Combobox `preventDefault` the Escape they
  consume.
- **1b**: ToggleGroup `wrap`, `maxRows`, roving focus; 44px coarse-pointer
  Toggles.
- **1c**: Drawer swipe-to-dismiss yields to an inner ScrollArea.
- **1d**: release 4.5.0.

Found while fixing website-builder's quick-edit card (a Select inside a
Popover lost its value); recorded here per
`design-system.gap-found-is-gap-reported`.

## Verification (observed before the push)

| check      | input                                                           | expected                                                                                                                      | actual                                                                              |
| ---------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1a         | `vitest run --project=storybook …/Popover/`                     | 8 layer cases + existing pass                                                                                                 | 14/14                                                                               |
| 1a falsify | registration disabled in `usePopoverLayer`                      | the pointer cases fail                                                                                                        | exactly Select-outside-Field, Combobox, backdrop fail (3)                           |
| 1a falsify | the new Select/Menu Escape `preventDefault` removed             | the Escape cases fail                                                                                                         | Select and Menu Escape fail; Combobox passes (it already prevented default on main) |
| 1b         | Icon choices story, fine pointer                                | viewport 118 ±2, full 1px border + `radii.sm`, #40 in view, page scroll unchanged                                             | 118px, 1px/8px, `scrollTop` 78 with #40 inside, page unchanged                      |
| 1b         | Five icons                                                      | one row                                                                                                                       | 28px                                                                                |
| 1b         | keyboard                                                        | one tab stop, arrows, Home/End, Enter                                                                                         | passes (`userEvent.tab()` in, a second Tab out)                                     |
| 1b         | `CoarsePointerRows`, CDP touch emulation at 390px               | `(pointer: coarse)` matches, viewport 174 ±2, toggle ≥ 44×44                                                                  | passes                                                                              |
| 1c         | real CDP touches, 1px radius, 390×844                           | drag up at top scrolls; drag down mid-list scrolls; drag down at top dismisses; header drag dismisses; a tap presses a toggle | all pass                                                                            |
| 1c falsify | the yield decision removed (always capture inside a scroll)     | the scroll cases fail                                                                                                         | both scroll cases fail; restored, 7/7 pass                                          |
| 1c falsify | the deferral removed (old: capture at once, buttons excluded)   | the 1c cases fail                                                                                                             | only drag-down-at-top-dismisses fails — see the Decision log on touch adjustment    |
| drift      | Toggle heights changed (28→30, 39→41, 44→48), `ROW_HEIGHT` kept | the measuring stories fail                                                                                                    | Five icons, Default size rows, Coarse Pointer Rows fail                             |
| 1c         | `MountKeepsTheDrawerStill` (drawer open on mount, #40 pressed)  | list scrolled to #40, nothing else scrolled                                                                                   | passes                                                                              |
| suite      | typecheck, lint, unit, full storybook                           | green                                                                                                                         | 0 errors; 279/279; 328/328 (55 files); gate 29 checks on 4779bbe8                   |

## Implementation review

**approve-with-changes**: round 1 (98k, 122 s), then a delta (51k, 43 s), then an extra pass the person approved (46k, 39 s), on tree `06a667f7`.
Fixed: the coarse story; touch radius; Drawer-mounted centring (it measured `offsetTop` from the panel); row heights in one module with exact checks for every size; options objects; the aria-label JSDoc; and the closing record.
deliberate: `wrap`/`maxRows` stay optional props, because the registry generator drops union and `extends` members (named by a `holds-until`).
Person's call: 1c was investigated (touch adjustment, recorded below), and its proof is falsification against its own mechanism, not against origin/main.
Next: phase 1d, the 4.5.0 release after the merge. A real-phone check (a tap presses, a short drag at the top dismisses) rides on website-builder's guided preview.

## Decision log

- 2026-10-06: tests are Storybook play functions in real Chromium, not jsdom
  unit tests as the plan wrote — the repository has no jsdom, and adding one is
  a new dependency for a weaker check (the plan's
  `pnpm test:unit -- popover-layers` therefore does not exist).
- 2026-10-06: `packages/cli/registry.json` regenerated in the same change — a
  unit test keeps it current with component props.
- 2026-10-06: **pre-existing Drawer bug fixed.** ThemeProvider's portal mount is
  null on the first render, so a Drawer open from its first render draws its
  panel inline and remounts it into the portal; `useSwipeDismiss` kept its
  listeners on the first, detached panel — swipe-to-dismiss never worked for a
  Drawer mounted open (website-builder's mobile quick card is one). The hook
  now takes the panel element, held as state through a callback ref.
- 2026-10-06: inside a `data-duro-scroll` viewport a drag starting on a button
  is decided on the first move too — Chrome's touch adjustment snaps a finger
  in a 4px gap onto the nearest toggle, so excluding buttons made
  dismiss-from-the-list impossible. A tap (under 8px) still presses.
- 2026-10-06: `wrap`/`maxRows` stay two optional props, not the discriminated
  union the implementation review asked for: the registry generator drops
  union and `extends` members from the docs the CLI and MCP serve. A
  `holds-until` comment names it.
- 2026-10-06: row heights live in `Toggle/rowHeight.ts`; Toggle's static StyleX
  styles must repeat them (StyleX cannot import a constant there). Stories for
  small, default and coarse rows measure a rendered toggle against the module
  to ±0.5px, and the drift falsification above shows each one fails.
- 2026-10-06: **why the scroll cases pass on origin/main** (investigated at the
  person's request). Chrome's touch adjustment retargets a touch inside the
  list onto a toggle — measured: CDP delivers the exact coordinates, yet the
  `pointerdown` target is a button even 1.5px into the list's 4px padding, at
  any radius, and `--disable-touch-adjustment` has no effect in
  `chromium-headless-shell`; the rows fill the viewport to within 6px, so the
  list has no larger non-button area. origin/main left button-started drags to
  the native scroll, so its "swipe steals the list's drag" bug only bit in that
  4–6px of padding — on real phones too. What 1c changes for this list is that
  button-started drags inside a scroll area now go through the first-move
  decision, which is what makes dismiss-from-the-list possible; the scroll
  cases prove that decision yields (they fail with the yield removed).
- 2026-10-06: implemented through relais (sonnet@medium; 1a blocked on no
  Chromium in the sandbox, 1b needs_decision on the regenerated registry —
  accepted, 1c blocked on Chromium); the parent ran every browser test and
  finished 1c's harness (iframe → page coordinates, touch radius).
