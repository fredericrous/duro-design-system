---
status: active
branch: feat/n0-native-checks
repos: [duro-design-system, happier]
adrs: [ADR-0016, ADR-0027]
---

# N0 — Duro's native foundation

Lands as `duro-design-system/docs/plans/2026-10-11-n0-native-foundation.md`
(first commit of slice A's branch). Pointer file of the same name in
`happier/docs/plans/`, added in the same session that implements slice A.

## Review panel

👉 **Decide:** none — approve if your review's eight changes now hold: Gesture Handler + Reanimated, a device checkpoint before each tag, resolved colours, an SVG-vs-Skia benchmark.
📍 duro-design-system (+ happier pointer) · plan reviewed, nothing built · next: slice A, native checks. Panel: backend, lang:typescript, architect, po, react, ui-design, ux-research, game-ux, tui, unix (all opus-5-5).
**Changed by review:** a standalone `examples/native` as the device harness; a host registry plus `PortalHost`; an updating scoped override `<style>`; `GestureHandlerRootView` in `OverlayModal`; VoiceOver on a physical iPhone.
📄 Full reviews: [2026-10-11-n0-native-foundation.reviews.md](2026-10-11-n0-native-foundation.reviews.md)
**Verdicts:** round 1: 10 approve-with-changes. Round 2: backend approve. Your delta: backend approve-with-changes → applied; final body: approve-with-changes, 4 findings carried into implementation.

## Context

Happier's programme plan (`happier/docs/plans/2026-10-08-happier-fork-duro-web-app.md`,
§ Amendment 2026-10-09, § N0) moves every platform to Duro, building Duro's
native layer first. That plan owns the WHY and the gates; this plan owns how Duro
gets there.

**N0.0 is green (2026-10-11).** Happier's `apps/ui` (Expo 54, RN 0.81.5,
React 19.1, New Architecture) bundles Duro 5.9.0's native barrel with `expo export`
for iOS and Android. The run established:

- the `react-native` export condition resolves to `src/index.native.ts`;
- babel-preset-expo compiles the source, and RSD's preset does nothing on native;
- the consumer pins `react-strict-dom` and `@duro-app/*` to one copy in `resolveRequest`;
- `Field` needs the `react-hook-form` peer, because Metro does not tree-shake.

**Measured starting point (this repo, `main` 421ad74f, latest tag v5.11.0):**

- **Native barrel.** `packages/ui/src/index.native.ts` exports 15 components, plus
  `ThemeProvider.native.tsx` (themes by prop; `usePortalMount()` always returns
  `null`). `platform.native.ts` sets `isNative`.
- **No native checks.** There is no native tsconfig, no RN types (`react-native`
  enters only as an RSD peer, 0.84.1 in the lock), and no Metro, Expo, example
  app or CI job. `packages/ui/tsconfig.json` typechecks the `.native` files
  against web types only.
- **Dead alias.** In `packages/ui/vite.config.ts:52-55`, `react-native` aliases to
  `src/stubs/react-native.ts`, which does not exist. Nothing imports
  `react-native` today, so the alias is latent, but the first import breaks the
  web build.
- **Web overlays.** Eight components import `react-dom` (Dialog, Drawer, Popover,
  Menu, Select, Listbox, Toast, DragDrop); Combobox gets it through Listbox. They
  `createPortal` into the ThemeProvider mount (`ThemeProvider.tsx:46-60`, a
  `position: fixed` div at `layers.portal`), or into `document.body`.
- **Shared, DOM-free logic.**
  - `Popover/position.ts` `computePopoverPosition`, a pure function;
  - `shared/ModalContext.ts` `useInModal`;
  - `hooks/useControllableValue.ts`;
  - the Toast store (`createToastStore`, `DEFAULT_DURATION`);
  - the id-based highlight logic in `useMenuRoot`, `useSelectRoot` and
    `useComboboxRoot`;
  - `LAYERS`, `DURATION_MS` and `SPACING_PX` in `@duro-app/tokens/keys`.
- **Duplicated logic.** The open/closing/timeout state machine is copied three
  times: in Dialog, Drawer and DetailPanel.
- **What blocks native, per component** (the overlay survey):
  - **Icon** draws raw `<svg>`; **Spinner** uses `css.keyframes`.
  - **Tabs** uses `querySelector`, `offsetLeft` and `ResizeObserver`.
  - **ScrollArea** uses `ResizeObserver`, pointer capture and `scrollTop`.
  - **SideNav** has a raw `<svg>` chevron and uses `querySelector`.
  - **AppShell** uses `querySelector`, `useContainerBelow` and Drawer.
  - **Tree** uses `querySelectorAll` and `document` listeners.
  - **Tag** has a raw `<svg>`. **Alert** and **Callout** are blocked only through Icon.
  - Already RN-safe: **PageShell, List, Toggle, RadioGroup, Meter, EmptyState**.
- **What react-strict-dom 0.0.55 offers on native** (latest on npm; read from
  `dist/native/index.js` and the repo docs):
  - **Missing:** `html.dialog`, `svg`, popover and any portal or modal primitive.
    `html.select` is a bare View.
  - **Styling:**
    - `css.keyframes` is unsupported.
    - Transitions are polyfilled with `Animated`.
    - `position: fixed` falls back to `absolute`.
    - `css.createTheme` is runtime on native and cascades through context, so
      overrides can be dynamic.
  - **Events:** `onKeyDown` fires only on input and textarea, and there is no
    capture phase.
  - **Refs:** a ref exposes `getBoundingClientRect` (RN DOM APIs, RN ≥ 0.82) and
    passes `measureInWindow` through.
  - **Accessibility props:**
    - `aria-modal` maps to `accessibilityViewIsModal`, which is iOS only.
    - `aria-haspopup`, `aria-controls` and `aria-activedescendant` are dropped.
  - **Focus:** `ref.focus()` on inputs is broken in 0.0.55 (#506; the fix is on
    `main`, unreleased).
- **Happier, the first consumer.** It ships `react-native-svg` 15.12.1,
  `react-native-gesture-handler` and `react-native-safe-area-context`. It also
  presents routes as native modals (`apps/ui/sources/app/(app)/_layout.tsx`).

## Decisions taken in this plan

1. **Platform files.** Following `ThemeProvider` today, `X.tsx` is web and
   `X.native.tsx` is native. Metro prefers `.native`. Vite's extension list never
   picks it. The web `tsconfig` excludes `**/*.native.*` and a native tsconfig
   prefers them (`moduleSuffixes`). This amends the happier plan's wording
   ("behind `*.web` files"); the intent stays the same: no `react-dom` on the
   native graph.
2. **Overlay mechanism on native.**
   - Interactive overlays render in RN `Modal`: Dialog, Drawer, Menu, Popover,
     and the Select/Combobox sheet. `Modal` is a real React portal, so the
     consumer's contexts flow into the content. It also stacks above
     natively-presented routes (Happier's `presentation: 'modal'`); a host at the
     app root would draw behind them.
   - Each such overlay uses `Modal` with `transparent`, `statusBarTranslucent`,
     `navigationBarTranslucent` and `animationType="none"`. Duro draws its own
     backdrop and motion: RSD transitions for Dialog, Menu and Popover, and Reanimated for every gesture-driven surface (Decision 4).
   - `onRequestClose` maps the Android back button to the dismissal that Escape
     does on web.
   - Passive surfaces go through the **portal host**: Toast, plus ActionBar later.
     - **Registry.** The root `ThemeProvider.native` owns a `HostRegistry` and
       exposes it through context to everything below it, in the app tree and in
       Modal content alike. The registry is a stack of hosts in presentation
       order.
     - **Hosts.** The root host is an absolute-fill `pointerEvents="box-none"`
       View after the app's children. Each open Duro `OverlayModal` pushes a host
       on mount and pops it on unmount.
     - **Native modal routes.** `PortalHost` is exported. A consumer mounts it
       inside a natively-presented route's layout; for Happier that is its
       `presentation: 'modal'` routes, wired in N1. While mounted, it is on the
       stack like a Modal's host.
     - **Placement.** A `Portal` renders its entry into the top host. Entries in
       one host are ordered by numeric `LAYERS`.
     - **Theme.** An entry keeps its originating theme: `Portal` captures the
       source's theme style (RSD custom properties) and its resolved colours
       (Decision 8), and re-provides them around the entry. No other consumer
       context crosses. Toast content is data rendered by the ToastProvider, so
       this is enough for Toast.
     - **What is guaranteed.** Passive entries draw above the app, above every
       open Duro Modal, and above any native modal route that mounts
       `PortalHost`. A route that mounts none hides them; the docs say so.
     - A toast raised while a Dialog is open shows above it, as on web, where
       `toast` (1060) sits above `modal` (1001). When that host pops, the entry
       re-renders into the next host down. Toast state lives in the store, so the
       countdown continues.
   - Every native overlay sends accessibility focus back to its trigger on
     close, as web restores focus.
   - `usePortalMount()` keeps its public signature, and returns `null` on native
     as before.
3. **Positioning on native.** Menu and Popover measure the trigger with
   `measureInWindow`. They then reuse `computePopoverPosition` unchanged, with the
   window size from `useWindowDimensions`. The plan assumes that with a
   translucent `Modal` these are window coordinates on both OSes. The device
   checkpoint (Verification) tests that assumption on iOS with and without a home
   indicator and on Android edge-to-edge (Expo 54's default), with and without a
   translucent status bar, instead of taking the flags as proof.
4. **Native peers: gestures on the UI thread, safe area, one icon renderer.**
   - **Gestures.** Finger tracking (sheet drag, edge drawers, Toast swipe) uses
     `react-native-gesture-handler` `Gesture.Pan` driving
     `react-native-reanimated` shared values on the UI thread. Settling uses
     `withSpring`/`withTiming`.
     - PanResponder is ruled out: native-driver `Animated.event` does not work
       with it, so tracking would run on JavaScript (RN 0.81 animation caveats).
     - A gesture-driven surface (sheet, drawer, Toast) and its backdrop run enter, drag and exit wholly in Reanimated on `Animated.View`, never on RSD transitions on the same node. Fades without a gesture keep RSD transitions.
     - Happier ships gesture-handler ~2.28, Reanimated 4.3 and worklets 0.8. In
       SDK 54, babel-preset-expo adds the worklets plugin for the files Metro
       compiles, Duro's source included; `examples/native` proves it.
   - **Safe area.** `react-native-safe-area-context` (Happier ~5.6) supplies
     insets.
     - Duro reads `SafeAreaInsetsContext`, which requires the consumer's
       `SafeAreaProvider`; expo-router mounts one.
     - Modal content is a React portal, so the same provider's window insets
       reach sheets and toasts inside `OverlayModal`.
     - With no provider, insets are zero and a development warning names the
       missing provider.
   - **Icon renderer** (Decision 9): `react-native-svg` or
     `@shopify/react-native-skia`. Happier ships both (15.12.1, 2.2.12). One is
     chosen by measurement in slice A, and only that one becomes a peer.
   - **How the peers are declared.** Each is an **optional** peer
     (`peerDependenciesMeta`), imported only from `.native` files. `react-native`
     and `react-native-worklets` join them. Metro does not tree-shake, so on native all of them are required; the README's React Native section lists them.
     - ADR-0001 holds: the native entry is its own export condition, where these
       are the platform, and no web root import reaches them.
     - The Vite guard (Slice A item 5) rejects `react-native`,
       `react-native-*`, `@shopify/react-native-skia` and `react-native-svg` on
       the web graph.
     - Slice A's PR carries the `change.a-new-dependency-is-owned` argument for
       each peer.
5. **Phone behaviour** (the person's answers, 2026-10-11):
   - **Drawer bottom sheet: snap points.** `Drawer.Root snapPoints` takes detent
     keys (`'medium'` 50 % of the window, `'large'` the window minus the top safe
     inset). Dragging moves between detents, and dragging below the lowest one
     dismisses. A backdrop tap or Android back also dismisses. Content scrolls
     inside the sheet at its detent.
     - A grabber sits at the sheet top, sized by new `sheetGrabberW` and
       `sheetGrabberH` size tokens with the design's values. Release snaps by
       velocity as well as distance.
     - A visible close button, and a grabber that cycles detents on tap or by
       accessibility action, give a non-drag path (WCAG 2.5.7). The drag starts
       on the grabber and header, or on the content only when it is scrolled to
       the top.
     - No haptics: they would add a dependency.
     - The same prop works on web for `side="bottom"`, where `snapPoints` replaces the `85vh` panel cap.
     - Left and right drawers stay full-height panels with swipe-to-dismiss
       (AppShell's SideNav on phones).
     - Without `snapPoints`, a bottom drawer keeps today's content-height
       behaviour on both platforms.
     - Detent fractions are window-relative units (`%`), which ADR-0027 allows.
       No pixel literal is introduced.
   - **Tooltip on touch: no bubble.** `Tooltip.native.tsx` draws nothing. Its
     text becomes the trigger's accessibility hint. RSD 0.0.55 maps neither
     `accessibilityHint` nor `aria-description`, so the gap is filed upstream in
     react-strict-dom (`aria-description` → `accessibilityHint`). Until it ships,
     Duro triggers (Button, Toggle, the Menu and Popover triggers) read the hint
     from a Tooltip context and set it on their own host element, never on a
     wrapping View. RSD's native prop list drops `accessibilityHint` on `html.*` (dist/native/index.js:2451-2500), so each trigger's `.native` file renders an RN `Pressable` host carrying `accessibilityHint`, shown working with VoiceOver and TalkBack in B's device checkpoint. A non-string `content` gives no hint. Tooltip content must be
     non-essential, since sighted touch users never see it, and icon-only
     triggers keep their `aria-label`, as on web; the story and the docs say so.
   - **Select and Combobox on phones open as a bottom sheet.** Both open in a
     Drawer with `snapPoints={['medium','large']}`. Select lists the options.
     Combobox pins its search Input at the top with the filtered list below, so
     the keyboard never covers the list. The id-based highlight and filter logic
     is shared with web.
6. **Native keyboard semantics are not ported.** RSD drops `onKeyDown` on non-input
   elements. Arrow-key, typeahead and roving-focus behaviour therefore stays web
   only. Native gets the screen-reader contract instead: roles, states,
   `accessibilityViewIsModal`, and focus sent to the overlay on open
   (`AccessibilityInfo.sendAccessibilityEvent(node, 'focus')`).
7. **Releases and pull requests.** Slices A, B and C each ship as one PR and one
   minor release (`work.one-implementation-pr-per-repo-per-plan` exception,
   recorded in the Decision log). The plan stays `active`, naming the next
   slice, until C closes it. No tag before that slice's device checkpoint
   (Verification) passes.
8. **Resolved colours on native.** A `ColorKey` is a name. RSD's native token
   values are `var(--…)` references, resolved only inside RSD styles. Raw native
   hosts (the Icon renderer, Reanimated-animated backdrops, `Pressable` hosts)
   therefore need real colour strings.
   - `ThemeProvider.native` provides `useResolvedColors(): Record<ColorKey,
string>`. It is built from the selected theme's raw palette in
     `@duro-app/tokens/raw` (`darkColors`, `lightColors`, `highContrastColors` (raw.ts:308), kept in step by `check-token-drift`), merged
     with the provider's `overrides` (slice C).
   - A nested `ThemeProvider` replaces the context for its subtree. Modal
     content inherits it, because Modal is a React portal. Passive host entries
     get it re-provided (Decision 2).
   - It ships in slice A (Icon needs it), and slice C adds the overrides.
9. **Icon geometry, renderer by measurement.** The icon tables
   (`Icon.tsx:65`…) are JSX circles, lines, rects, polygons and paths, not only
   path strings.
   - They become renderer-independent geometry in `Icon/geometry.ts`: shapes with
     stroke width, caps, joins, fill and cutouts (even-odd or masks).
   - Web renders SVG from that geometry, and the Storybook visual suite proves
     the output unchanged.
   - Native renders it with the renderer slice A's prototype picks:
     `react-native-svg` `Svg`/`Path`/`Circle`…, or Skia `Canvas`/`Path` (SVG path
     notation). Colours come from `useResolvedColors`.
   - **Prototype.** `examples/native` gains a benchmark screen, run as release
     builds on an iOS simulator and an Android emulator, plus one physical
     device each when available. It measures:
     - a dense scrolling list of 500 rows with 3 icons each (frame time and
       dropped frames while flinging);
     - a theme switch with the list mounted;
     - mount time of the list;
     - memory after mount.

     Frames come from `dumpsys gfxinfo` (Android) and Instruments (iOS). Skia wins only if its median of 3 is ≥ 10 % better and outside SVG's min–max range.
     Otherwise `react-native-svg` stays: one view per icon and no canvas per
     icon. The numbers and the choice go in the Decision log.

   - Interaction and accessibility stay on the control hosting the icon, and
     the icon itself is hidden from accessibility.

10. **Shared logic is extracted before reuse, not assumed portable.**
    - `useSelectRoot`, `useMenuRoot` and `useComboboxRoot` order items with
      `compareDocumentPosition` (for example `useSelectRoot.ts:66`) and move DOM
      focus.
    - Each is split into a pure state module (open, highlight, selection,
      filter, over an ordered id list) and a platform adapter. On web the adapter
      handles DOM registration, document-order sorting, keyboard and focus. On
      native it uses registration order, `onPress` and accessibility focus.
    - Web Storybook interaction tests guard each split.
    - Native refs come first: `Button.tsx:54` discards its ref on native today (doc comment at lines 27-28),
      so slice A forwards it to the native host (used for focus restore and
      `measureInWindow`). The Toggle and the Menu, Popover and Select triggers
      follow in the slice that ports them.

## Non-goals

- No broad device suite, RNTL suite or screenshot catalogue. Each slice runs a
  focused iOS and Android checkpoint before its tag (Verification). Happier's
  native release checkpoint still covers its own screens, and faults found there
  come back to this repo as fix PRs.
- Not ported to native in N0: Table and VirtualTable, DragDrop, DetailPanel,
  ColorInput, FileTrigger, CodeBlock, Toolbar, ButtonGroup, ToggleGroup, TagGroup,
  Breadcrumb, TableOfContents, Timeline and `ui-email`. They stay out of the
  native barrel until a Happier screen needs one.
- No hardware-keyboard navigation on native (Decision 6).
- No Happier-side wiring. The Metro pin, the theme mapping file and the
  FlashList leaf belong to N1 and M1–M2 in `happier`.
- No migration of application-landscape's hash-dependent theme generator to the
  new override prop. That is a follow-up issue, filed when C ships.
- No RSD upgrade. 0.0.55 is the latest release. The #506 `focus()` workaround
  (`getNativeRef().focus()`) is used where native code needs focus, behind one
  helper. Its `holds-until:` comment names the RSD release that ships #515.

## Behaviour

### Slice A — 5.12.0, the gate to N1 (N0 items 1, part of 2 and 3)

1. **Native typecheck.** Add `packages/ui/tsconfig.native.json`, checked with
   `pnpm --filter @duro-app/ui typecheck:native`. The ui `typecheck` script becomes `tsc --noEmit && tsc --noEmit -p tsconfig.native.json`, so the root `pnpm -r run typecheck` and the amont pre-commit run it; the root gains a `typecheck:native` alias. The pre-commit time before and after is recorded.
   - It includes `src/index.native.ts` and its graph only.
   - Compiler options: `customConditions: ["react-native"]`,
     `moduleSuffixes: [".native", ""]` and `types: ["react-native"]`.
   - `lib` is `["ES2022"]` with **no DOM**. Any `document`, `window` or
     `HTMLElement` value use on the native graph is then a type error; type-only
     `HTMLElement` mentions come from `@types/react`'s global stubs.
   - `paths` maps `react-dom` to `src/native-guard/react-dom.d.ts`, an empty
     module, so a `react-dom` import on the native graph fails to typecheck.
     `paths` replaces the parent's object, so it repeats
     `@duro-app/tokens: ["../tokens/dist/index.d.ts"]`; the `native` CI job
     builds `@duro-app/tokens` before `typecheck:native`.
   - `react-native` 0.81.5 (Happier's version, the floor we support) is added as
     a devDependency for its types; `pnpm why react-native --filter @duro-app/ui`
     must show this one version, since RSD's native `.d.ts` imports `react-native`
     through its peer. Root `pnpm install` time on CI before and after is recorded in the PR. The web `tsconfig.json` excludes `**/*.native.*`.
2. **Native graph lint.** `scripts/check-native-graph.mjs` takes the file list
   from `tsc -p tsconfig.native.json --listFilesOnly` and runs ESLint over it,
   not a second JSX parser. It fails on any:
   - lowercase JSX intrinsic (`<svg>`, `<div>`) in a file under `src/`, found by
     the existing `duro/no-raw-html-element` rule in a new `svgExempt: false`
     mode (today it skips `<svg>` subtrees);
   - and, through `no-restricted-syntax` and `no-restricted-imports` in the same
     pass:
   - `css.keyframes` call;
   - `animationName` key;
   - `react-dom` import specifier in any form (side-effect, namespace or named),
     which the empty-module guard misses for the first two.

   It exits 2, with a message on stderr, when `tsc` exits non-zero or the list lacks `src/index.native.ts`. It exits 1 on violations, one line each on stderr:
   `<repo-relative path>:<line>:<col> <form> — draw it with html.* / Icon, or move
it into X.native.tsx`. A clean graph prints nothing and exits 0.
   The lint runs in `pnpm lint`. These faults bundle fine and crash only on a
   device; for example, Checkbox's web branch draws a raw `<svg>`, kept off native
   only by its `isNative` branch. Slice A therefore splits Checkbox into `Checkbox.tsx` / `Checkbox.native.tsx` (the `isNative` branch moves), so the check is green on today's barrel; any other guarded intrinsic the first run finds is split the same way, never allow-listed. The script's own test feeds it a fixture with
   each forbidden form.

3. **Bundle check and device harness.** `examples/native`: a standalone Expo 54
   app with Happier's native versions (RN 0.81.5, React 19.1, expo-router 6,
   react-native-screens, gesture-handler, Reanimated 4 + worklets,
   safe-area-context, react-native-svg 15.12.1, Skia 2.2.12).
   - expo-router gives it a `presentation: 'modal'` route, the case Decision 2
     guards. Its screens are the device checkpoint scenarios (Verification) and
     the icon benchmark (Decision 9).
   - Its `metro.config.js` pins `react`, `react-native`, `react-strict-dom` and
     `@duro-app/*` to one copy, like Happier's `resolveRequest`.
   - `App.tsx` renders every value export of the native barrel.
   - `examples/native/test/exports.test.ts` fails when the barrel exports a name
     that `App.tsx` does not render. `vitest.config.ts`'s `unit` include gains `examples/*/test/**/*.test.ts` (today `packages/*` only).
   - `pnpm native:export` runs `expo export --platform ios --platform android`.
   - It is NOT a workspace member (`pnpm-workspace.yaml` stays `packages/*`): it has its own `pnpm-lock.yaml` and links `packages/ui` and `packages/tokens` with `link:`, so Expo never enters the root lock or the four existing CI installs. pnpm's `node-linker` is workspace-root only, so if isolated installs fail, `node-linker=hoisted` goes in the example's own root `.npmrc`. Whichever works is recorded.
4. **CI.** A `native` job in `.github/workflows/ci.yml`, after `validate`, with
   `CI=1`, installs the root (`pnpm install --frozen-lockfile`) and the example (`pnpm install --frozen-lockfile --ignore-workspace --dir
examples/native`; the root `native:export` script passes `--ignore-workspace` too), then runs `pnpm typecheck:native` and `pnpm native:export`.
   - Its install and export time is measured from a cold and a warm cache and
     recorded in the PR. `timeout-minutes` is twice the cold time (20 until
     measured).
   - A content-based path filter skips it when no file under `packages/ui/src`,
     `packages/tokens/src`, `examples/native`, `packages/ui/package.json`, `packages/ui/tsconfig*.json`, `pnpm-lock.yaml`, `scripts/check-native-graph.mjs` or `.github/workflows/ci.yml` changed. The filter fails open,
     and a skip is green.
   - It is not attested away (`ci.laptop-attests-no-artifact`: build-as-check
     runs in CI).
5. **Vite alias.** Delete the dead `react-native` alias and replace it with a
   10-line Vite plugin.
   - Its `resolveId` rejects `react-native`, `react-native-*`,
     `@shopify/react-native-skia` and `react-native-svg`. For example it raises
     `react-native reached from the web
graph via <importer> — move the import into a .native.tsx file`, with the
     importer relative to the repo.
   - `@react-native/assets-registry` keeps its existing stub.
   - The plugin lives in a shared module and is also registered in `.storybook/main.ts` `viteFinal`, which never loads `packages/ui/vite.config.ts`.
   - `pnpm build` and `pnpm build-storybook` stay green.
6. **Portal host, resolved colours, safe area.**
   - `ThemeProvider.native.tsx` gains the `HostRegistry` (Decision 2), whose
     stack holds host ids in presentation order, and renders the root
     `<PortalHost/>` after its children. It also provides `useResolvedColors`
     (Decision 8).
   - `shared/portal/Portal.native.tsx` renders into the top host and re-provides
     the source's theme style and resolved colours.
   - `shared/portal/OverlayModal.native.tsx` wraps RN `Modal` with Decision 2's
     flags, wraps its content in a `GestureHandlerRootView` (RNGH: Modal on Android needs its own), and pushes its own host. The root host relies on the consumer's root `GestureHandlerRootView` and warns in development without it.
   - `PortalHost` is exported for native modal routes.
   - `shared/safeArea.native.ts` reads `SafeAreaInsetsContext`. Without a
     provider it returns zero insets and warns in development.
   - Layer order comes from `LAYERS` (`@duro-app/tokens/keys`); nothing reads
     `layers.*` vars for a z-index on native.
7. **Shared open state.** `shared/useOverlayOpenState.ts` holds
   `open`/`closing`/`onOpenChange`, the `DURATION_MS` close timer and
   controlled/uncontrolled handling. It replaces the three copies in Dialog,
   Drawer and DetailPanel on web, and native uses it too. Two fixes ride with it: `requestClose` does nothing while `closing` (today a second call fires `onOpenChange(false)` twice, Dialog.tsx:117-125), and a controlled `open` going false plays the exit animation (today a no-op effect, Dialog.tsx:127-132).
8. **Dialog** and **ConfirmDialog** on native.
   - The parts that are pure `html` (Header, Title, Description, Body, Footer and
     Close) move to `Dialog/parts.tsx`, shared by both platforms.
   - `Dialog.tsx` (web) keeps `createPortal`. `Dialog.native.tsx` renders the
     panel in `OverlayModal`.
   - On native: backdrop press and Android back close it, when dismissible;
     `aria-modal` is set; focus goes to the panel on open and back to the
     trigger on close (`sendAccessibilityEvent(trigger, 'focus')`). The panel
     avoids the keyboard (`KeyboardAvoidingView` inside the Modal), and its Footer
     stays visible (ConfirmDialog's phrase Input). Enter and exit use
     opacity and translateY transitions over `DURATION_MS[closeAnimationDuration]`.
   - `ModalContext` is provided so a nested Popover picks the `popover` layer.
   - **Button** forwards its ref to the native host (today `Button.tsx:54`
     discards it), so Dialog.Trigger can restore focus to it.
9. **Icon.** Decision 9: geometry in `Icon/geometry.ts`, the web SVG output
   regenerated from it, and the visual suite unchanged.
   - `Icon.native.tsx` draws it with the renderer the benchmark picks, at the
     `ICON_SIZES` token sizes.
   - The colour is an explicit `color` (a `ColorKey`), resolved through
     `useResolvedColors`. Alert, Callout, StatusIcon and Tag pass it on native.
   - **StatusIcon** follows.
10. **Spinner.** `Spinner.native.tsx` rotates the same bordered ring with a
    Reanimated `withRepeat(withTiming)` on the UI thread at the same period,
    `role="progressbar"` and the label.
11. **Barrel additions.** Add these exports, which are RN-safe already or become
    so through Icon: Dialog, ConfirmDialog, Icon, StatusIcon, Spinner, PageShell,
    List, Toggle, RadioGroup, Meter, EmptyState, Alert and Callout.
12. **Registry.** `packages/cli/scripts/build-registry.mjs` also reads
    `src/index.native.ts` and records `native: true|false` per component.
    `duro <Name>` shows it, and `--check` fails when it is stale, so an agent is
    never sent to a component the native barrel lacks.

### Slice B — 5.13.0, the gate to M1 (the rest of items 2 and 3)

1. **Drawer.**
   - `Drawer.native.tsx` renders in `OverlayModal`.
   - Left, right and bottom edges are supported. Swipe-to-dismiss and the snap
     drag use `Gesture.Pan` and Reanimated shared values (Decision 4). They port
     `useSwipeDismiss`'s thresholds, which move to a shared constants module.
   - The bottom sheet's `'large'` detent subtracts the top safe-area inset
     (`shared/safeArea`).
   - `snapPoints` follows Decision 5 on both platforms. On web it extends
     `useSwipeDismiss` for `side="bottom"`, with a Storybook story and an
     interaction test.
2. **Menu** and **Popover.**
   - Both render in `OverlayModal` (transparent, a backdrop press closes them),
     placed by `computePopoverPosition` from `measureInWindow` on the forwarded
     trigger ref.
   - `useMenuRoot` is split first (Decision 10): pure state plus a web and a
     native adapter.
   - On native, `Menu.Item` activation closes the Menu, then calls `onSelect` after its Modal has dismissed (`onDismiss` on iOS), where web calls
     `element.click()`. An item that opens a Dialog would otherwise present during a dismissal, which UIKit drops. `examples/native` renders this case for B's device checkpoint. `Menu.LinkItem` calls `onNavigate(href)` (ADR-0002); with
     no `onNavigate`, it opens the URL with `Linking.openURL`.
   - Popover is non-modal on web and modal on native. On native, Popover keeps
     `useInModal()` true for its content.
3. **Tooltip.** `Tooltip.native.tsx` follows Decision 5: no bubble, a string
   content becomes the hint that Duro triggers set on their own host element
   (through a Tooltip context), and the Trigger renders its child in place. The
   RSD issue is filed in this phase.
4. **Toast.**
   - `ToastProvider.native.tsx` reuses `createToastStore`, `DEFAULT_DURATION` and
     the countdown.
   - It renders its region through `Portal` at `LAYERS.toast`, at the bottom
     edge, offset by the bottom safe-area inset.
   - The swipe uses `Gesture.Pan`, and the colours come from
     `useResolvedColors`.
   - `role` and `aria-live` are kept, which RSD maps to `accessibilityLiveRegion`.
   - A press pauses the countdown, as hover does on web. A close button is
     always rendered, and a horizontal swipe dismisses.
   - The countdown also pauses while a screen reader is on
     (`AccessibilityInfo.isScreenReaderEnabled`, WCAG 2.2.1).
   - The remaining time and the paused state live in the toast store, keyed by
     id, so a toast that changes host when a Dialog closes keeps its countdown.
   - The region sits above the keyboard and above the topmost open sheet.
5. **Tag.** The remove glyph is drawn by `Icon` on both platforms, and the web
   look stays the same.
6. **SideNav.** The chevron is drawn by `Icon`. On native, the active-item marker
   comes from props and state rather than `querySelector`. The section and group
   disclosure is shared.
7. **Tabs.** The indicator is placed from each tab's `onLayout` (native) or
   `offsetLeft` (web), behind a small `useTabIndicator.native.ts` /
   `useTabIndicator.ts` pair. Selection logic is shared.
8. **Tree.** The expand, collapse and select state and `aria-level` are shared.
   The keyboard handlers stay in the web file only (Decision 6).
9. **AppShell.** On native, the rail is always the Drawer (phones are below every
   `collapseBelow`).
   - Its Menu button opens the left Drawer, and the skip link is omitted.
   - `brand`, `Rail` `footer`, `Header` and `Main` keep their API.
   - `useContainerBelow` gets a `.native` variant that uses `onLayout` width.
10. **Split pane (web, a Duro gap).** `SplitPane.Root`, `SplitPane.Pane` and
    `SplitPane.Handle`:
    - a pointer- and keyboard-resizable separator (`role="separator"`,
      `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-orientation`, an `aria-label` prop, `aria-controls` for the primary pane, arrow keys plus Home/End);
    - min and max sizes taken from size tokens;
    - collapses to one column below a breakpoint key on its own container
      (`useContainerBelow`).

    On native it renders the panes stacked with no handle, which is the phone
    single-pane behaviour. It replaces the `split-pane` recipe's hand layout, and
    the recipe is updated.

11. **VirtualList (web, a Duro gap).**
    - A generic windowed list on `@tanstack/react-virtual`, an existing
      dependency: `items`, `estimateSize` (a size key),
      `renderItem(item, index)`, `getKey` and an `overscan` count.
    - It has an accessible `role="list"` and `listitem` wrapper (each row has `aria-setsize={items.length}` and `aria-posinset`), and pins to the
      bottom (`anchor="end"`) for a transcript.
    - It is not exported on native. Happier hosts FlashList or Legend list behind
      its own `*.native.tsx` leaf, as the happier plan says.
12. **Barrel additions.** Drawer, Menu, Popover, Tooltip, Toast, Tag, SideNav,
    Tabs, Tree, AppShell and SplitPane. Badge is already exported.

### Slice C — 5.14.0, the gate to M2 (items 2 pickers, 3 rest, 4)

1. **Select** and **Combobox** on native follow Decision 5: a bottom sheet with
   `snapPoints={['medium','large']}`. `useSelectRoot` and `useComboboxRoot` are
   first split into pure state and platform adapters (Decision 10). The web
   adapter keeps `compareDocumentPosition` ordering, keyboard and focus. The
   native one uses registration order, `onPress` and the trigger ref.
   - Combobox's Input is pinned at the sheet top, and opening the sheet focuses
     it, through the #506 focus helper. The Combobox sheet opens at `'large'`
     and avoids the keyboard, so results stay visible.
   - `Combobox.Empty` shows under the Input when nothing matches. An empty Select
     shows the List empty state.
   - **Listbox** gets a `.native` variant: a plain list with no anchor positioning,
     used inside the sheet.
2. **ScrollArea.** `ScrollArea.native.tsx` maps Root and Viewport onto RN
   `ScrollView`, with the platform scroll indicator. Scrollbar and Thumb render
   nothing on native. `maxHeight` keeps its token keys.
3. **Form and Field subpath.** `./form` gains a `react-native` export condition
   pointing to `src/form.native.ts`.
   - On native, `Button type="submit"` inside `Form` calls the form's
     `handleSubmit`, because there is no DOM submit event; this goes through a
     `FormSubmitContext`.
   - `Field` keeps its react-hook-form binding. `react-hook-form` stays a
     required peer (documented for native consumers in the README's new
     "React Native" section).
4. **Runtime theming, both platforms.**
   - **Overrides.** `ThemeProvider` gains
     `overrides?: Partial<Record<ColorKey, string>>`, keyed by token keys from
     `@duro-app/tokens/keys`.
     - On native it becomes a runtime `css.createTheme(colors, overrides)`
       applied after the base theme, so it cascades through RSD context.
       `useResolvedColors` merges the same overrides, so raw hosts (icons,
       animated backdrops) follow.
     - On web, the provider renders an **ordinary, updating** scoped `<style>`
       element: no `href` or `precedence`, because React's hoisted style
       ignores later prop changes. Its text is
       `[data-duro-theme="<useId>"] { --<hash>: <value> }`, and it re-renders
       when `overrides` change. With no overrides it renders nothing.
     - The hashed names are read at runtime from the compiled `colors` object
       (`'var(--bg-x…)'`), so nothing outside Duro depends on a hash. The
       `--duro-*` aliases follow, because they reference those vars.
     - Each value is checked with `CSS.supports('color', v)` and dropped if it
       fails, so no override can break out of the rule.
     - `data-duro-theme` is stamped on the provider's own `data-theme` element (ThemeProvider.tsx:58), where the `--duro-*` aliases are re-declared, so they follow. A nested provider's own `useId` makes the inner overrides win in its subtree.
     - The raw `<style>` lives only in the web `ThemeProvider.tsx`, with a
       one-line reason beside the `no-raw-html-element` exemption.
   - **Colour mode.**
     - `ColorMode` gets a native variant. `'system'` follows RN `Appearance` and
       `useColorScheme`.
     - Persistence is the consumer's on native: a controlled `mode` plus
       `onModeChange`, with no localStorage.
     - Switching changes the provider's style array; no key changes, so nothing
       re-mounts.
   - **Token gaps.** Phase C0's inventory maps Happier's colour tokens
     (`apps/ui/sources/theme/tokens`, about 122) to Duro `ColorKey`s and lists
     those with no counterpart; the table is committed in this plan's Decision
     log. Each missing one is added to `colors.css.ts`, `light.css.ts`,
     `high-contrast.css.ts`, `raw.ts` and `keys.ts` in C3, with the values the
     person supplies in C0 (`a-missing-token-is-added-not-approximated`).
5. **Barrel additions:** Select, Listbox, Combobox, ScrollArea and ColorMode,
   plus the `./form` native entry.

## Phases

- [x] A1 Native typecheck, the graph lint, the Vite alias plugin
- [x] A2 `examples/native` (expo-router modal route, native peers), the exports test, `native:export`, the CI `native` job
- [x] A3 Host registry and `PortalHost`, `OverlayModal`, resolved colours, safe area, `useOverlayOpenState` (with the web refactor), Button native ref
- [x] A4 Icon geometry and the SVG-vs-Skia benchmark, Dialog and ConfirmDialog native, Icon and StatusIcon, Spinner, barrel, device checkpoint A → **release v5.12.0**
- [x] B0 Mockups (ADR-0016): `duro mockup seed` 2–4 directions each for the snap sheet (grabber, detents, close button), the native Toast and the SplitPane handle; the person picks, and the picks go in the Decision log
- [x] B1 Drawer native and `snapPoints` (both platforms)
- [x] B2 Menu, Popover, Tooltip, Toast native
- [x] B3 Tag, SideNav, Tabs, Tree, AppShell native
- [ ] B4 SplitPane and VirtualList (web), barrel, device checkpoint B → **release v5.13.0**
- [ ] C0 Mockups and token inventory: Select and Combobox sheet directions (empty and long lists), the person picks; Happier's colour tokens mapped to `ColorKey`s (doc only), gaps counted, the person supplies the gap values
- [ ] C1 Listbox, Select, Combobox native sheets
- [ ] C2 ScrollArea native, the `./form` native entry and submit context
- [ ] C3 Theme overrides (both platforms), ColorMode native, the token additions sized in C0, device checkpoint C → **release v5.14.0**

Before each tag, a guided Storybook preview of the slice's web-visible changes (steps, expected result, screenshots) is shown to the person (`work.preview-before-publish`); no tag before their go. Each release goes through the `tag-release` skill (`v*` tag → `release.yml`
publishes all packages), then is verified on npm (`npm view @duro-app/ui@5.1x.0
version`), and `npm pack @duro-app/ui@5.1x.0 --dry-run` lists that slice's `.native.tsx` files. A web regression is rolled back by a revert published as `5.1x.1`. Happier takes it in N1, M1 or M2 by raising its `@duro-app/ui` range;
that work is Happier's, not part of this plan.

## Verification

Every entry records input → expected → actual in the slice's PR body before its push.

**Each slice:**

- `pnpm typecheck`, `pnpm typecheck:native`, `pnpm lint` (with the native graph
  check) and `pnpm test:unit -- --run` → green.
- `pnpm build`, `pnpm build-storybook` and `pnpm test -- --run` (the Storybook
  visual and a11y suite) → green, and web behaviour unchanged.
- `pnpm native:export` → iOS and Android bundles written, with the module count
  recorded. The exports test → every native value export is rendered.
- **Device checkpoint, before the tag.** Run `examples/native` in an iOS
  simulator and an Android emulator (development builds, both OS defaults:
  Android edge-to-edge, iOS with a home indicator). VoiceOver rows run on a physical iPhone (the Simulator has no VoiceOver); TalkBack rows run on a Google Play emulator image.
  - Record each row as input → expected → actual, with one screenshot per row.
  - A failed row blocks the tag. This is a focused list, not a screenshot suite.
  - The rows per slice are listed under A, B and C below.
- Falsification, once per slice: add `import {createPortal} from 'react-dom'` and
  then a raw `<svg/>` to a file on the native graph →
  `typecheck:native` fails on the first and `check-native-graph` on the second.
  Revert the probes.

**A:**

- Write a web file that imports `react-native`, then run `pnpm build` → it fails
  with "react-native reached from the web graph via <file>". Revert it.
- Dialog stories (open, Escape, backdrop, focus restore) → unchanged results
  after the `useOverlayOpenState` refactor; the same holds for the Drawer and
  DetailPanel stories.
- Read the `sources` array of `examples/native`'s source map with node and count the distinct package roots ending in `node_modules/react-strict-dom/` → exactly 1, as in N0.0 (`grep -c` counts lines, and a source map is one line, so it cannot see a second copy).
- Web Icon: the Storybook visual suite → no diff after the move to geometry.
- Icon benchmark (Decision 9): median of 3 release runs per renderer → the
  numbers and the choice are in the Decision log.
- Device checkpoint A:
  - Dialog opened from the expo-router modal route → it draws above that route.
  - Android back and a backdrop tap → each closes the Dialog.
  - ConfirmDialog's phrase Input focused → the keyboard leaves the Input and
    the Footer visible.
  - VoiceOver and TalkBack: open → focus lands in the panel; close → focus
    returns to the Button trigger.
  - Icons in a nested light ThemeProvider inside a dark one → they draw the
    light palette's colours, in the app and inside a Dialog.
  - A Toast raised from inside a Dialog over the modal route, with `PortalHost`
    mounted there → it draws on top.

**B:**

- A Storybook interaction test on the Drawer `snapPoints` story (web, side
  bottom): drag to medium, then large, then below medium → it closes.
- SplitPane story: the arrow keys move the separator and `aria-valuenow` follows;
  below the breakpoint, it shows one column.
- VirtualList story with 10,000 items → fewer than 50 rows mounted (`getAllByRole('listitem')` is asserted, and `aria-setsize` equals 10000); `anchor="end"` starts at the last item.
- Device checkpoint B:
  - Menu item that opens a Dialog → the Dialog presents, on both OSes.
  - Sheet drag between detents, a fling below the lowest one, and a long list
    scrolled inside the sheet → the drag tracks the finger, the fling closes the
    sheet, and the list scrolls without dragging the sheet until it reaches the
    top. On a release build, `adb shell dumpsys gfxinfo <pkg> framestats` and Instruments Animation Hitches during the drag → janky frames ≤ 5 %.
  - Grabber tap and the accessibility action → the detents cycle.
  - Android: sheet drag and Toast swipe inside an open `OverlayModal` → each gesture is received.
  - Popover anchored to a trigger near each screen edge, with the status bar
    translucent and opaque → it is aligned within one spacing token.
  - Toast above the keyboard and above an open sheet → it is visible.
  - Toast with the screen reader on → the countdown pauses.
  - A Button wrapped in a Tooltip, under VoiceOver and TalkBack → the hint is
    read.

**C:**

- ThemeProvider override story, a Storybook interaction test:
  - Overrides A, then B, then A again → each step's computed `background-color`
    and primary Button fill equal that step's values (it catches a stylesheet
    that does not update), and `--duro-color-bg` follows.
  - Overrides removed → the theme's own values return, and no `<style>` is left.
  - A nested provider with other overrides → the inner subtree shows the inner
    values, and the outer subtree keeps its own.
  - An invalid value (`red} body{…`) → it is dropped, and no rule leaks.
  - A nested provider with no overrides under one with overrides → `--duro-color-bg` inside it equals the outer override.
- Device checkpoint C:
  - Overrides A → B → A and a mode switch on a mounted screen → RSD styles and
    icons (resolved colours) follow every step, with no re-mount (a mount
    counter stays at 1).
  - The Select sheet, and the Combobox sheet with the keyboard up → results are
    visible, and the empty state shows.
  - Form submit from a `Button type="submit"` → `onSubmit` fires.
- Token inventory: each Happier colour token is mapped to a Duro key or added as
  a new one, with no row left "approximate".

## After each release

- Happier's range bump to the new version: `expo export` green with zero Duro fix PRs. One or more fix PRs means the next slice waits until a 5.1x.1 fix release ships.
- `native:export` module count compared with the previous slice, recorded in the PR.
- Faults sent back from Happier's native checkpoint are counted per slice; any web regression found after release gets a patch release before the next slice starts.

## Decision log

- 2026-10-12, B implementation review: three plan wordings narrowed. The native `useContainerBelow` measures its view after layout and on every window resize (a hook cannot wire `onLayout` into a view it does not render); a parent resizing in a fixed window is missed until the next window change. A toast's press-pause is the toast's own state (it lasts as long as the press); the remaining time is in the store, so a host move keeps the countdown. Native toast colours come from RSD token styles, which the Portal re-themes; `useResolvedColors` is only for raw hosts.

- 2026-10-12, B3: Tag's remove cross and SideNav's chevron stay their own glyphs (a web SVG / a react-native-svg twin), not Icon: Icon's smallest size (16, stroke 2) would change the web look the plan keeps. On native, RSD's Animated colour transition ends on a near-black colour, so native Tabs transition nothing that changes; a mixed icon-and-text button needs its text in a span on native (ButtonHost does it for Button and Toggle). Found on the iOS simulator: Tabs' `role="tab"` reaches VoiceOver as a generic element; it is a row for B's device checkpoint.

- 2026-10-12, B2: the RSD gap is filed upstream as react/react-strict-dom#524 (`aria-description` → `accessibilityHint` on native). Until it ships, Button and Toggle render through `shared/ButtonHost`, which swaps in an RN `Pressable` only inside a Tooltip; Menu and Popover triggers are `Pressable` hosts on native. VoiceOver reads the hint (checked on the iOS simulator).

- 2026-10-12, B0 (ADR-0016), the person's picks from the local review canvas (an Artifact could not be published from this session): native-sheet · direction B Done (`docs/mockups/native-sheet/Done.dc.html`: grabber, centred title, a text Done as the close; the non-drag detent path stays the grabber tap and its accessibility action, Decision 5); native-toast · direction B Tinted (`docs/mockups/native-toast/Tinted.dc.html`: card surface, status-coloured edge, an inline action before close); split-pane · direction A Hairline (`docs/mockups/split-pane/Hairline.dc.html`). The other directions' artboards stay committed beside them as the record of what was offered.

- 2026-10-12: the icon renderer stays `react-native-svg` for 5.12 under Decision 9's rule. Frames, the deciding measure, cannot be measured on this host (software-rendered emulator, no hitches on the simulator); Skia leads on Android mount and iOS memory, not on iOS mount. The benchmark screen stays in `examples/native` and reruns on physical devices before slice B; a Skia win there swaps the renderer in B.

- 2026-10-11: three PRs and three releases, one per Happier gate, instead of one
  PR (`work.one-implementation-pr-per-repo-per-plan` exception). The milestones
  wait on each gate, so a single PR would hold N1 hostage to M2's pickers.
- 2026-10-11: the person chose snap points for the bottom Drawer, no tooltip
  bubble on touch (hint only), and bottom sheets for Select and Combobox on phones. The hint-only Tooltip amends the happier plan's § N0 item 2 "Tooltip (long-press)"; the pointer file says so.
- 2026-10-11: ADR-0001 reading: the root's `react-native` export condition is a platform entry, not an option, so `react-native` and the native peers of Decision 4 are optional peers reachable only from it; no web root import reaches them (enforced by the Vite resolve guard).
- 2026-10-11: `X.tsx` / `X.native.tsx`, not `X.web.tsx`, follows the existing
  ThemeProvider pair (Decision 1).
- 2026-10-11, the person's review: Gesture Handler + Reanimated replace
  PanResponder; a focused device checkpoint runs before each tag;
  `react-native-safe-area-context` is a native optional peer; a resolved-colour
  context; an updating scoped `<style>` for web overrides; explicit extraction
  of the shared logic; a host registry with an exported `PortalHost`; and icon
  geometry with an SVG-vs-Skia benchmark that picks the native renderer.
- 2026-10-11: interactive overlays use RN `Modal`; passive ones use a host
  stacked by `LAYERS` (Decision 2). A host-only design loses consumer contexts
  and draws behind Happier's native modal routes.

## Cleanup

- After v5.14.0: close this plan (`status: done`, `landed:`), and close the slice
  in the happier pointer file.
- Run the worktree-sweep skill over the task worktrees.

## Slice A record (observed before push)

- A1, react-native versions: `pnpm why react-native -r` → one version → `react-native@0.81.5` only, after a workspace override `react-native: 0.81.5` (RSD's peer from `@duro-app/tokens` had resolved 0.84.1).
- A1, falsification: `import {createPortal} from 'react-dom'` in `Badge.tsx` → `typecheck:native` and the graph lint fail → `TS2305` and `Badge.tsx:1:1 react-dom import — …`, exit 1; a raw `<svg />` → graph lint fails → `Badge.tsx:27:29 raw <svg> — …`, exit 1; probes reverted.
- A1, web guard: `import 'react-native'` in `Badge.tsx`, `pnpm --filter @duro-app/ui build` → fails → `react-native reached from the web graph via packages/ui/src/components/Badge/Badge.tsx — move the import into a .native.tsx file`; reverted.
- A1, suites: `pnpm typecheck`, `pnpm lint` (0 errors, 14 warnings), `pnpm test:unit -- --run` (29 files, 446 tests), `pnpm build`, `pnpm build-storybook`, prettier → all exit 0.
- A2, install: `pnpm native:install` (example's own lockfile, `--ignore-workspace`) → Expo tree outside the root lock → 88 s on this laptop, root `pnpm-lock.yaml` has no `expo` entry.
- A2, export: `pnpm native:export` → iOS and Android Hermes bundles plus the bundle check → `android: 1456 modules; react-strict-dom 1, react 1, react-native 1`, `ios: 1459 modules; react-strict-dom 1, react 1, react-native 1`, about 2 min.
- A2, exports test: `scripts/test/native-example-exports.test.ts` → each of the 17 native value exports rendered by `AllExports.tsx` → 18 tests pass.
- A2, deviations: the exports test lives in `scripts/test/` (Vitest would load the example's `tsconfig`, which extends `expo/tsconfig.base`, uninstalled in the unit job); the example has no Babel config (Expo's default preset suffices) and an ESM `metro.config.mjs` (keeps the repo's lint rules unloosened); `react-dom` 19.1.0 is pinned in the example (RSD's peer pulled 19.3 otherwise).
- A3, open-state fixes: `Dialog.DoubleCloseReportsOnce` and `Dialog.ControlledCloseAnimates` stories on the old `Dialog.tsx` → both fail → `2 failed`; on the hook → pass → Dialog 17/17. Drawer, DetailPanel, ConfirmDialog stories → unchanged → 35/36 in one parallel run (`DrawerScroll › Drag Up At Top Scrolls` timed out), then 7/7 twice alone: flaky under load, not the refactor.
- A3, host registry: `packages/ui/test/hostRegistry.test.ts` → root stays below hosts added before it; entries order by layer; one publish per change → 3 tests pass.
- A3, native graph: `pnpm typecheck:native` and `pnpm native:export` with the registry, root host and `PortalHost` → green → `android: 1460 modules`, `ios: 1463 modules`, one copy of each runtime.
- A3, naming: the plan's `ColorKey` is the existing `ColorToken` from `@duro-app/tokens/keys` (`change.reach-before-adding`). DetailPanel keeps its immediate `onOpenChange` (`closeNotice: 'at-once'`); Dialog and Drawer report after the exit (`'after-exit'`).
- A4, device checkpoint A, iOS 26.5 simulator (iPhone 17 Pro) and Android 16 emulator (Google Play image), screenshots in `attestations/n0-slice-a/`:
  - Dialog from the index route → opens over a scrim; backdrop, `Close` and `Done` each close it (accessibility tree before and after); Android back closes it and the app stays open (`and-after-back.png`).
  - Dialog from the expo-router `presentation: 'modal'` route → draws above the route (`a4-dialog-over-route.png`).
  - ConfirmDialog phrase with the on-screen keyboard → the panel rises; input and Footer stay visible; the phrase is typed lower-case and enables Delete (`a3-confirm-keyboard-2.png`).
  - Nested light ThemeProvider inside a dark Dialog → the Card and the `sun` icon draw the light palette on both OSes (`a1-dialog-open.png`, `and-dialog.png`).
  - Faults the first run found, fixed in `8965a396`: no canvas; content-box overflow on `width: 100%`; Dialog parts collapsing under a percentage max-height; `inline-flex` and a multi-value padding ignored by RSD-native; the radio dot as a span; ConfirmDialog autocapitalising its phrase; native `createTheme` breaking the web style extraction; presence one commit late on a controlled open (AppShell's Phone Drawer story).
  - Screen-reader rows, run by the person on a physical iPhone 13 Pro Max (VoiceOver, release build signed for the device) and on the Android emulator (TalkBack): focus into the Dialog on open, back to "Open a dialog" on close, ConfirmDialog's phrase typed lower-case → the person: "everything looks good. pass". The Toast row moves to slice B, which ships Toast.
- A4, icon benchmark, Android emulator (release build, 3 interleaved runs, `bench-android.txt`): mount SVG 2,326 / 2,469 / 2,610 ms, Skia 1,186 / 1,221 / 5,187 ms; janky frames 100 % for both (the emulator renders in software on this host, so frames cannot decide); theme switch logged for Skia only. Inconclusive on frames.
- A4, icon benchmark, iOS simulator (release build, 3 interleaved runs, `ios-bench/`): mount SVG 658 / 481 / 397 ms, Skia 440 / 594 / 341 ms (8.5 % better at the median, inside SVG's range); RSS SVG 449 / 443 / 462 MB, Skia 356 / 370 / 331 MB (about 20 % less, outside the range). Instruments refuses Animation Hitches on the simulator ("Hitches is not supported on this platform"), and the theme-switch tap did not register reliably.
- A, full suites after the review fixes: `pnpm test -- --run` (Storybook visual and a11y, every story, Icon's included) → green → 77 files, 504 tests; `pnpm test:unit -- --run` → 32 files, 492 tests. Web Icon markup: all 48 glyphs rendered by the old and new `Icon` to static markup → identical (a throwaway test, run once, removed).
- A, pre-commit cost of the native typecheck: `packages/ui` web `tsc --noEmit` 73 s real / 44 s user, native `tsc -p tsconfig.native.json` 21 s real / 17 s user (load average 36): about 38 % more CPU for the ui typecheck. The CI install times (root before and after, the `native` job cold and warm) are measured on the runner and recorded in the PR body.
- A, deviations found by the review: native Dialog defines its own `Body` (a ScrollView) and `Close` (the `Icon`-drawn ×), not the shared ones in `parts.tsx`; the root host does not warn about a missing `GestureHandlerRootView` (RNGH has no public probe for it, and RNGH itself throws when a gesture runs outside one; no slice A component uses a gesture, slice B's Drawer is the first).

## Implementation review

approve-with-changes (round 1, 85k, 119 s). Fixed: release-build focus failures logged, not dropped (`errors.never-swallowed`); `noInlineConfig` in the graph lint plus a test (`general.no-disabled-safety`); an outside reopen cancels an outside-started exit; the Dialog trigger keeps the consumer's ref; missing measurements and deviations recorded above. Deliberate: no dev warning for a missing `GestureHandlerRootView` (reason above).
Delta (round 2, 92k, 27 s): approve; all seven resolved, no new finding. Carried to slice B: Behaviour 6's "warns in development" line is revised when Drawer brings the first gesture; the CI install and `native` job times go in this PR's body, and `timeout-minutes` is set from the cold time; `mergeRefs` (pre-existing) calls a React 19 cleanup-returning callback ref with `null` instead of its cleanup, harmless today, noted for a later fix.

<!-- panel: repos=duro-design-system reviewers=backend,lang:typescript,architect,po,react,ui-design,ux-research,game-ux,tui,unix body-sha=db57eb9f2046 -->
