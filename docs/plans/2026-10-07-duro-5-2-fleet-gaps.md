---
status: active
branch: feat/duro-5-2-fleet-gaps
repos: [duro-design-system]
adrs: [ADR-0006, ADR-0016, ADR-0027]
---

# Duro 5.2: close the gaps the fleet hit moving to 5.x

## Review panel

👉 **Decide:** none — approve if one 5.2 (≈31 role tokens, Menu/Dialog/Listbox/TextLink/ghost Input, lint+doctor fixes) is worth unblocking five repos.
📍 duro-design-system · plan reviewed, nothing built · next: worktree, plan commit, tokens. Panel: backend, typescript, react, ui-design, ux-research, game-ux, unix, tui.
**Changed by review:** lint axis filter + suggestion per candidate (shared px values); Menu follows APG focus, Escape nested-safe; doctor `media-var` reads fresh CSS only, all 9 consumers gated.
**Verdicts:** round 1 8× approve-with-changes; round 2 backend approve-with-changes. Left for implementation: equidistant nearest-role tie lists both values, smaller first (`width: 220`).
📄 Full reviews: [2026-10-07-duro-5-2-fleet-gaps.reviews.md](2026-10-07-duro-5-2-fleet-gaps.reviews.md)

## Context

On 2026-10-07 all nine `@duro-app/ui` consumers were migrated to 5.1.0, each in a `chore/duro-5.1` worktree.

- **Green:** application-landscape, kb-vision and cluster-vision. duro-app is green too, but uses rem stand-ins.
- **Blocked:** customer-vision, social-planner, ticket-vision, website-builder and duro-lexical-multi. Each is blocked on design-system gaps, because ADR-0027 (`design-system.every-measure-is-a-token`, `a-missing-token-is-added-not-approximated`) and ADR-0006 (`design-system.gaps-go-upstream`) forbid local literals, approximations and look-alike components.

The person decided:

- **one token per role**, not one per raw value: values are chosen here, and apps move a few px to match;
- **editor and colour-picker sizes become tokens**;
- **the website-builder palette shift is accepted**;
- **the green repos land now**;
- **duro-app's rem stand-ins** are replaced in a follow-up PR after 5.2.

  5.2 is a **minor**. It adds tokens, props and components, and it changes the behaviour of three components, listed in §2 and in the release notes. Its stricter lint and doctor checks are gated on "0 new errors in all nine consumers" (Verification). `HOOK_MIN_CLI`/`SKILL_MIN_CLI` stay at 5.0.0, so `check-pin-major` passes.

**Rollback.** npm versions are immutable, so a bad 5.2.0 is superseded by 5.2.1, never overwritten. Consumers stay on their 5.1 pins until each one's preview is approved.

## 1. Tokens

New sizes and colours follow the path #68 used:

- `packages/tokens/src/tokens/sizes.css.ts`;
- `keys.ts` (`SIZE_KEYS`, `SIZES_PX`);
- `raw.ts`;
- `packages/eslint-plugin/src/util/tokens.ts`;
- then `pnpm duro:docs` regenerates the registry and the CLAUDE.md tables.

The drift tests (`registry.test.ts`, `token-drift.test.ts`, `check-token-drift.mjs`) hold every copy to the others.

### sizes (new keys; value in px; consumer values it absorbs)

| Role                   | Token = px                                                                                             | Absorbs (repo)                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Nav/side panel width   | `sidebarW` = 240                                                                                       | 220 (cluster-vision), 232 (social-planner), 264 (website-builder panel)                    |
| Page max-width steps   | `pageXs` = 480, `pageXl` = 1440                                                                        | 500, 720→`pageMd`, 1100→`pageLg` (ticket-vision); 1400 (customer-vision)                   |
| Aside column           | `asideW` = 320                                                                                         | `1fr 300px` (ticket-vision), compare panel 320 (cluster-vision)                            |
| Narrow grid column     | `gridColXs` = 200                                                                                      | `minmax(180px, …)` (ticket-vision ×3)                                                      |
| Field min-width        | `fieldMinWSm` = 80, `fieldMinW` = 160                                                                  | 72 (duro-app ×3), 80, 150, 180 (ticket-vision)                                             |
| Popover width          | `popoverWSm` = 240, `popoverW` = 320                                                                   | 240/320 (duro-app HelpPopover), drag preview 220 (social-planner), typeahead 200 (lexical) |
| Popup max-width        | `popupMaxW` = 280                                                                                      | menu item / link text 250 (lexical)                                                        |
| Meter bar              | `meterH` = 6                                                                                           | completeness bar (duro-app)                                                                |
| Skeleton chip          | `skeletonChipW` = 96                                                                                   | 92 (duro-app)                                                                              |
| Drop column min-height | `dropZoneMinH` = 128                                                                                   | kanban column (customer-vision)                                                            |
| Canvas min-height      | `canvasMinH` = 480                                                                                     | circle map 500 (cluster-vision)                                                            |
| Editor area            | `editorMinH` = 160, `toolbarH` = 36, `embedW` = 550                                                    | 150; 35/36; tweet 550 (lexical)                                                            |
| Colour picker          | `colorPickerW` = 196, `colorAreaH` = 150, `colorTrackH` = 12, `colorSwatch` = 20, `colorPreviewH` = 22 | ColorPicker (lexical)                                                                      |
| Editor chrome          | `handle` = 16, `chip` = 24, `placeholderMinH` = 80, `previewMaxH` = 320                                | 16; 18/22/26; 60/80; ghost 340 (website-builder)                                           |

These are covered by existing tokens or layout, so they need no new size:

- link-editor icon buttons 35 → `iconButton` (32);
- the 30px toolbar cell → `iconButton`;
- `calc(100% - 75px)` → flex layout;
- the 900px breakpoint → `breakpoints.lg`;
- header padding 20 → the spacing scale.

The lexical `Modal`, empty-menu and `DropDown` sizes go away once §2 lets those components move to `Dialog`/`Menu`.

Names follow the existing pattern: a role noun, then Sm/Lg or W/H/MinW/MaxW. Names may be refined in review; values are fixed once the plan is approved.

**Values shared with existing tokens** (intended, since these are different roles at the same size). The lint changes in §3 keep a fix available for each value:

| px         | tokens at this value after 5.2                          |
| ---------- | ------------------------------------------------------- |
| 160        | `popupMinW`, `fieldMinW` (W) · `editorMinH` (H)         |
| 200        | `listMaxHSm` (H) · `gridColXs` (W)                      |
| 240        | `gridColSm`, `sidebarW`, `popoverWSm` (W)               |
| 280        | `gridColMd`, `popupMaxW` (W) · `listMaxH` (H)           |
| 320        | `asideW`, `popoverW` (W) · `previewMaxH` (H)            |
| 480        | `panelMd`, `pageXs` (W) · `canvasMinH` (H)              |
| 16, 24, 36 | icon/glyph/spinner sizes · `handle`, `chip`, `toolbarH` |

### colours and shadows

**`contrastSurface` and `onContrastSurface`.** These are new names, chosen so they are not confused with the fixed overlays `inverse*`. The surface takes the opposite tone of the theme:

- light theme: the dark theme's `bgCard`, with the dark theme's `text` on it;
- dark theme: the light theme's `bgCard`, with the light theme's `text` on it;
- high contrast: pure black/white.

Used by website-builder's toasts, coach pill and tabs. A test asserts text contrast of at least 4.5:1 in every theme. They are wired in `colors.css.ts`, both theme files, the `raw.ts` palettes and `COLOR_TOKENS`.

**`overlayLight`.** A fixed translucent white, the light counterpart of `scrim`. Its value is website-builder's literal.

**`shadows.dropReady` and `shadows.dropOver`.** These are DragDrop's drop-target rings (`DragDrop/styles.css.ts:35,38`), built from `borders` widths and `colors.accent`. They are not focus rings: focus stays on outlines (`borders.focusRing`), which survive forced-colors mode.

## 2. Components (packages/ui)

| Gap (reporter)                                               | Change                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Menu.Popup` clipped by sticky/overflow ancestors (lexical)  | Portal through `usePortalMount()`, place with `computePopoverPosition` (`Popover/position.ts`) plus Popover's resize/scroll effect, register with `usePopoverLayer`, and replace the backdrop with `Popover/outside.ts`. Cap at `listMaxH` with overflow scrolling.                                                                                             |
| Menu focus and assistive tech (review)                       | Follow the APG menu button. On open, focus moves to the portalled `role="menu"` element, and `aria-activedescendant` stays on it. On close, focus returns to the trigger. The keydown handler is on the popup element itself (never `document`). Escape calls `preventDefault` and `stopPropagation`, so an outer Popover or Dialog stays open.                 |
| `Menu.Trigger` closed API (lexical)                          | Add `aria-label`, `variant?: 'default' \| 'ghost'` and `ref`.                                                                                                                                                                                                                                                                                                   |
| `Dialog` focus, Escape tied to `dismissable` (lexical)       | Initial focus (`initialFocus?` ref, else the first focusable element, else the popup with tabIndex −1), focus restore on close, `closeOnEscape?: boolean` (default true) separate from `dismissable`, and a dev warning when it is false and the dialog has no `Dialog.Close`. Escape returns early if `e.defaultPrevented` (a nested Menu already handled it). |
| Typeahead must keep editor focus (lexical)                   | Headless `Listbox` (`Root`, `Option`, `Empty`, controlled `highlightedId`, `anchor`, `getOptionId`), with `getAnchorProps()` giving the editor `aria-controls`, `aria-expanded` and `aria-activedescendant`. Cap at `listMaxH`. Extracted from Combobox's listbox; Combobox is rebuilt on it, and its existing tests stay unchanged and must pass.              |
| No borderless Input (ticket-vision)                          | `Input variant="ghost"` (the `inGroup` style plus a focus ring), with error and disabled states. Documented only for inline-edit contexts that have a visible label.                                                                                                                                                                                            |
| Clickable addon has no name (duro-app)                       | `InputGroup.Addon` `aria-label`.                                                                                                                                                                                                                                                                                                                                |
| No text link; apps need `css.create` (website-builder admin) | Precompiled `TextLink` (`href`, `target`, `rel`, `variant: 'default' \| 'subtle'`, `aria-label`). Inside running text, `subtle` keeps an underline, so colour is never the only cue.                                                                                                                                                                            |
| `Button` takes no ref (website-builder)                      | `ref?: React.Ref<HTMLButtonElement>` (web only; documented, with native unchanged), plus `aria-expanded`/`aria-controls` passthrough.                                                                                                                                                                                                                           |
| `visuallyHidden` not exported (duro-app, website-builder)    | Export a `<VisuallyHidden>` component.                                                                                                                                                                                                                                                                                                                          |
| Grid cannot take track lists (ticket-vision)                 | Grid `tracks?: readonly GridTrack[]` (web; native falls back to equal weights) and export `GridTrack`.                                                                                                                                                                                                                                                          |

**Mockup step (ADR-0016).** `TextLink` and `Input variant="ghost"` are new visual choices. Before they are implemented, `duro mockup seed` produces 2–3 directions for each (underline, colour, hover and focus treatment), and the person picks one.

**Behaviour changes in the release notes:**

- Menu's popup is portalled and takes focus.
- Dialog moves focus on open.
- Combobox is rebuilt on Listbox, with unchanged behaviour.

**Tests** select by `getByRole` and name (eslint-config `tests` preset).

## 3. Lint and doctor

### `no-raw-design-values` (`packages/eslint-plugin`)

- **Axis filter:** candidates depend on the property. `W`/`MinW`/`MaxW` tokens are only offered for width properties, and `H`/`MinH`/`MaxH` tokens only for height properties. Unsuffixed tokens are offered for both.
- **Ambiguous values:** when several tokens match, the rule emits one ESLint `suggest` per candidate, so there is never a dead end.
- **Nearest role:** when no token matches but one on the same axis is within ±10%, the message lists every same-axis token at that nearest value ("nearest role: `sizes.gridColSm`, `sizes.sidebarW`, `sizes.popoverWSm` (240)"). It only says "add a token" when nothing is that close.
- **Shadows:** stop skipping template-literal `boxShadow`. DragDrop moves to `dropReady`/`dropOver` in the same commit.

### `no-flex-grow-web`

- Skip `*.native.*` files (website-builder).
- First check the rule's premise with a browser test against react-strict-dom: ticket-vision saw `flexGrow` compute to 1 and fill the space.
  - If RSD on web honours `flexGrow`, retire the rule. Removing a rule only loosens lint.
  - Otherwise narrow the rule to the failing cases, with that test as proof.

### doctor `tokens-compiled` (`packages/cli/src/commands/doctor.ts:401-478`)

- Resolve `noExternal` given as an identifier, including the shorthand `{noExternal}`, a local const and an imported const. Blank out the identifier's declaration the way inline lists are blanked, so a declared-but-unused list does not count as Babel routing.
- When the identifier still can't be resolved, report `warn`. The message names the identifier and the config file and line, and the fix says "make sure `'@duro-app/tokens'` is in `<identifier>`, or declare `noExternal` inline".

### New doctor check `media-var`

At most 18 characters, so the report columns stay aligned.

- **What it scans:** only `*.css` under `build/` and `dist/`, and only files newer than the newest config or source file. The scan is capped like `SOURCE_SCAN_LIMIT`.
- **Error:** any `@media` whose condition contains `var(--`. The message gives the file and the media query text (cut to about 80 characters, since built CSS is one line). The fix says: "compile `@duro-app/tokens/tokens/breakpoints.css.ts` through the StyleX/RSD babel step, rebuild, re-run `npx -y @duro-app/cli doctor`".
- **No fresh CSS:** the check is listed as `skipped (no fresh build)` and left out of `--json` `checked`.

### Doctor output

- **Exit codes:** `warn` exits 0 and `error` exits 1, documented in the doctor section of `packages/cli/README.md` (around line 180, not the lookup command's exit-code table). The `media-var` row is added to that section's rule table.
- **Session hook:** its opening line becomes generic ("N errors in this repo's @duro-app/ui setup"), worded by finding type, so it no longer always says "spacing flattened".

## 4. Release, then consumers

1. Work in a duro-design-system worktree on branch `feat/duro-5.2-fleet-gaps`, created with `worktree-task`. This plan is the first commit. After that there are small commits: tokens, colours, lint, doctor, then one per component. The TextLink and ghost mockup pick comes before their commits.
2. Run the Verification below, then the implementation review, then push. Open the PR and merge it with `merge-when-green`. Release v5.2.0 with the `tag-release` skill, then check the tarball through the packument.
3. Finish each consumer in its existing `chore/duro-5.1` worktree, bumping to `^5.2.0`, in this order:
   1. **duro-lexical-multi:** swap the Align/Insert menus to `Menu`, `Modal` to `Dialog`, typeahead to `Listbox`; then release 0.4.0.
   2. **website-builder:** bump lexical-multi to 0.4.0.
   3. **ticket-vision, customer-vision, social-planner.**
   4. **duro-app:** a follow-up PR replacing the rem stand-ins.

   Each preview carries:
   - a table of absorbed deltas: old px → token px, with file:line;
   - before/after screenshots of the affected regions (sidebar, aside, typeahead, colour picker, lexical icon buttons and chips).

## Verification

Each check is listed as what goes in and what must come out.

### duro-design-system

- **CI commands:** `pnpm lint`, `typecheck`, `test`, `build` (prebuild drift check) and `build-storybook` all exit 0.
- **ui-email:** `smoke-packed.mjs` exits 0. The duro-app email harness (`render-consumer-emails.mjs --base v5.1.0 --candidate <branch>`) reports 8/8 byte-identical.
- **Lint rule tests:**

  | Input                                | Expected                                                                                     |
  | ------------------------------------ | -------------------------------------------------------------------------------------------- |
  | `width: 240`                         | 3 suggestions (`gridColSm`, `sidebarW`, `popoverWSm`) and no `editorMinH`-style height token |
  | `height: 160`                        | `editorMinH` only                                                                            |
  | `width: 232`                         | message lists `gridColSm`, `sidebarW`, `popoverWSm` (240) as nearest role                    |
  | template-literal `boxShadow` with px | reported                                                                                     |

- **Doctor fixtures**, checking exit code, severity and `--json` `checked`:

  | Fixture                                                | Expected                           |
  | ------------------------------------------------------ | ---------------------------------- |
  | Imported `noExternal` const routed through Babel       | pass, exit 0                       |
  | Unresolvable identifier                                | warn, exit 0, names the identifier |
  | Const declared but no Babel route                      | error, exit 1                      |
  | Fresh `dist/x.css` with `@media (max-width: var(--x))` | `media-var` error, exit 1          |
  | Same CSS older than `vite.config.ts`                   | skipped, exit 0                    |

  The text report must still line up at 80 columns.

- **Browser (headless Chromium, Storybook):**

  | Story                                                  | Expected                                                                                         |
  | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
  | Menu in a sticky `overflow:auto` toolbar with 30 items | the popup's bounding box is inside the viewport and scrolls                                      |
  | ArrowDown in the Menu                                  | `document.activeElement` is the menu, and its `aria-activedescendant` names the highlighted item |
  | Menu inside a Dialog, one Escape                       | Menu `onOpenChange` called 1×, Dialog 0×                                                         |
  | `EscapeInNestedMenu`                                   | still passes                                                                                     |
  | Dialog with `dismissable={false}`                      | Escape closes it                                                                                 |
  | Listbox driven from a contenteditable                  | focus stays in the editor, and its `aria-activedescendant` follows the highlight                 |
  | Typing in an editor while a Menu is open               | typed text is not intercepted                                                                    |
  | Forced-colors emulation                                | the focus outline is visible on DragDrop and ghost Input                                         |
  | `contrastSurface` text in every theme                  | contrast ≥ 4.5:1                                                                                 |

- **Size:** record dist size and the line count of `vars.css` on 5.1.0 and on 5.2.

### All nine consumers, before tagging

Install the packed 5.2 tarballs, then run `pnpm lint` (or `npm run lint`) and `duro doctor`, and record error counts on 5.1 and on 5.2.

- **The four green repos** (application-landscape, kb-vision, cluster-vision, duro-app): 0 new errors.
- **The five blocked repos:** 0 errors once the §1 token swaps and §2 component swaps are applied. That proves the list is complete before the version is published. For website-builder, pack duro-lexical-multi from its worktree against the 5.2 tarballs and install that tarball, since lexical-multi 0.4.0 is only released after 5.2.0.
- **`media-var`** fires only where the problem is real: customer-vision without its PostCSS fix.
- **Timing:** `duro doctor --session` on website-builder with `dist/` present takes under 1 s.

## Addendum: website-builder values (2026-10-07)

The nine-consumer gate found website-builder measures the sizes table did not fix. The person decided, after the review panel:

- **Mockup picks (ADR-0016):** TextLink takes direction `Underlined`; `Input variant="ghost"` takes `OutlineOnHover`. The other boards are deleted.
- **New tokens:**
  - sizes `barH` = 4 (device home bar, page nest bar), `readoutW` = 40 (zoom readout, was 34), `sliderW` = 96 (zoom slider), `paletteMinW` = 96 (add-section tile, was 92);
  - colour `contrastBorder`, themed with `contrastSurface`: website-builder's coach-pill border where the pill sits, mirrored for the other themes, held to 3:1 non-text contrast against `contrastSurface` by a test.
- **Existing roles:** the 5×5 override marker → `indicatorDot` (8); the 64px number field → `fieldMinWSm` (80); the 120px grid min-height → `dropZoneMinH` (128).
- **Follow-up decisions (after the first review):**
  - `contrastBorder` is raised to 3:1: white at 0.33 opacity in light; black at 0.42 in dark and high contrast. Those surfaces are light, so white would vanish; this is the mirror of the light value. The ≥ 3:1 test runs in every theme.
  - The device home bar's width gets its own size `deviceBarW` = 96 (device-chrome indicator).
- **Branch** renamed `feat/duro-5-2-fleet-gaps` (amont's push pattern refuses a dot after `feat/`).

## Verification record (2026-10-07, observed before the push)

**duro-design-system** (tree `ec0822b2`, rebased on `df0d5eb4`; the email harness on `6c32bbed`):

| Check                                                                                                              | Actual                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| prettier, `pnpm lint`, `typecheck`, `build`, `build-storybook`                                                     | exit 0 (lint: 0 errors, 17 pre-existing warnings)                                                                                                                 |
| unit (346) and Storybook (354) suites                                                                              | pass, run alone with nothing else on the machine (earlier runs under load timed out `popover.test.ts` and `DrawerScroll` drag stories; both pass alone)           |
| `smoke-packed.mjs`                                                                                                 | pass                                                                                                                                                              |
| duro-app email harness, v5.1.0 vs branch                                                                           | 8/8 byte-identical                                                                                                                                                |
| `width: 240`                                                                                                       | 3 suggestions `gridColSm`, `sidebarW`, `popoverWSm`; no height token                                                                                              |
| `height: 160`                                                                                                      | `editorMinH` only                                                                                                                                                 |
| `width: 232`                                                                                                       | nearest role `gridColSm`, `sidebarW`, `popoverWSm` (240)                                                                                                          |
| `width: 220` (tie)                                                                                                 | `gridColXs` (200), then the 240 tokens, smaller first                                                                                                             |
| template-literal `boxShadow` with px                                                                               | reported (`rawShadowLength`)                                                                                                                                      |
| doctor fixtures (5 rows)                                                                                           | as expected: pass/0, warn/0 naming the identifier, error/1, `media-var` error/1, skipped/0 and absent from `--json` `checked`; header lines ≤ 80 columns, aligned |
| Menu, sticky overflow toolbar, 30 items                                                                            | inside the viewport; scrolls                                                                                                                                      |
| ArrowDown in Menu                                                                                                  | focus on the menu; `aria-activedescendant` names the item                                                                                                         |
| Menu in Dialog, one Escape                                                                                         | Menu `onOpenChange(false)` once, Dialog 0×                                                                                                                        |
| `EscapeInNestedMenu`                                                                                               | passes                                                                                                                                                            |
| Dialog `dismissable={false}`                                                                                       | Escape closes it                                                                                                                                                  |
| Listbox from a contenteditable                                                                                     | focus stays in the editor; `aria-activedescendant` follows                                                                                                        |
| typing in an editor with a Menu open                                                                               | not intercepted                                                                                                                                                   |
| Tab out of a Menu inside a Dialog (real keyboard: Vitest browser `userEvent.keyboard('{Tab}')`, `TabInsideDialog`) | the menu closes and focus lands on the next button in the dialog                                                                                                  |
| `contrastBorder` on `contrastSurface`                                                                              | ≥ 3:1 in every theme (3.01 light, 3.00 dark, 3.04 high contrast), unit test                                                                                       |
| forced colours (Playwright `emulateMedia`, built Storybook)                                                        | DragDrop: box-shadow `none`, outline solid `rgb(0,0,0)`; ghost Input focused: outline 2px solid, visible                                                          |
| `contrastSurface` text                                                                                             | ≥ 4.5:1 in every theme                                                                                                                                            |
| size, 5.1.0 → 5.2                                                                                                  | ui dist 3644K → 3796K (tgz 623,031 → 661,750 B); tokens 208K → 228K; eslint-plugin 280K → 292K; cli 456K → 480K; `vars.css` 222 → 259 lines                       |

**Nine consumers** (ESLint errors / doctor errors; 5.2 tarballs packed from this branch; throwaway checkouts, removed after):

| Repo                                                       | 5.1        | 5.2        | 5.2 + §1/§2 swaps                                                                                                  |
| ---------------------------------------------------------- | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| application-landscape, kb-vision, cluster-vision, duro-app | 0 / 0 each | 0 / 0 each | —                                                                                                                  |
| customer-vision                                            | 2 / 1      | 2 / 0      | 0 / 0                                                                                                              |
| social-planner                                             | 2 / 0      | 2 / 0      | 0 / 0                                                                                                              |
| ticket-vision                                              | 12 / 0     | 12 / 0     | 0 / 0 (CommandPalette → `Input variant="ghost"`)                                                                   |
| duro-lexical-multi                                         | 30 / 0     | 30 / 0     | 0 / 0 (Menu, Dialog, Listbox swaps; tsc and build pass)                                                            |
| website-builder (with that lexical 0.4.0 tarball)          | 61 / 0     | 61 / 0     | 0 / 0 (rerun after the follow-up tokens; text on `contrastSurface` moved to `onContrastSurface`; typecheck passes) |

- website-builder's last two closed with `deviceBarW` (home bar width) and `contrastBorder` (coach-pill border).
- customer-vision's 5.1 doctor error was a `noExternal` false positive that 5.2 resolves.
- `media-var` on customer-vision: no error with its PostCSS fix, one error with the fix reverted. The other repos had no fresh build, so it was skipped there.
- `doctor --session` on website-builder with `dist/` present: 0.13–0.16 s.

**Resolved:** the person raised `contrastBorder` to 3:1 (white 0.33 light; black 0.42 dark and high contrast) and added `deviceBarW`; see the addendum.

## Implementation review

- Earlier tree: **rework** after the Delta (round 1 85k/95 s, Delta 47k/31 s). Blocking: `contrastBorder` and website-builder's last two errors. The person chose Fix; both are now resolved (addendum). The low findings are also fixed: the highlight ref is set in a layout effect, and the real-keyboard Tab check is a browser test.
- Fresh round 1 on the rebased tree: see below.

<!-- panel: repos=duro-design-system reviewers=backend,lang:typescript,react,ui-design,ux-research,game-ux,unix,tui body-sha=0d0e0a81ffe0 -->
