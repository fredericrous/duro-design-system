---
status: active
branch: feat/drawer-non-modal-pane
repos: [duro-design-system, gh-site-import]
adrs:
  [
    harness.design-part (ADR-0048),
    ui.mockup-handoff (ADR-0016),
    design-system.every-measure-is-a-token (ADR-0027),
  ]
---

# Non-modal panes in Duro (#104, in full), then the theme pane on the site

## Review panel

👉 **Decide:** approve the plan as written: #104 in full (non-modal Drawer, side detents, a public `Pane`), built in Duro web and native in one PR, then the site bundle with CI. Pages switches to Actions only after you confirm (rollback in the plan).
📍 duro-design-system + gh-site-import · plan reviewed, nothing built · next: Phase 1, `Drawer` non-modal and side detents. Panel: backend (opus-5-5), typescript (opus-5-5).
**Changed by review:**

1. Native non-modal panes render in the base host with their contexts re-provided: a Dialog opened over them covers them and they don't remount.
2. Side detents are a separate `SideSnapPoint`; the public `SnapPoint` is unchanged.
3. Pages rollback, a release gate (`npm view`) and a frozen install before the site uses a Duro release.
   📄 Full reviews: `docs/plans/2026-11-01-non-modal-panes.reviews.md`.
   **Verdicts:** backend approve-with-changes (round 1), then approve on the final body; typescript approve-with-changes (round 1), then approve (round 2, one low carried). 4 findings carried into implementation.

## Context

The theme pane needs a floating, non-modal panel that takes two sizes on desktop
and two heights on phones. Duro has none: `Drawer` is always modal (`aria-modal`
hard-coded, backdrop always rendered, `ModalContext` always provided), its detents
are bottom-only (`snapPoints`, `medium | large`), and the in-flow components do
not float over the page. `fredericrous/duro-design-system#104` is the filed gap
(bottom sheet only). The person asked for all of it: #104 in full, the layout
primitive, and the side detents, built in Duro, then used on the site.

The site is plain HTML with no React and no build step. Using Duro's component
therefore needs a bundle, and the bundle needs CI.

## Decisions taken

1. **Web and native in one PR.** `Drawer.native.tsx` (491 lines) and `Pane`'s native
   file get the same API in the same PR. Each platform's behaviour is tested.
2. **Site path: a bundle of Duro's web component.** A build step in the site repo
   produces the bundle from a pinned `@duro-app/ui` version, run in CI.
3. **`Pane` is public** (`Pane.Root`, `Pane.Header`, `Pane.Title`, `Pane.Body`,
   `Pane.Footer`, `Pane.Close`, `Pane.Trigger`). The non-modal `Drawer` mode is
   built on the same internal layer, so there is one floating-panel behaviour.

## Duro design

### Behaviour (both `Drawer` and `Pane`)

- **Non-modal** (`Drawer.Root modal={false}`, and every `Pane`): no backdrop, no
  `aria-modal`, no scroll lock, no `ModalContext`. The page and anything in it stay
  interactive. Focus moves into the panel on open and returns to the trigger on
  close; focus is not trapped. Escape closes it while focus is inside: the keydown
  listener moves from `document` (Drawer.tsx:45-57) to the panel, so a Popover or
  a second pane closes alone; the scroll lock (Drawer.tsx:59-68) is gated on `modal`.
  A click outside does not close it.
- **Modal stays the default.** `modal` defaults to `true`, so no existing
  `Drawer` changes behaviour.
- **Edges:** `right`, `left` and `bottom`. The side edges are inset from the
  viewport edge and rounded (`Pane`). `Drawer` keeps its edge-flush layout. With side detents, the detent sets `width` and
  `Portal`'s `size` is ignored, with a dev warning; this is tested.
- **Detents:** `bottom` keeps `snapPoints` (`medium | large`). Side edges take
  `snapPoints` of `compact | expanded`, which map to the existing width tokens
  (`panelSm` and `panelLg`). `defaultSnapPoint` works for both. The public `SnapPoint` stays
  unchanged; a new exported `SideSnapPoint`; `DrawerRootProps` becomes a union on `anchor`,
  with a distributive Omit in `useDrawerRoot`, and `@ts-expect-error` type tests. Side detents are a
  separate `SideSnapPoint` type (the public `SnapPoint` stays `medium | large`),
  measured in px and clamped to the viewport width (panelLg 640 > a 500 px window);
  a Pane whose anchor flips right to bottom, or back, while open resets to the default detent.
- **Edge handle:** a snap panel on any edge gets the grabber. A side panel's grabber
  is vertical, and a tap steps through the detents, as the bottom grabber does now.
- **Swipe-to-dismiss** keeps working on snap panels (`useSwipeDismiss`).
- **Layer:** a non-modal panel uses `layers.floating`, not the modal layer; a Popover
  inside it is raised (`floatingRaised`), tested. It renders through the existing portal mount, so
  it escapes transformed ancestors (the case `Drawer.tsx:223` already handles).

### Files (representative)

- `packages/ui/src/components/Drawer/Drawer.tsx`, `useDrawerRoot.ts`,
  `sheetPhysics.ts` (the side-axis detent maths, pure), `useSwipeDismiss.ts`,
  `styles.css.ts`, `parts.tsx`, `Drawer.native.tsx`, `Drawer.meta.ts`.
- New: `packages/ui/src/components/Pane/` (the same layout: `Pane.tsx`,
  `Pane.native.tsx`, `styles.css.ts`, `Pane.meta.ts` with `relationship` entries
  to DetailPanel and Drawer, stories, tests). Shared logic
  lives in the Drawer's internal layer, not duplicated.
- The component list and the generated manifest (`duro list`, `duro manifest`)
  are rebuilt from the meta files.

### Tokens

No new tokens are expected: widths come from `panelSm`/`panelLg`, the inset from
`spacing.md`, radii from `radii.lg`, layers from `layers.floating`. Anything that
genuinely needs a new token is added to `@duro-app/tokens` first (ADR-0027).

### Tests

- Pure: reuse `settleDetent` and `cycleDetent` on widths; a new `detentWidth` worklet maps
  a detent to pixels over `SIZES_PX`; the mapping of `modal` to behaviour. A test asserts
  that each function the native gesture calls carries `'worklet'`.
- React: no backdrop, no `aria-modal`, no scroll lock when non-modal; modal
  unchanged; Escape closes only when focus is inside; focus returns to the
  trigger; grabber steps through side detents.
- Native: a render test shows non-modal mounts no `Modal`; the pure maths is shared. With a
  Dialog opened over a non-modal pane, the Dialog covers the pane and the pane keeps its
  state (no remount; the pane stays in the `base` host).
- Browser: a test clicks a control behind an open Pane and sees its handler fire.
- Stories: non-modal Drawer, side detents, and a `Pane` story with both sizes.

## Site design (gh-site-import, greenharness.github.io)

- **Bundle.** `site/theme-pane/` builds one JS file and one CSS file from the pinned
  `@duro-app/ui` (exact version, not a range) with esbuild. The bundle uses the dist `import`
  entry, imports `@duro-app/ui/dist/index.css`, wraps in ThemeProvider, and sets
  `NODE_ENV=production`. The peers `react`, `react-dom`, `react-hook-form` and
  `react-strict-dom` are pinned exactly; a committed lockfile with a frozen install pins
  `@duro-app/tokens`. It renders the theme
  `Pane` (desktop right, phone bottom) inside the existing `#theme` section. The
  current inline theme section is replaced, and `theme.js` keeps the state and the
  contrast guard.
- **CI.** A workflow in `greenharness.github.io`: install the pinned Duro version,
  build the bundle, run the tests (`node --test`, and a render check of the bundle
  in a headless browser), and deploy with GitHub Pages from Actions.
- **Pages source.** Switching from "deploy from branch" to "GitHub Actions" changes
  how the live site is published. That needs the person's explicit go-ahead before
  the switch (see the question in the handoff). Rollback: revert the site PR, then
  set the source back to the branch; the old theme section stays until the live URL
  check passes.

## Phases (one worktree per repo; one PR per repo; merge on green)

1. **Duro, web:** `Drawer` `modal={false}`, side `snapPoints`, the edge handle, then
   `Pane` on the same layer, with web tests and stories.
2. **Duro, native:** the same API in `Drawer.native.tsx` and `Pane.native.tsx`, with
   the shared maths tested. Same PR as phase 1. Non-modal renders through `PortalHost`,
   not `OverlayModal` (an RN `Modal` takes every touch), with a `BackHandler` for Android back.
   `Portal` carries only the theme contexts (PortalHost.native.tsx:76-79), so the portalled
   node re-provides `DrawerContext`, `TriggerRefContext`, `SheetScrollContext` and the
   in-modal context (app contexts do not cross, documented); a render test presses
   `Pane.Close` in a non-modal native Pane and sees `onOpenChange(false)`.
   The panel draws in the `base` host, never the top host, so a Dialog opened later covers it.
   Today only the top host draws entries (PortalHost.native.tsx:58), so `setEntry` gains a
   target host (`host: 'base'`) and the base host draws its own entries; a registry unit test
   (pane entry at `base` + an open Dialog host) shows the base host renders the pane and its
   mount count stays 1, and a render test asserts the Dialog draws above it.
3. **Duro release** (tag per `tag-release`, changesets publish), so the site can pin it.
   Gate: `npm view @duro-app/ui@<v> version` prints `<v>` before Phase 4; the site
   installs with a committed lockfile and `--frozen-lockfile`, and imports
   `dist/index.css` and `vars.css` in layer order (`duro doctor` clean).
4. **Site:** the bundle, the CI workflow, the theme section rebuilt on `Pane`, the
   mockup handoff section (`## Mockup`: the picked artboard beside the live
   screenshot).
5. **Close #104** with the Duro PR.

## Verification

- Duro: `pnpm -r typecheck` gives 0 errors; a non-modal story has no `[aria-modal]` and
  leaves body overflow unchanged; a modal story has a backdrop and `aria-modal="true"`;
  Tab in, then Escape, returns focus to the trigger; the stories render in a browser. Non-modal: the page behind stays clickable and the game keeps
  running; modal is unchanged.
- Site: the bundle builds from the pinned version, and CI prints its gzipped size and fails above the budget set in the PR; `node --test theme.test.mjs`
  green; a headless render of the theme pane at 1120, 500 and 320 px; the game
  still steers; the console has no error beyond the favicon; Reset gives
  `theme.json` exactly; the live URL checked after the Pages deploy.
- Native: pressing `Pane.Close` in a non-modal native Pane calls `onOpenChange(false)` once; with a Dialog opened over it, the Dialog draws above the pane and the pane mounts once (no remount).
- Accessibility: keyboard only (Tab in, Escape, focus back), touch dismissal at 320 px.

## Not in this plan

- Adding a general page-region layout container (the in-flow components cover it).
- Other Duro gaps in the list (#103 Menu context, #105 Slider, #110 List.Item).
- Changing the Pages host, the domain or the install URL.

## Handoff (open for the person)

- Confirm the switch of the site's Pages source from branch to GitHub Actions
  (a change to how the live site is published).
- The theme artboard (`docs/mockups/theme-panel/Pane.dc.html`) is committed on
  `feat/theme-panel-mockups` and is not pushed yet; the PR's `## Mockup` section
  points at it once pushed.

## Decision log

- 2026-11-01, the person: "Web PR now, native next". Phase 2 (native) is not in this PR. The repo has no React Native renderer (its native tests are Node tests, plus `typecheck:native`, a native bundle export and a native-graph check), so the plan's native render tests cannot run, and gesture and animation code would ship never run. The docs already say `modal={false}` is web only for now, and `Pane` is not in the native barrel. #104 stays open until native lands.
- What native work did land here, because it is pure and tested: portal entries can target the base host (`host: 'base'`, a `baseHost` in the registry snapshot, and `entriesForHost`, the rule `PortalHost` uses), with four unit tests covering a Dialog opened and closed over a base entry. Nothing uses it yet.
- Side detents are drawn and driven on the web only: widths measured in px from `panelSm` and `panelLg` and held to the window, a vertical grabber on the inner edge that steps on a tap. A drag does not move between side detents; swipe still dismisses.
- `Pane` is a thin composition of the Drawer's own parts through a new `placement` option on `Drawer.Portal`; `BodyProps` and `CloseProps` became exported so the composed object can be typed.
- The release is a tag, not this PR: a `v*` tag runs the publish workflow and sets the version from the tag. Latest is v5.39.0, so this is v5.40.0, tagged after merge.
- Escape stays on `document` with an `aria-expanded` guard (non-modal only), not on the panel: a Popover popup is portalled out of the panel, so a panel listener misses it. Ceiling: a focused expanded control blocks Escape in a pane; the fix is a layer registry.

## Verification (observed 2026-11-01)

| Check                        | Input                                                               | Expected                                                           | Actual                                                                                               |
| ---------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| typecheck, web and native    | `pnpm --filter @duro-app/ui typecheck`                              | 0 errors                                                           | 0 errors (and again in every commit gate, 27 to 29 checks each)                                      |
| wrong snap points fail       | `drawerTypes.type-test.ts`: `anchor="right"` with `['medium']`      | a type error                                                       | `@ts-expect-error` holds, and the matching pairs compile                                             |
| non-modal Drawer             | `DrawerNonModal.stories.tsx` in Chromium                            | no `aria-modal`, no backdrop, body overflow unchanged              | passes; the modal drawer keeps all three                                                             |
| page behind stays clickable  | `elementFromPoint` on a button behind an open non-modal drawer/pane | the button, and its click fires                                    | passes for the Drawer and for the Pane                                                               |
| Popover above the panel      | a Popover opened inside a non-modal drawer                          | the popup draws above the panel                                    | passes (the Drawer provides the raised floating layer; one doc comment changed, no behaviour change) |
| Escape                       | focus outside, then inside the panel                                | closes only with focus inside                                      | passes for the Drawer and the Pane                                                                   |
| side detents                 | `DrawerSideSnap.stories.tsx`                                        | compact `panelSm`, expanded `panelLg`, never wider than the window | passes, including at a 500 px window                                                                 |
| Pane                         | `PaneBasics.stories.tsx`                                            | opens compact, Expand steps and back, inset and rounded            | passes                                                                                               |
| base host                    | `hostRegistry.test.ts`                                              | a Dialog over a base entry leaves it mounted, top entries move up  | 7 tests pass, 4 of them new                                                                          |
| registry, lint, native graph | `build-registry --check`, `eslint`, `check-native-graph`            | all exit 0                                                         | all exit 0                                                                                           |

On the final tree, after the plan commit moved to the front of the branch: `vitest run --project=storybook` over the Pane, Drawer and Popover folders gave 10 files and 64 tests passed, exit 0.

Not observed: any native behaviour (none was written); `pnpm build` and `pnpm check:types-packed` (CI and the release run them); `duro doctor`; a keyboard-only pass in a real keyboard session (every control is a Duro Button or the Drawer's own).

## Implementation review

approve-with-changes, then a Delta: 7 findings fixed (focus in and back, Escape stories that can fail, flag arguments, size-warning story, holds-until comment, Escape guard scoped to non-modal, comment). Delta ~124k tokens, 49 s.

- deliberate: Escape stays on `document` with a guard on the focused `aria-expanded`, not on the panel as the Behaviour line said: a Popover popup is portalled out of the panel, so a panel listener would miss it.
- deliberate: the 600 ms wait in the Escape stories is a real wait: the close notice fires after the exit animation.

## Interface review

Advisory. Fixed: grabber hit width 28 px and `layers.raised`, `shadows.md` and no `maxHeight` override on a floating panel, `Pane.Expand` without `aria-expanded`, focus given back only when it is still in the pane.

- deliberate: detent widths ignore the floating inset (compact and expanded look alike below ~392 px); follow-up with the native phase.
- deliberate: two label sets (grabber, Expand) and `aria-describedby` with no Description part are the Drawer's existing shape.
- Not mine: the modal Drawer has no focus trap or restore (pre-existing).

## Outcome

The web half of #104: a non-modal `Drawer`, side detents and a public `Pane`, with their stories running in Chromium. Native, the release tag and the site are the next steps.

<!-- panel: repos=duro-design-system,gh-site-import adds=ui,ops reviewers=backend,typescript body-sha=74a5b0535904 -->
