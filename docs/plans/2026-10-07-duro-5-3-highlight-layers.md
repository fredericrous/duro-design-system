---
status: done
landed: 'v5.3.0. Consumers: ticket-vision #19, social-planner #56, lexical-multi 0.4.0 (#21, #22); website-builder goes to 5.4 (2026-10-07-duro-5-4-local-stacking.md), its PR filled in when it merges.'
branch: feat/duro-5-3-highlight-layers
repos: [duro-design-system]
adrs: [ADR-0006, ADR-0027]
---

# Duro 5.3: highlight colour, layer scale, overlay blur, attached groups

## Review panel

👉 **Decide:** none — approve if a highlight family, two calendar sizes, a layer scale, one blur token, and `ButtonGroup attached` + `Toolbar` are worth unblocking ticket-vision, social-planner's follow-up, and the grouped lexical toolbar you asked for.
📍 duro-design-system · plan reviewed, nothing built; fleet: 7 of 9 repos merged on 5.x, while ticket-vision and lexical-multi wait on this · next: worktree, plan commit, highlight colours. Panel: backend.
**Changed by review:** a toast layer; layer fixes must fail on v5.2.0 first; attached position comes from DOM-order registration, not `:first-child`; contexts reset at popups; Toolbar listens natively, on its own controls only.
**Binding for implementation:** drop the `defaultPrevented` clause, since `aria-expanded` is the guard, and add a row: a trigger that preventDefaults ArrowRight → focus doesn't move; add an SSR row (`renderToString`: all controls `middle`, no hydration warning); move the SSR line under ButtonGroup; commit order is highlight, badge, sizes, layers, groups, effects, lint, docs; add "closed Select opens on ArrowDown/Up" to the release notes; "three gaps" means five; Popover-in-Drawer is a screenshot exception.
**Verdicts:** backend ×7 across four deltas (the original plan, two sizes, groups, groups final), each approve or approve-with-changes, never rework.
📄 Full reviews: [2026-10-07-duro-5-3-highlight-layers.reviews.md](2026-10-07-duro-5-3-highlight-layers.reviews.md)

## Context

The 5.1→5.2 fleet migration on 2026-10-07 left three gaps that no 5.2 token covers. ticket-vision is held on them:

- **No purple.** Its new-request picker colours four intents. Three map to `error`/`success`/`info`. Problem (#a855f7) has no Duro role, so its dot sits empty under `TODO(duro-5.3)`.
- **No layer scale.** The command palette uses raw `zIndex: 1000`. Duro itself hard-codes 15 z-index values in 12 files (1, 50, 1000, 1001, 1049, 1050, 1100), and consumers copy them.
- **No blur token.** The palette backdrop's `backdropFilter: blur(2px)` has nothing to map to.
- **No joined group for mixed controls.** In its lexical-multi 0.4.0 preview, the person asked for the toolbar to show two joined groups: [Normal | Arial | 15px] (three `Select`s) and [B | I | U | <> | link | T | highlighter] (four toggles plus three popover triggers). `ToggleGroup` joins only `Toggle`s, and `ButtonGroup` only spaces its children apart. lexical-multi 0.4.0, and website-builder after it, are held until 5.3 ships.
- **Two missing sizes in social-planner.** Its week planner's time gutter (`RAIL = 64`) and day header (`HEADER_H = 46`) feed `css.create`, and no 5.2 size has their role. social-planner ships on 5.2 with these two marked `holds-until: duro 5.3`.

The person decided:

- the purple becomes a `highlight` **family** (base, Bg, Border, Text) plus a Badge variant;
- 5.3 also adds a **layer (z-index) scale** and an **overlay blur** token.

  5.3 is a minor: it adds tokens and one Badge variant. The new lint checks start at `warn`, so no consumer gets a new error. Two layer fixes change behaviour, plus DragDrop if its test fails on v5.2.0. They are listed in §2 and in the release notes.

**Rollback:** npm versions are immutable, so a bad 5.3.0 is superseded by 5.3.1.

## 1. `highlight` colour family

These keys follow the `info` and `success` pattern: no Hover or Contrast keys, and Bg/Border alpha 0.1/0.3 in dark, 0.08/0.3 in light, 0.15/0.5 in high contrast.

| key               | dark                  | light                 | high-contrast          |
| ----------------- | --------------------- | --------------------- | ---------------------- |
| `highlight`       | #c084fc               | #6b21a8               | #d8b4fe                |
| `highlightBg`     | rgba(192,132,252,0.1) | rgba(107,33,168,0.08) | rgba(216,180,254,0.15) |
| `highlightBorder` | rgba(192,132,252,0.3) | rgba(107,33,168,0.3)  | rgba(216,180,254,0.5)  |
| `highlightText`   | #d8b4fe               | #581c87               | #e9d5ff                |

Each key is wired into:

- `colors.css.ts` and the `light` and `high-contrast` theme files;
- the `raw.ts` palettes, whose `RawColors` type change carries through to `ColorToken`;
- the eslint `COLOR_TOKENS` maps;
- the registry, and the CLAUDE.md colour table.

`contrast.test.ts` asserts, in every theme:

- `highlightText` on `highlightBg` composited over `bg` is at least 4.5:1;
- `highlight` on `bg` is at least 3:1.

If a listed value misses either ratio, the test drives the value, and the value is recorded in the plan's verification record.

**Badge** gets a `variant="highlight"` (`Badge.tsx` type, plus one style block of `highlightBg` + `highlightText`). Tag, Callout, Alert, StatusIcon and Toast are left unchanged: nobody has asked, and their variants carry status meaning.

## 1b. Two sizes

| token         | px  | role                                    |
| ------------- | --- | --------------------------------------- |
| `timeGutterW` | 64  | width of a calendar's time-label column |
| `dayHeaderH`  | 46  | height of a calendar's day-header row   |

They are added the way 5.2 added its sizes: `sizes.css.ts`, `keys.ts` (both `SIZE_KEYS` and the numeric `SIZES_PX`), `raw.ts`, eslint `SIZE_TOKENS_BY_PX` with axis suffixes `W`/`H`, then `pnpm duro:docs`. Neither value collides with an existing size.

## 1c. `ButtonGroup attached` and `Toolbar`

**`ButtonGroup`** gains `attached?: boolean` (default false) and `aria-label?: string`. When attached, the group renders one joined control:

- **Spacing:** no gap.
- **Borders:** each child's border collapses into its neighbour's with a negative margin of `calc(-1 * borders.hairline)`.
- **Corners:** inner corners are square, and only the first and last child keep `radii.sm` on their outer corners.
- **Focus:** a focused child rises to `layers.raised`, so its focus ring isn't hidden by its neighbour.

**Position, not pseudo-classes.** A Select or Menu trigger sits inside its own Root element (and a named Select has a hidden input before it), so `:first-child`/`:last-child` can't tell where a control sits in the group. Instead:

- the group registers its controls in DOM order, the way `useRovingFocus.ts` already does;
- it passes each one a `position` (`first`, `middle`, `last` or `only`) through `ButtonGroupContext`;
- the control applies a fixed style for that position.

The controls that read the context are `Button`, `Toggle`, `Select.Trigger`, `Menu.Trigger` and `Popover.Trigger`. `Popover.Trigger` also gains `aria-label` and `ref`, which an icon-only trigger needs. `orientation="vertical"` squares the top and bottom corners instead.

- **Pressed toggles:** a pressed `Toggle` draws its accent border inset (an inset ring), so it needs no z-index and a neighbour's margin can't cover it. `layers.raised` is used for focus only.
- **Inside a ToggleGroup:** a Toggle inside an attached `ButtonGroup` uses the attached style; its `ToggleGroup` `grouped` style applies only when there is no `ButtonGroup` around it.

**Contexts stop at popups.** A portal keeps its React parent, so the buttons inside a link Popover would otherwise come out squared, and under a `Toolbar` they would get `tabindex=-1`. The `Popover`, `Menu` and `Select` popups, `Dialog` and `Drawer` therefore reset `ButtonGroupContext` and `ToolbarContext` to null.

**`Toolbar`** is a new component (`role="toolbar"`, `aria-label` required) following the APG toolbar pattern:

- **Focus:** one tab stop, roving tabindex across every focusable control inside, groups included.
- **Keys:** Left/Right move focus (or Up/Down with `orientation="vertical"`), and Home/End jump to the ends.
- **Listener:** `Toolbar` handles keys with a native listener on the document, in the bubble phase, and acts only when the event's target is one of its registered controls, the same guard `useRovingFocus.ts` uses. So an ArrowLeft typed in a portalled Popover's input never moves toolbar focus. The listener sits on the document, not the toolbar root, so that it runs after the controls' own handlers: React dispatches from the app root, below the document. A listener on the toolbar root would run before them.
- **Registration:** controls register in a layout effect. Server-rendered HTML gives every control the `middle` position, so corners start square-joined, and the outer corners round after hydration.
- **Vertical toolbars:** they don't support `Select`, since a closed Select takes ArrowDown and ArrowUp to open. This is documented on `Toolbar`.
- **Tabindex:** `Toolbar` sets each control's tabindex through a `ToolbarContext` register API, read by the same five controls. A `ToggleGroup` inside a `Toolbar` hands its roving focus to the toolbar, so there is never a second roving handler.
- **Popup triggers:** a `Select` or `Menu` trigger keeps its own keys. New in 5.3, a closed `Select` opens on ArrowDown or ArrowUp; today it handles no key while closed (`useSelectRoot.ts`). The toolbar ignores any key event that comes from an element with `aria-expanded="true"`: that is the guard for open popups, so while a popup is open, Left/Right never move focus away from it. It also ignores a key event that is `defaultPrevented`, so a control that handles an arrow itself keeps it (the binding row "a trigger that preventDefaults ArrowRight → focus doesn't move"). That check only works because the listener runs after the control's handlers (see Listener). Escape inside a popup closes the popup and leaves focus on its trigger.

Today's grouped `Toggle`s keep working unchanged when used outside a `Toolbar`.

**Stories:** an attached group of three `Select`s; an attached group of four `Toggle`s plus three icon `Button`s, with one opening a `Popover`; a `Toolbar` holding both groups and a `Menu`.

## 2. `layers` token group (z-index)

The new file is `packages/tokens/src/tokens/layers.css.ts`. It is a `css.defineVars` group with string values, so that `--duro-layer-*` exists for plain CSS. Values are unitless, so the drift check gains a unitless mode.

| token           | value | today                                               |
| --------------- | ----- | --------------------------------------------------- |
| `raised`        | 1     | ScrollArea scrollbar, VirtualTable sticky header    |
| `floating`      | 50    | Tooltip, ActionBar                                  |
| `overlay`       | 1000  | Dialog/Drawer backdrop                              |
| `modal`         | 1001  | Dialog/Drawer viewport                              |
| `popover`       | 1040  | new: a Popover inside a Dialog or Drawer            |
| `popupBackdrop` | 1049  | Select click-catcher                                |
| `popup`         | 1050  | Select, Listbox (Combobox renders through it), Menu |
| `toast`         | 1060  | new: Toast region                                   |
| `portal`        | 1100  | ThemeProvider portal mount                          |

All 15 raw values in `packages/ui/src` move to these tokens. The drift check then asserts that 0 raw `zIndex` literals remain under `packages/ui/src`. Values only compete inside one stacking context: Dialog, Drawer, the popups and the toast region all live in the ThemeProvider portal mount (`portal`, 1100), and that is the context the scale orders. Without a ThemeProvider, Dialog and Toast render inline, and the same order applies in the root stacking context. Nothing else moves on screen, apart from the fixes below. Each fix has a browser test that **fails on v5.2.0** before the change and passes after it. If a test passes on v5.2.0, that fix is dropped from 5.3.

- **Popover inside a modal → `popover` (was 50).** It portals into the same mount as Dialog, so a Popover opened inside a Dialog renders under it (50 < 1000). It takes a layer of its own, not `popup`: at `popup` it tied with a Select opened inside it, and the Select's listbox (mounted before the Popover opens) was drawn under the Popover. At 1040 it clears the modal and stays under `popupBackdrop` and `popup`. Outside a Dialog or Drawer, a Popover keeps `floating` (50), so a modal opened later, even from a button inside the Popover, covers it. Dialog and Drawer tell it through a `ModalContext`.
- **Toast region → `toast` (had no z-index).** It is `position: fixed` with no z-index in the mount, so a toast shown while a Dialog is open renders under the backdrop.
- **DragDrop ghost:** a candidate only. The ghost isn't portalled, so inside a Dialog it sits in the viewport's own context and may already be on top. Its test (drag inside a Dialog) decides: if it passes on v5.2.0, the ghost keeps its value as `overlay` and no fix ships.

**Native:** React Native takes a number for `zIndex`, not a CSS variable string. No native component uses layers in 5.3: Dialog, Drawer, Menu, Select and Combobox are not in the native entry, and the native ThemeProvider has no portal mount. When an overlay is ported, it imports the numeric `LAYERS` map from `@duro-app/tokens/keys`, not the `layers` vars. A unit test asserts that `LAYERS.overlay === 1000` and that every `LAYERS` value is a number.

The group is wired like `borders` in #68:

- the `src/index.ts` and `package.json` `exports`;
- `keys.ts` (`LAYER_KEYS`, a `LAYERS` map, the `LayerToken` type) and `raw.ts`;
- the drift check;
- `GROUP_NAMES` in vars.css and mockup.css;
- the CLI registry (`scaleGroup`), `TOKEN_DEEP_PATHS`, and the CLAUDE.md tables.

## 3. `effects.overlayBlur`

The new file is `packages/tokens/src/tokens/effects.css.ts`, a `defineVars` group with one token, `overlayBlur: 'blur(2px)'`. It is not themed. It is ticket-vision's value, and the only use in the fleet. The group is wired the same way as `layers`.

The token is documented with a limit: apply it only on the backdrop element itself. A `backdropFilter` on an ancestor becomes the containing block for fixed overlays, which is the Dialog/Drawer warning already in the code.

## 4. Lint

A new rule, `duro/no-raw-layer-values`, recommended at `warn`:

- **Why a separate rule:** ESLint sets severity per rule, and `no-raw-design-values` is an `error`. Folding these checks into it would make every raw z-index a new error on a minor.
- **Properties:** `zIndex` (numbers and numeric strings other than `0` and negatives) and `backdropFilter`/`filter` (`blur(...)` literals), inside `css.create`, condition objects included.
- **Message ids:** `rawZIndex` (a layers value, with a suggestion), `offScaleZIndex` (no exact token: it names the layer at or below and the one above, no fix) and `rawEffect` (with a suggestion for `blur(2px)`, report only for another blur).
- **Suggestions:** one per candidate, from the `LAYERS_BY_VALUE` and `EFFECTS_BY_VALUE` tables, which have drift tests.
- **Severity: `warn` for the 5.x line**, so no consumer's lint turns red on a minor. It becomes `error` in the next major, which is recorded in the eslint README.
- **Tests:** `zIndex: 16` is an invalid case (a warning, `offScaleZIndex`) in the new rule's tests; it stays a valid case in `no-raw-design-values`, which does not read z-index.
- **Local stacking values** (`2`, `10` inside one component) have no token. Their warning names the nearest layers and can't be fixed by a swap. The nine-consumer gate counts them per repo. Before the major that makes the check an error, the person decides whether to exempt small values or add a `local` step.

## 5. Release, then consumers

1. Create a worktree on branch `feat/duro-5-3-highlight-layers` with `worktree-task`. The plan is the first commit, followed by small commits: highlight, Badge variant, sizes, layers, then ButtonGroup attached and Toolbar (after layers, since a focused child uses `layers.raised`), then (tokens, then DS migration, then the two fixes, plus DragDrop if its test fails on v5.2.0), effects, lint, docs.
2. Run Verification, then the implementation review **in the parent session**, then preview approval in the parent session. Push, merge with `merge-when-green`, and release `v5.3.0` with `tag-release`, then check the tarball through the packument.
3. ticket-vision moves to `^5.3.0`:
   - Problem dot → `colors.highlight`, and the TODO is removed;
   - palette `zIndex` → `layers.overlay`;
   - backdrop → `effects.overlayBlur`.

   duro-lexical-multi (its held 0.4.0 branch), on `^5.3.0`:
   - the toolbar is a `Toolbar` holding `ButtonGroup attached` [Normal | Arial | 15px] and `ButtonGroup attached` [B | I | U | <> | link | T | highlighter], plus the Align and Insert menus;
   - B/I/U/<> are `Toggle`s whose pressed state follows the selection.

   It goes through a new preview with the person, releases 0.4.0, and then website-builder starts.

   social-planner, in a follow-up PR:
   - In `css.create`, `RAIL` and `HEADER_H` become `sizes.timeGutterW` and `sizes.dayHeaderH`.
   - The negated offset becomes `` `calc(-1 * ${sizes.timeGutterW})` ``.
   - The JS arithmetic (`size.width - RAIL`) reads the numbers `SIZES_PX.timeGutterW` and `SIZES_PX.dayHeaderH` from `@duro-app/tokens/keys`.
   - The `holds-until` comments are removed.

   It then follows its existing preview → push flow.

## Verification

Each check is listed as what goes in and what must come out.

### duro-design-system

- **CI commands:** `pnpm lint`, `typecheck`, `test`, `build` (prebuild drift check including the unitless layers) and `build-storybook` all exit 0.
- **Visual:**
  - The email harness (v5.2.0 → branch) stays 8/8 byte-identical.
  - Playwright screenshots, from a built Storybook of the v5.2.0 tag and of the branch, cover the stories of every component that moved to `layers`. They must match with `maxDiffPixels: 0`, except Popover-in-Dialog, Toast-over-Dialog and DragDrop-in-Dialog (if its fix ships).

**Tests:**

| Input                                                                                | Expected                                                                                                                           |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `contrast.test.ts`, highlight in 3 themes                                            | text ≥ 4.5:1, base ≥ 3:1                                                                                                           |
| Badge story `variant="highlight"`, 3 themes                                          | renders `highlightBg`/`highlightText` (computed style)                                                                             |
| Popover opened inside an open Dialog (browser)                                       | `elementFromPoint` at the popover's centre is inside it; red on v5.2.0, green on the branch                                        |
| Popover opened inside an open Drawer (browser)                                       | `elementFromPoint` at the popover's centre is inside it; red on v5.2.0, green on the branch                                        |
| Toast fired while a Dialog is open (browser)                                         | `elementFromPoint` at the toast's centre is inside it; red on v5.2.0, green on the branch                                          |
| DragDrop drag inside a Dialog (browser)                                              | run on v5.2.0 first: the result decides whether the fix ships (§2)                                                                 |
| lint `width: 64` / `height: 46`                                                      | suggestions `timeGutterW` / `dayHeaderH` (axis-filtered)                                                                           |
| lint `height: 64` / `width: 46`                                                      | no `timeGutterW` / `dayHeaderH` suggestion                                                                                         |
| lint `flexBasis: 64`                                                                 | suggestion `timeGutterW` (flexBasis has no axis)                                                                                   |
| `ButtonGroup attached` with 3 Selects, 3 themes (browser)                            | one outer border, no gaps; the inner corners' computed radius is 0, the outer ones `radii.sm`; screenshot per theme                |
| Focus the middle Select of an attached group (browser)                               | its focus ring is fully visible (computed z-index is `layers.raised`, above both neighbours)                                       |
| `Toolbar` with two groups and a Menu: Tab, then ArrowRight ×8, End, Home (browser)   | one Tab enters; each arrow moves `document.activeElement` to the next control across groups; End and Home reach the last and first |
| Select trigger inside `Toolbar`: ArrowDown                                           | opens the Select, not toolbar navigation; Escape closes it and focus stays on the trigger                                          |
| Select open inside `Toolbar`: ArrowRight                                             | focus stays on the trigger and the listbox stays open                                                                              |
| An attached group of three named `Select`s                                           | each trigger `<button>`'s four computed corner radii match its position (outer `radii.sm`, inner 0)                                |
| Link Popover open inside an attached group in a `Toolbar`: Tab                       | reaches the Popover's Apply button in 1 press; that button has all corners round                                                   |
| Pressed `Toggle` between two neighbours                                              | its accent border is visible on all four sides                                                                                     |
| B and I both pressed side by side, then focus I                                      | both accent borders visible; I's whole focus ring visible (`elementFromPoint` sampled along the shared edge)                       |
| ArrowLeft in the link Popover's URL input, inside a `Toolbar`                        | the caret moves; `document.activeElement` stays the input                                                                          |
| Toggle in an attached group, pressed (browser)                                       | `aria-pressed="true"`, pressed style, corners still joined                                                                         |
| `LAYERS` (keys.ts) unit test                                                         | `LAYERS.overlay === 1000`; every value is a number                                                                                 |
| DialogFromPopover (a Dialog opened from a button in an open Popover, no outer modal) | `elementFromPoint` at the Dialog's centre is inside the Dialog; the Popover is `floating` (50)                                     |
| ReorderKeyedChildren (keyed controls reversed without remount)                       | corners, tab stop and arrow order follow the new DOM order                                                                         |
| `packages/ui/src` scan                                                               | 0 raw `zIndex` literals                                                                                                            |
| Escape inside Menu-in-Dialog, Select-in-Dialog                                       | unchanged from 5.2 (existing stories pass)                                                                                         |
| lint `zIndex: 1000`                                                                  | warning `rawZIndex`, suggestion `layers.overlay`                                                                                   |
| lint `zIndex: 1050`                                                                  | warning, suggestion `layers.popup`                                                                                                 |
| lint `zIndex: 0` / `-1`                                                              | no report                                                                                                                          |
| lint `backdropFilter: 'blur(2px)'`                                                   | warning `rawEffect`, suggestion `effects.overlayBlur`                                                                              |
| `generate-vars-css`                                                                  | `--duro-layer-overlay: 1000`, `--duro-layer-toast: 1060`, `--duro-effect-overlay-blur: blur(2px)` present                          |

### All nine consumers, before tagging

Install the packed 5.3 tarballs, then run lint and `duro doctor`, and record error counts.

- **Lint errors:** 0 new errors in every repo. New `rawZIndex`/`rawEffect` warnings are counted per repo, split into values with an exact token and values without one. New size suggestions per repo (`timeGutterW`/`dayHeaderH` offered for an unrelated 64 or 46) are counted too.
- **ticket-vision:** with its §5.3 swaps applied, 0 errors and 0 of the new warnings.

## Deviations

Found while implementing; each is in the sections above and in the PR body.

- **`layers.popover` (1040)** added (§2). It is used only inside a Dialog or Drawer; elsewhere a Popover is `floating`.
- **`duro/no-raw-layer-values`** is a separate rule rather than message ids in `no-raw-design-values` (§4).
- **Toolbar keeps a `defaultPrevented` check** next to the `aria-expanded` guard, with a document-level listener that makes it effective (§1c).
- **DragDrop's ghost** was red on v5.2.0 because the Dialog panel's transform and overflow clipped and offset it, not because of a z-index tie. Its fix is a portal into the ThemeProvider mount at `layers.popup` (§2).
- **Layer vars are typed as CSS integers** (a cast inside the `defineVars` argument), so `zIndex: layers.x` typechecks.
- **Ordered registry** re-reads the DOM order after every commit, so keyed controls reordered without a remount keep correct corners and arrow order.
- **Known limit:** a Dialog opened from a Popover that is itself inside a Dialog still renders under that Popover. It is marked `holds-until` in `ModalContext.ts`, and no consumer needs it yet.
- **website-builder** was gated on its held `chore/duro-5.1` branch: origin/main is still on Duro 4.5, and merging the branch onto it conflicted.

<!-- panel: repos=duro-design-system reviewers=backend body-sha=339caf9354ef -->
