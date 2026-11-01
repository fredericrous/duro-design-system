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

<!-- panel: repos=duro-design-system,gh-site-import adds=ui,ops reviewers=backend,typescript body-sha=74a5b0535904 -->
