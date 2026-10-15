---
status: active
branch: feat/native-links-landmarks
repos: [duro-design-system, happier]
adrs: [ADR-0002, ADR-0006]
---

# Happier M1 gaps: native links and landmarks

## Review panel

👉 **Decide:** none. Approve if it is acceptable to drop SideNav's nested landmark inside a Rail in a minor, with that change named in the release notes.
📍 duro-design-system · plan reviewed, not started · next: worktree and plan commit. Panel: architect, backend, game-ux, lang:typescript, po, react, tui, ui-design, unix, ux-research (opus-5-5).
**Changed by review:** a TreeRow web/native split (with and without `href`) with no web stub; a native chevron control; native rows carry selected and the name, and the branch chevron carries expanded; an ADR-0002 native addendum plus registry regeneration.
**Verdicts:** 10 approve-with-changes in round 1. Backend approved with changes in round 2, on your 4 points (patches applied), and on two binds (the second's patches applied). 3 rejected (reasons in the full reviews). 7 carried into implementation.
📄 Full reviews: [2026-10-15-happier-m1-gaps-native-links.reviews.md](2026-10-15-happier-m1-gaps-native-links.reviews.md)

## Goal

Happier M1 ships its first Duro screens on `@duro-app/ui` 5.15.0 and works around four gaps. This
plan closes them in duro-design-system, on react-strict-dom (RSD 0.0.55) for web and native.
`origin/main` is v5.16.0 (QrCode on native, the mockup canvas), so this ships as **5.17.0** and
Happier can delete its workarounds: Card and Text instead of Panel and TextLink, and a derived
`OnNavigate` type. It also fixes a native defect M1 has not hit yet: native was only bundled, never
tapped (Happier plan line 435).

## Context: what react-strict-dom does on native

These facts drive the design. They were read in `node_modules/.pnpm/react-strict-dom@0.0.55…/dist/native/index.js`.

- `html.a` is a text component (`createStrictDOMTextComponent`, :3070), so it is an RN `Text` with
  `role="link"`.
- `onClick` becomes `onPress` (:2578). The synthetic event has a no-op `preventDefault()` and
  `defaultPrevented: false` (:2619-2632).
- **When `href` is set, RSD replaces that `onPress` with a dev-only "href handling is not
  implemented" stub (:3094-3100).** So `html.a href onClick` swallows every tap on native.
- `:hover`, `:focus` and `:active` style keys apply on native (:908, :1422-1429). `:focus-visible`
  does not.
- `aria-labelledby` becomes `accessibilityLabelledBy`, split on commas (:2531). Only Android
  honours it.
- `html.nav` is a plain View (:3513), so landmark nesting matters on the web only.

The native-exported part this breaks today is **`Tree.Item` with `href`** (`Tree.tsx:201-214`),
which is how Happier renders its session rows (`happier-wt-m1-shell/packages/screens/src/sessions/SessionTree.tsx:66-84`).
TextLink would break the same way once exported. `Menu.native.tsx:224-255` (LinkItem) already
avoids the problem: it builds a tracked `LinkClickEvent`, calls `onNavigate`, and falls back to
`Linking.openURL`. The fix reuses that logic.

## Non-goals

- No RSD upgrade or patch (the N0 non-goal still holds). The workaround is that native code never
  passes `href` to `html.a`. An RSD issue is filed in Phase 1 (`design-system.gaps-go-upstream`),
  and the `holds-until:` comment links it.
- No native port of LinkButton, Breadcrumb, PageNav or TableOfContents. `followLink` makes those
  ports small later.
- No Tree windowing unless the item-3 rule below fails.
- Happier's apps/ui TS7 `moduleSuffixes` errors are not filed unless Duro's own
  `pnpm typecheck:native` reproduces them.
- No mockup for the semantic changes (landmark, name, links): none of them changes what a sighted
  user sees. Three native visuals are judged at the device checkpoint: the pressed state, a Panel
  Body that overflows, and the chevron's hit area.
- No new API for a standalone TextLink hit area. Inline links fall under the WCAG 2.5.8 inline
  exception.

## Behaviour

### 1. Panel and TextLink on native (brief item 1)

- **Correction to the brief:** component meta has no `native` field. The registry derives `native`
  from the `index.native.ts` exports (`packages/cli/scripts/build-registry.mjs:80-82`) and commits it
  to `packages/cli/registry.json`. CI checks that file is fresh (`ci.yml:67`). So the change is:
  export, run `pnpm duro:registry` and `pnpm duro:docs`, stage `registry.json` and `CLAUDE.md`, and
  assert `Panel` and `TextLink` true and `LinkButton` false in `packages/cli/test/native-flag.test.ts`.
- **Panel** is `html.div` only. On the web its Body scrolls (`overflowY: 'auto'`,
  `Panel/styles.css.ts:34`), and an RN View does not.
  - The checkpoint renders a phone-height Panel whose Body has 50 rows. Pass: Header, Body and
    Footer render in order and the last row is reachable.
  - If it is not reachable, `Panel.native.tsx` backs Body with the native ScrollArea viewport, so
    the native Body behaves like the web one.
- **TextLink** needs a port.
  - New `shared/followLink.native.ts` (native only, with no web file) holds
    `followLink(href, onNavigate, source)`. It builds the tracked `LinkClickEvent` (`button: 0`, no
    modifiers, a real `defaultPrevented`), calls `onNavigate`, and when the event is not prevented
    calls `Linking.openURL` with a `console.warn` on rejection.
  - That logic moves out of `Menu.native.tsx:226-247`, and `Menu.LinkItem` calls the helper, so
    there is one owner.
  - New `TextLink/TextLink.native.tsx` renders `html.a` **without `href`**. It stays a nested
    `Text`, so it wraps inline with `role="link"`, and its `onClick` is
    `followLink(href, target ? undefined : onNavigate, 'TextLink')`. That matches ADR-0002: a link
    with a `target` never calls `onNavigate` (web: `navigate.ts:59`). `rel` is dropped on native.
  - Styles reuse `styles.css.ts`. A new `:active` key gives a visible pressed state, and
    `:focus-visible` is dropped on native.
- `scripts/check-native-graph.mjs` gains a rule: no `html.a` with `href` in the native graph. It
  fails the lint if a later edit brings `href` back.
- Export `Panel`, `TextLink` and `TextLinkVariant` from `index.native.ts`. Use both in
  `examples/native/src/AllExports.tsx`, which `scripts/test/native-example-exports.test.ts` requires.

### 1b. Tree rows on native: links, structure, semantics, expansion (affects Happier now)

- **One platform split for the whole row.** `Tree.tsx` keeps the Item state (selection, expansion,
  level, focus, ids) and renders `<TreeRow …>`. moduleSuffixes picks the file, not `isNative`, so
  shared code never imports native-only code.
  - `Tree/TreeRow.tsx` (web) is today's markup moved unchanged: the `li` with its aria, the
    `html.a href` row or `html.div` row, the chevron, and label and meta spans.
  - `Tree/TreeRow.native.tsx` covers **both** variants, with and without `href`.
- **Native structure: no View inside a Text.** The item row is a plain View holding two sibling pressables: the branch's chevron control and the press target (`html.div`). The chevron is never inside the press target: RSD makes an `html.div` with `onClick` a `Pressable` (`dist/native/index.js:2863-2865`), which is `accessible` and hides its descendants from VoiceOver. Label and meta are
  each a View container (`html.div`), with the label's text in an `html.span` inside its own
  container. Meta is a View container, so Happier's `Inline` + `Text` + `Badge` sits in a View. The
  layout is checked with Happier's real row composition, copied into `examples/native`.
- **Native row semantics, the same contract for both variants.** The pressable row is the element a
  screen reader focuses:
  - with `href`, `role="link"`; a press calls `onSelect(value)`, then
    `followLink(href, onNavigate, 'Tree.Item')`;
  - without `href`, `role="button"`; a press calls `onSelect(value)`;
  - both carry `aria-selected` and an `:active` pressed style; `aria-expanded` sits only on the branch's chevron control, because pressing the row does not toggle;
  - both take their name from their own text (label, then meta), with no `aria-labelledby`;
  - the native `li` and group `ul` pass `role="none"` (RSD defaults them to `listitem`/`list`, `index.js:2870-2873`) and no aria, so nothing is announced twice.
    On web, role and state stay on the `li` (`Tree.tsx:190-196`).
- **Expansion on native is release-blocking, not a follow-up.**
  - Today the chevron is `aria-hidden` (`Tree.tsx:164-181`) and the native keyboard hook is a no-op
    (`useTreeKeyboard.native.ts:1-5`), so a screen-reader user cannot open a collapsed branch.
  - On native, a branch's chevron becomes its own control: `html.div role="button"` with
    `aria-expanded={open}`, not `aria-hidden`. Its `aria-label` comes from a new optional
    `Tree.Root` prop, `expandLabel?: (label: string) => string`. It receives the Item's text (`textValue`, else a string `label`); an empty text warns in dev. It defaults to the branch's text,
    so VoiceOver reads "Operations, collapsed, button" right after the row.
  - The chevron's hit area is at least `sizes.chip` (24 px, WCAG 2.5.8 minimum).
  - The chevron press toggles only. It is a sibling of the press target, so no `stopPropagation` is needed.
  - A leaf has no chevron control at all. Today `Tree.tsx:166-167` attaches `onClick` to leaves
    too, which on native would leave a dead gutter.
  - The level indent sits on the outer row View. A leaf's chevron-width spacer sits inside its press target, so tapping the gutter selects. A `TreeRow.native` unit test asserts the spacer is a descendant of the press target.
  - The device checkpoint must show a branch expanded and collapsed with VoiceOver and with
    TalkBack. If it cannot be done, that blocks the tag. Web is unchanged: keyboard and arrow keys
    still expand.
- In dev, a native `Tree.Item` with `href` and no `onNavigate` logs `console.warn`. A relative href
  would otherwise go to `Linking.openURL` and leave the app. The Tree and TextLink meta say that
  `onNavigate` is required for in-app routes on native.

### 2. `OnNavigate` and `LinkClickEvent` on native (brief item 2)

Add `export type {LinkClickEvent, OnNavigate} from './shared/navigate'` to `index.native.ts`, which
mirrors `index.ts:160`.

### 3. Tree cost (brief item 3): measure, then decide by a rule fixed in advance

- New story `Tree.stories.tsx` → `Perf300`, modelled on `DragDrop/DragDropBoard.stories.tsx:600-660`.
  It renders 20 branches × 15 leaves (320 rows), all expanded. Every leaf has `href`, `onNavigate`,
  and a meta of Text plus Badge.
- What it measures:
  - mount, as render-to-first-rAF over 5 fresh mounts (median);
  - a scroll of the `ScrollArea` viewport over 60 rAF frames (worst gap, `longtask` entries);
  - ArrowDown ×50: for each key, the time from dispatch to the committed focus change and the
    next paint. It is read from the Event Timing API (`PerformanceEventTiming.duration` for
    `keydown`, which runs up to the next paint), observed with `durationThreshold: 16` from trusted keys (Playwright `keyboard.press`), a key with no entry counts as under 16 ms (below the threshold), and the run fails unless the rAF cross-check records 50 focus changes, cross-checked by a rAF after the focused row's
    `tabIndex` flips. The handler time alone is kept as a diagnostic;
  - Item re-renders per keystroke (Profiler, dev build).
- **Where the rule is applied.** On the production `build-storybook` output, in headed Chrome, at
  1× and at 4× CPU slowdown (DevTools trace). Dev-mode React inflates timings, and Profiler does not
  report in production.
- **Rule.** "Cheap, close with numbers" holds at 4× if all three hold:
  - the median mount is ≤ 50 ms;
  - there is no long task during the scroll;
  - every keystroke paints within 100 ms (RAIL's visible-response budget, measured through to the
    next paint).
- If the rule fails, the next steps are costed in this order, and the choice is a 🧑 decision
  before any code:
  1. Focus lives in the one context value (`Tree.tsx:92-102`). A `focusValue` change broadcasts to
     every Item, and memoising the value cannot prevent that. The fix is to split focus out of it:
     a small store read through `useSyncExternalStore`, with each Item selecting only "am I
     focused", so a keystroke re-renders 2 Items instead of 320.
  2. Windowing: a recipe that flattens the tree into VirtualList, or windowing inside Tree that
     keeps the roles and aria attributes.
- The vitest browser run (development React) is a regression guard only. Its ceiling is 3× the
  median measured on CI, set after the first numbers.
- **Native.** A `/tree-bench` route in `examples/native` (next to `bench.tsx`, with its `report()`
  pattern) records the mount and worst scroll frame on the iOS simulator. Over 250 ms, or a dropped
  frame while scrolling, files "Tree on native: windowing" for Happier, outside this release.

### 4. Nested navigation landmarks (brief item 4)

- **Reproduce first.** Add an AppShell story `RailWithUnlabelledSideNav` that mirrors Happier's
  `Shell.tsx:31-79`: a Rail with an `aria-label` and a `SideNav.Root` with none, with
  `a11y.test: 'error'`. Record axe's result and the landmark count in the Chrome accessibility tree.
  Expected: 2 navigation landmarks.
- **Fix.**
  - `AppShell.Rail` provides a new `InLandmarkContext` (`shared/`). On web it does so in both copies
    (`AppShell.tsx:241-283`), including the Drawer portal content, since context crosses a portal
    only from above it. On native it does so in `AppShell.native.tsx:113-130`.
  - Inside that context, `SideNav.Root` (`SideNav.tsx:127`) renders `html.div` with no landmark. If
    it has an `aria-label`, it keeps the name as `role="group"`. Outside a Rail it is unchanged.
- **Tests.** `DesktopLandmarks` (`AppShell.stories.tsx:329-358`) asserts exactly one `navigation`
  landmark. `PhoneDrawer` asserts the same inside the drawer and keeps its
  `[aria-label="Sections"]` query.
- **This is a behaviour change in a minor.**
  - Before tagging, grep the fleet's consumers (duro-app, kb-vision, happier, application-landscape,
    website-builder) for `getByRole('navigation'`.
  - The 5.17.0 release notes say: "SideNav inside AppShell.Rail is no longer a navigation landmark".
- **Docs.** `SideNav.meta.ts` usage states the rule. The CLAUDE.md "Docs pages" example's
  `aria-label="Navigation"` becomes `"Main"`, because screen readers announce "Navigation
  navigation".

### 4b. Issue #96, Tree.Item meta and the accessible name (still current; affects Happier)

- **Still current.** `Tree.tsx:152-154,182-185`: the name comes from the label span only. Happier's
  meta is a relative time plus a status Badge (`SessionTree.tsx:72-83`), so a screen-reader user
  never hears "Running" or "Needs approval".
- **Fix (web).** The meta span gets an id. The treeitem gets `aria-labelledby={`${labelId} ${metaId}`}`
  only when `meta != null`, and `labelId` alone otherwise. The name starts with the visible label
  (WCAG 2.5.3) and carries the status shown on screen (WCAG 1.3.1).
- **Native.** Handled by 1b for both row variants. Each row reads its own text, and the meta
  container is a View, so the status is announced.
- **Checks.**
  - Play tests cover a row with meta ("Operations 31") and a leaf without.
  - The device checkpoint records the full announced string for a Happier-shaped row. If it is too
    verbose, Happier can pass a shorter meta; Duro adds no prop now.
  - Typeahead still uses `textValue`.

## Phases

Cut line: Phase 1 (items 1, 1b, 2) is releasable alone as 5.17.0. Phases 2-3 ship with it if their
checks are done in the same branch. Otherwise they follow in 5.18.0.

- [ ] Phase 0 — worktree `../duro-design-system-wt-native-links` from `origin/main` (0dff2e07), `pnpm install --frozen-lockfile`, `aval add --check`, land this plan as the first commit.
- [ ] Phase 1 — items 2, 1, 1b: types export; `followLink` + unit tests; Menu onto it; TextLink.native; TreeRow web/native split (both variants, View structure, native chevron control, `expandLabel`); check-native-graph rule; ADR-0002 native addendum; file the RSD issue; Panel + TextLink exported; AllExports; `pnpm duro:registry` + `duro:docs`, staged; native-flag test.
- [ ] Phase 2 — item 3: Perf300 and tree-bench, numbers recorded; a 🧑 decision only if the rule fails.
- [ ] Phase 3 — item 4 and #96: reproduction story, InLandmarkContext, SideNav, Tree meta naming, docs, registry and docs regenerated.
- [ ] Phase 4 — verification loop including the device checkpoint, implementation review, PR, merge on green.
- [ ] Phase 5 — release 5.17.0 (minor) through `tag-release`, with release notes naming the landmark change. Check the packument. Add one line under Happier's M1 result block (`happier/docs/plans/2026-10-08-happier-fork-duro-web-app.md:435`), on `feat/m1-shell` if open, otherwise in a docs PR to `dev`. Close #96.

## Decision log

- 2026-10-15 — The brief's "native: true in meta" step becomes a barrel export, a registry regen and
  a test, because meta has no such field.
- 2026-10-15 — Tree.Item `href` on native is added to scope, because the RSD override breaks
  Happier's session rows.
- 2026-10-15 — ADR-0002 gains a native addendum (Phase 1). On native, a link part renders no `href`
  and goes through `followLink`: `onNavigate` for a plain press with no `target`, then
  `Linking.openURL`. This covers Menu.LinkItem, TextLink and Tree.Item. `aval heads --write` refreshes
  the projection.
- 2026-10-15 — The person's review of the presented plan changed four things:
  - Native branch expansion is a release-blocking accessible control: a chevron button with
    `aria-expanded` and an `expandLabel`.
  - The native row split covers rows with and without `href`, and keeps meta out of Text.
  - The keystroke gate is dispatch to the next paint, at 100 ms.
  - The remedy for focus broadcasts is to split focus out of the context, since memoising the value
    cannot stop them.
- 2026-10-15 — Item 4: "demote always" confirmed by the person after the consumer grep.
  - kb-vision's `app/routes/layout.test.tsx:57-60,91` asserts a named "Sections" navigation inside
    the Rail, so it must change when kb-vision raises `@duro-app/ui`. The release notes name it.
  - duro-app and application-landscape use their own navs and are unaffected.
- 2026-10-15 — Item 3 measured. The rule fails, and the person chose **windowing inside Tree now**
  (Phase 2b), in this release.
  - Setup: the production `build-storybook` output, headed Chromium 1228 through Playwright, trusted
    keys, CDP CPU throttling, 320 rows. The machine was under load (load average 7–13), which
    inflates the 4× figures.
  - **1×:** mount median 82.5 ms (77.1–83.6); scroll worst frame 17.6 ms, 0 long tasks; key to paint
    (rAF) median 15.6 ms, max 69.7 ms; Event Timing keydown max 112 ms.
  - **4×:** mount median 1491 ms (1260–1837); scroll worst frame 64.5 ms, 0 long tasks; key to paint
    median 56.1 ms, max 74.6 ms; Event Timing keydown max 120 ms.
  - Failed: mount (≤ 50 ms) and the Event Timing keydown (≤ 100 ms).
  - Item re-renders per keystroke stay unmeasured. The story's Profiler counts 320 commits on mount
    but 0 on a focus move, although `focusValue` is context state (`Tree.tsx:59,104`): it does not
    fire when it bails out and only its descendants update, so it cannot see the broadcast.
- 2026-10-15 — Windowing API: the person chose a collect pass over the JSX children, so `Tree.Item`
  stays the API. The design follows what is right for Duro, not Happier's wrappers. Duro builds with
  React Compiler (`babel-plugin-react-compiler`): no hand-written `memo`/`useMemo`, and the collect
  pass must be compiler-safe (no render-phase mutation that the compiler would reject).

### Phase 2b — Tree windowing (web), decided 2026-10-15

- `Tree.Root` gains `virtualizeThreshold?: number` (default 150, the same as VirtualTable) and
  `maxHeight?: Length` (the scroll viewport cap once virtualized, as VirtualList).
- **Collect pass.** Root renders its children in a collect mode. Each `Tree.Item` registers its
  value, level, text (`textValue` or string label), `hasChildren`, expanded state, `href` and
  `onNavigate`, and its label and meta nodes. It renders no DOM, and recurses into its children only
  while open. The result is a flat, ordered list of visible rows, plus `aria-setsize` and
  `aria-posinset` per level.
- **At or below the threshold:** today's nested `ul`/`li` markup, unchanged, with every Story and
  test as they are now.
- **Above it:** a scroll container, `role="tree"` with its name, that mounts only the window
  (`@tanstack/react-virtual`, rows measured, overscan) as flat `role="treeitem"` rows. Each row has
  `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded` (branch) and `aria-selected`,
  rendered through the same web `TreeRow`. Links, chevron and meta naming (#96) work as they do
  unwindowed.
- **Keyboard and typeahead** run on the row model, not on `querySelectorAll`: Up/Down, Left/Right
  (collapse, parent, expand, first child), Home/End, typeahead. A move to an off-screen row calls
  `scrollToIndex`, then focuses the row once it mounts. There is one tab stop (roving tabindex), the
  same as unwindowed.
- **Focus is split out of `TreeContext`** into a small store read with `useSyncExternalStore`. Each
  row subscribes to "am I the tab stop / ringed", so a focus move re-renders only the old and the new
  row, windowed or not.
- **Native unchanged:** `useTreeKeyboard.native` and `TreeRow.native` render every row, as today.
  Native windowing (a FlashList leaf) is Happier's, per N0.
- **Verification:**
  - Perf300 re-measured with the same script, setup and rows.
  - Expected: a 4× mount far below the 1491 ms baseline (target ≤ 50 ms) and Event Timing keydown
    ≤ 100 ms.
  - Existing Tree stories pass unchanged below the threshold.
  - A new story above the threshold asserts the window mounts fewer rows than exist, the level,
    setsize and posinset values on the rows, Home/End and typeahead reaching off-screen rows, and an
    axe pass.

## Verification

Each row records input → expected → actual. "Tests pass" alone is not a check.

- **Unit tests** (they fail without the fix):
  - `followLink` with a mocked `react-native` `Linking`: prevented → no `openURL`; not prevented →
    one call with the href; a rejection → one warn; `onNavigate` undefined → `openURL` only.
  - check-native-graph flags a fixture `html.a href` in a native file.
  - `TreeRow.native`, with `react-native` mocked at the boundary, for a leaf and a branch, each with
    and without `href` (4 cases):
    - the row's role (`link` or `button`), `aria-selected`, and no `aria-expanded` on the row (the chevron carries it);
    - a press calls `onSelect` then, with `href`, `followLink` once;
    - a branch has a chevron control with `aria-expanded` and a non-empty label, a sibling of the press target and not its descendant, and a leaf has none;
    - no `html.span` wraps a View child: meta is a View;
    - `href` without `onNavigate` warns once in dev.
  - `TextLink.native`: with `target` set, `onNavigate` is not passed; without it, it is passed.
- **Gates:** `pnpm typecheck` (web and native), `pnpm lint` (including check-native-graph),
  `pnpm test:unit -- --run` (native-example-exports, native-flag, followLink),
  `node packages/cli/scripts/build-registry.mjs --check --check-docs`, `pnpm build`,
  `pnpm build-storybook`, `pnpm test -- --run`, `pnpm native:export`.
- **CLI:** the workspace CLI's `Panel` and `TextLink` output show "React Native: yes", and Panel
  shows its Body note.
- **Web, in Chrome through Storybook:**
  - TextLink: plain click → `onNavigate`; cmd-click → new tab; `target="_blank"` → no `onNavigate`.
  - Tree WithLinks: the same; the accessible name includes meta; a leaf without meta is named by its
    label.
  - `RailWithUnlabelledSideNav`: before, the axe output and 2 landmarks; after, 1 landmark and axe
    clean.
  - Perf300 numbers at 1× and 4×.
- **Device checkpoint** (N0 recipe, `examples/native`): iOS simulator and Android emulator, dev
  builds, Metro without `CI=1`.
  - TextLink with `onNavigate` calling `preventDefault` → in-app route, no `Linking`.
  - TextLink without `onNavigate` → the system opens the URL.
  - TextLink with `target="_blank"` → `Linking`, with no `onNavigate` call.
  - An inline TextLink wraps with its paragraph and shows a pressed state. VoiceOver and TalkBack
    can each reach and activate it. RN flattens nested Text and iOS has no known core fix, so a gap
    is recorded in the TextLink meta and filed upstream.
  - Tree.Item `href` tap → row selected and `onNavigate` called once, with no RSD dev error, and a
    pressed state visible.
  - Tap on a leaf's chevron gutter → selects and navigates. Branch chevron → toggles only.
  - `href` without `onNavigate` → a dev warning.
  - Tree matrix, using Happier's real row composition (Inline + caption Text + Badge sm): a leaf and
    a branch, each with and without `href`. For each, record:
    - the layout: meta beside the label, the Badge not clipped, no RN "View inside Text" warning;
    - the announced name with its status, on Accessibility Inspector, VoiceOver and TalkBack;
    - the role, and "selected".
  - **Release-blocking:** with VoiceOver and with TalkBack, expand and collapse a branch through its
    chevron control. It announces "<label>, collapsed/expanded, button", and the children appear and
    disappear.
  - Menu.LinkItem → still navigates after the refactor.
  - Panel with a 50-row Body → last row reachable.
  - tree-bench → mount time and worst frame.
- **Rollback trigger.** Any of these blocks the tag:
  - a web Tree or TextLink cmd-click regression;
  - a Menu.LinkItem failure at the checkpoint;
  - a native branch that cannot be expanded with a screen reader.
- **After release:** if Happier's native session-row tap does not reach `onNavigate`, deprecate 5.17.0 on npm and ship a patch.
- **After the release:** `npm view @duro-app/ui@5.17.0 version` resolves, and the published native
  types export `Panel`, `TextLink` and `OnNavigate`. Raising the dependency is Happier's own work.

## Outcome

(filled at close)

<!-- panel: repos=duro-design-system reviewers=architect,backend,game-ux,language,po,react,tui,ui-design,unix,ux-research body-sha=2ea46f76f9d5 -->
