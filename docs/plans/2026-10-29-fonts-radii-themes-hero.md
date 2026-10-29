---
status: active
branch: feat/theme-fonts-radii
repos: [duro-design-system]
adrs: [ADR-0027, ADR-0048]
---

# Fonts and radii in Duro themes, hero size tokens

## Review panel

👉 **Decide:** none — approve if one `tokens` prop over every group (guard rails, layers/breakpoints refused) is the 5.37 scope you asked for.
📍 duro-design-system · Phases 1–3 committed (hero tokens, fonts/radii, CLI) · next: Phase 3b generalizes them. Panel: full panel + codex on the first body; delta: backend (opus-5-5) twice.
**Changed by review:** default values (`clamp(… + 2vw …)`, `rgba(…, …)` shadows) must pass their own rules; missing key lists and drift checks added; `@duro-app/tokens/theme` built export, no `react-strict-dom` pulled into the CLI.
**Verdicts:** round 1: 10 approve-with-changes; codex approve-with-changes; delta (the person's change): backend approve-with-changes, then approve-with-changes with 3 highs resolved; 19 findings carried into implementation.
📄 Full reviews: [2026-10-29-fonts-radii-themes-hero.reviews.md](2026-10-29-fonts-radii-themes-hero.reviews.md)

## Context

greenharness.dev is moving onto the Duro design system (ADR-0048 makes Duro the optional `design` part of Green Harness). Mockup A reproduces today's page, and since `duro mockup seed --overrides` (v5.36.0, duro#152) it carries the Matrix palette. Two looks still cannot be expressed in Duro:

- **The font.** The page is set in JetBrains Mono. `ThemeProvider overrides` replaces colours only (`overrideRule.ts` drops anything that is not a colour), so a themed app cannot change `typography.fontFamily` / `fontFamilyMono`.
- **The corners.** The page is near-square. Duro's `radii` (xs 4 … lg 16) are fixed, so Card, Button and CodeBlock come out rounder than the brand.

The hero also borrows an unrelated size token (`previewMaxH`, 320px). The person asked for a hero that adapts to screen heights and wanted the UX view. Both UX reviewers (game UX, UX research) answered the same way:

- **No generic `Hero` component.** A game hero has one consumer.
- **Size tokens instead,** and a height in `svh`: it is stable when the mobile URL bar collapses (web.dev viewport units), unlike `vh` or `dvh`.
- **Not full height.** NN/g ("illusion of completeness"): 6 of 8 users did not scroll past a full-screen hero, so the headline and the install command must show below it.
- **Accessibility fixes in the game:**
  - keys are captured only after the canvas has focus (WCAG 2.1.1, 2.1.2, and 2.1.4 for J/L);
  - Escape releases focus;
  - a "Skip to install" link;
  - no self-running motion under reduced motion.

The person decided: no traffic light at rest; it appears when the game starts.

## Decisions

- **Change, 2026-10-29 (the person, after the first implementation review): every token group is themable in 5.37.** The person asked "we have other components with size, how do we override there? I thought we could theme with tokens everything" and chose "Generalize now in 5.37" over shipping three groups first.
- **API shape: one `tokens` prop.** `ThemeProvider` gains `tokens?: ThemeTokens`, an object keyed by token group, each a partial record of that group's keys:
  - `colors`, `shadows`, `typography`, `typeScale`, `spacing`, `layoutSpacing`, `radii`, `sizes`, `borders`, `duration`, `easing` and `effects`;
  - `overrides` stays as the colour alias for 5.x (`tokens.colors` wins on a clash);
  - the unreleased `fonts` / `radii` props go away.
- **Not themable** (the keys are refused, with a warning naming why):
  - `layers`: they order one stacking context;
  - `breakpoints`: media queries and JS read them;
  - `microSpacing` and `radii.px6`: named after their value;
  - `radii.full`: a shape, not a size.
- **Guard rails** on keys that carry a guarantee:
  - `sizes.touchTarget` ≥ 44px;
  - `borders.focusRing` ≥ 2px;
  - `borders.focusOffset` / `focusOffsetSm` ≥ 0.

  A rem value is converted at 16px for the floor. A value under its floor is refused like an invalid one.

- **Inheritance.** `colors` and `shadows` reset when a nested provider changes theme, because every theme defines them. Every other group always inherits, and the child's valid entries lay over it, so web (CSS cascade) and native (`createTheme`) agree.
- **Theme file shape.** The file `mockup seed --overrides` reads is the same object as `tokens`. A flat object of colour keys (the v5.36 shape) is still accepted. An app passes the file as is: `<ThemeProvider tokens={theme}>`.
- **Validation, one rule per kind of value, in one module both the UI and the CLI import.** The module is `@duro-app/tokens/theme`, built to `dist/theme.js`; `@duro-app/cli` gains `@duro-app/tokens` as a dependency, so there are no copies:
  - **colour:** `isSafeColor` (unchanged);
  - **font family** (`typography.fontFamily`, `fontFamilyMono`): a grammar, not a blacklist. It is a comma-separated list where each item is a run of identifiers (`[A-Za-z_-][\w -]*`) or one balanced single- or double-quoted string with no quote or backslash inside. Nothing in the value may contain `;{}<>\`, `/*`, `*/`, `url(`, `var(` or `expression(`, because an unbalanced quote or comment would swallow the rule's closing brace;
  - **length** (`spacing`, `layoutSpacing`, `radii`, `sizes`, `borders`, `typography.fontSize*`, `typeScale.fontSize*` / `lineHeight*`): `0`, or a non-negative number with `px` or `rem`;
  - **fluid length** (`typeScale.display*`): a length, or `clamp(` of three items, each a length, a number with `vw` / `svh`, or a sum `<length> + <number>vw|svh` (the shipped `displaySm` is `clamp(2.25rem, 1.5rem + 2vw, 3rem)`). Every shipped default of every themable group passes its own rule, asserted by a test;
  - **letter spacing:** `0`, or a signed number with `em` or `px`;
  - **font weight:** 100–900 in steps of 100;
  - **line height** (`typography.lineHeight`): a unitless number from 1 to 3;
  - **shadow:** a list of `[inset] <length>{2,4} <colour>`, split on top-level commas only (the defaults hold `rgba(0, 0, 0, 0.3)`);
  - **duration:** a non-negative number with `ms` or `s`;
  - **easing:** `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out` or `cubic-bezier(` of four numbers;
  - **effect:** `blur(<length>)`.
  - **Dropped values:** an invalid value is dropped in the app and is a usage error in the CLI. In development the app logs one warning per distinct dropped value, from an effect (not during render), naming the group, key, value and the rule, e.g. `sizes.touchTarget: 40px is under the 44px floor`. The CLI words the same rule identically.
- **Native.** Colour overrides already apply through `css.createTheme(colors, …)` (`ThemeProvider.native.tsx:100-112`). React-strict-dom's native `createTheme` is generic over any `defineVars` group (`dist/native/index.js:1315`), so each themed group appends its own `css.createTheme(<group>, …)` to the same `themeStyles`, which `ThemeScopeContext` / `PortalHost` already carry. `useResolvedColors` stays colours only.
  - React Native takes one family name, so native uses the first family of the list, with its quotes stripped (`'JetBrains Mono'` → `JetBrains Mono`).
  - The app loads the font itself (expo-font); ThemeProvider never loads fonts, on web or native.
  - **Open risk:** whether react-strict-dom's native `createTheme` overrides the `typography` and `radii` vars at runtime is unverified. Phase 2 starts with a spike in `examples/native`. If it does not work, native ignores `fonts` / `radii` and logs one dev-mode warning. The plan records that; it is not worked around.
- **Hero tokens.** `heroMinH` 360px (the smallest height where the game is playable, to be confirmed before Phase 1 by rendering the ready box, the game-over box and the HUD in `drive.html` at decreasing heights and recording the first height that clips; today's canvas minimum is 440px), `heroReserve` 240px (room for the site header, the top padding, the headline and the install command; measured on `drive.html` at 1280×600 and 390×844 before Phase 1 fixes it, raised if the command does not fit), `heroMaxH` 720px.
  - The site sizes its hero as `clamp(heroMinH, calc(100svh - heroReserve), heroMaxH)`. A `calc()` of tokens is allowed under `ui.measures` (ADR-0027).
  - `Length` does not take `clamp()` / `calc()`, so this lives in the site's `css.create`, not in a prop.
- **Record.** The theming contract becomes Duro ADR-0003 (`theming.overrides`), rewritten for every group. It states:
  - the themable groups and the refused ones;
  - the guard rails and the value kinds;
  - the inheritance rule;
  - the native first-family rule, and that native is unverified on a device until a simulator check;
  - that the theme file is an ADR-0027 exemption. The person added that exemption to the decisions corpus (`docs/principles/measures.md`, decisions#112).

## Phases

### Phase 1: hero size tokens (`packages/tokens`)

- **Add the three sizes** to `src/tokens/sizes.css.ts`, to `src/keys.ts` (`SIZE_KEYS`, `SIZES_PX`) and to `src/raw.ts` (`SIZES_PX`), in the same order. `scripts/check-token-drift.mjs` (prebuild) enforces the order.
- **Lint mapping:** add the new values to the px → token mapping in `packages/eslint-plugin/src/util/tokens.ts`, covered by `test/token-drift.test.ts`. 360 joins `panelSm`, 240 joins its existing entries, 720 is new.
- **Regenerate** with `pnpm duro:registry` and `pnpm duro:docs`. Their checks are `build-registry.mjs --check` and `--check-docs` (the CLAUDE.md tokens region).

### Phase 2: `ThemeProvider` fonts and radii (`packages/ui`)

- **Spike first:** in `examples/native/src/ThemeDemo.tsx`, check whether `createTheme(typography|radii, …)` changes a rendered Text font and a Card radius, including inside a nested provider on another theme.
- **Keys:** `packages/tokens/src/keys.ts` gets `FONT_FAMILY_KEYS` and `FontFamilyToken`. `RadiusToken` already exists.
- **Overrides model:** in `overrides.ts`, `EffectiveOverrides` gains `fonts` and `radii`, and `mergeOverrides` keeps the per-theme rule for colours only: fonts and radii always inherit from the outer provider. Both platforms validate each provider's own font/radius keys and values before merging, using shared pure validators; only supported keys and valid values enter context or native `createTheme`. Invalid child entries leave valid inherited entries intact. Test an invalid child override, a grandchild inheriting through it, and runtime attempts to override `px6`/`full` on both platforms.
- **Scoped rule:** `overrideRule.ts` generalises from colours to three groups, each with a `variableOf` and a validator. Add `isSafeFontFamily` and `isSafeLength` next to `isSafeColor`. The scope selector and the doubled specificity stay as they are.
- **Web:** `ThemeProvider.tsx` gets the `fonts` and `radii` props (destructured as `radii: radiusOverrides`, so the `radii` token import is not hidden), and `variableOf` per group over `typography` and `radii`, using the same `var(--x)` parse.
- **Native:** `ThemeProvider.native.tsx` gets the props, the `createTheme` calls (first family on native, quotes stripped), and one memo key per group; `resolved` (useResolvedColors) is still built from the colours key alone, with a test that it gains no `fonts`/`radii` keys.
- **Docs and stories:** update the meta description in `ThemeProvider.meta.ts` and the CLAUDE.md component docs. `ThemeOverrides.stories.tsx` gets a fonts and radii story with a play assertion on the computed font-family and border-radius; it also renders Button, Badge, Tabs, a Select trigger and a `timeReadoutW` readout in the mono stack and asserts none overflows (scrollWidth ≤ clientWidth).
- **Tests:** `packages/ui/test/override-rule.test.ts` covers the new validators: injection refused, `url(` refused, an unbalanced quote (`'Jet`, `a, 'b`) refused, `/*` refused, negative and unitless radii refused, and the fonts and radii rule is the same on the server (hydration).

### Phase 3: `mockup seed --overrides` takes fonts and radii (`packages/cli`)

- **`readOverrides`** in `src/commands/mockup.ts` accepts `{colors, fonts, radii}` and the legacy flat colours. A file with any of `colors`/`fonts`/`radii` is the grouped shape; one mixing those with flat colour keys is a usage error. One shared table of valid and invalid values runs against both the UI and CLI validators. Any other top-level key in a grouped file is refused with `unknown group "<key>" (expected colors | fonts | radii)`; the object-shape error names both shapes.
- **Validators** mirror the UI ones, proven by one shared fixture of valid and invalid values that both the UI and CLI test suites run against their validators. Errors name the key, the rule and the refused part: `radii.xl: unknown radius (xs | sm | md | lg)`, `fonts.fontFamily: ";" is not allowed in a font-family list`, `radii.md: "-1px" must be 0 or a non-negative px/rem length`.
- **Write:** the seed writes `<path>.tmp` and renames it, so an interrupted run leaves no partial artboard that blocks the next seed.
- **Variables:** emit `--duro-typography-font-family(-mono)` and `--duro-radius-<key>`, named like `packages/tokens/scripts/lib/mockup-css.mjs`. A parity test asserts each emitted variable exists in `registry.tokens.mockupCss`, as the colour test does.
- **Output:** the success line names what was applied (`with 3 colour, 2 font, 5 radius overrides from theme.json`), and the CSS comment reads "Theme overrides".
- **Docs:** update the README, the manifest text and the tests in `packages/cli/test/mockup.test.ts`.

### Phase 3b: every token group (the person's change, after Phases 1–3 were committed)

- **Shared module `packages/tokens/src/theme.ts`**, built and exported as `@duro-app/tokens/theme`. It is pure and has no React, web or native imports. It holds:
  - the table of themable groups: per group, its keys, its value kind per key, its floors and its refused keys. `keys.ts` has no list for typography (only `FONT_FAMILY_KEYS`), typeScale, layoutSpacing, duration or easing: add `TYPOGRAPHY_KEYS`, `TYPE_SCALE_KEYS`, `LAYOUT_SPACING_KEYS`, `DURATION_KEYS` and `EASING_KEYS`, and `check-token-drift.mjs` checks each list against its `defineVars` keys;
  - the group aliases (`colors` → `color`, …) and `kebab`, which `mockup-css.mjs`, `generate-vars-css.mjs` and the CLI all import instead of keeping copies;
  - the value-kind validators;
  - `validateTokens(own)`, which returns `{kept, dropped}`; each dropped entry carries `{group, key, value, reason}`, the reason being the single wording used by both the warning and the CLI error.
- **One fixture:** `packages/tokens/test/fixtures/theme-tokens.json` holds valid and invalid values per kind. It runs against `validateTokens`, and the CLI test runs it through `mockup seed`.
- **`packages/ui` ThemeProvider:**
  - The `fonts`/`radii` props and `validate.ts` are replaced by `tokens` and the shared module.
  - `mergeOverrides` stays pure: validation returns the dropped entries, and each provider warns from an effect, deduplicated.
  - `overrideRule.ts` emits one scoped rule over every themed group's `var(--x)` exports.
  - Native builds one `createTheme` input per group in a pure helper (fonts: first family, unquoted), with tests that `resolved` colours come from the palette plus colour overrides only.
  - Types: `ThemeTokens` is exported from both barrels. `FontOverrides`/`RadiusOverrides` go away (never released).
- **`packages/cli` mockup seed:**
  - It reads the `tokens` shape (or flat colours), validates through `@duro-app/tokens/theme` (a new runtime dependency) and drops its copied validators. `packages/tokens/vite.config.ts` gains the `theme` entry and `package.json` a `./theme` export (`source`/`react-native` → src, `import`/`types`/`default` → dist); `react-strict-dom` becomes optional in `peerDependenciesMeta`, so the CLI does not install it, and `theme.ts` imports nothing from it. Check: `npm ls` after installing the packed CLI into an empty directory lists no `react-strict-dom`.
  - It emits `--duro-<alias>-<key>` with the aliases and `kebab` from `@duro-app/tokens/theme` (`mockup-css.mjs` is a build script and is not shipped); the parity test asserts every emitted variable of every group exists in `registry.tokens.mockupCss`.
  - `readGroup` takes no flag argument.
  - Errors read `<group>.<key>: <reason>`, colours included.
  - The success line lists only the non-empty groups.
  - A `--json` result stays on stdout even with exit 2.
- **Carried from the implementation and interface reviews:**
  - **Docs:** the JSDoc and the meta say native takes the first family (a face the app loads), that the app loads weights 400/500/600/700, that radii should stay ordered `xs ≤ sm ≤ md ≤ lg`, and that native is unverified on a device.
  - **README:** the mono example starts with a loaded face.
  - **Hero comment:** it names `minHeight: clamp(...)`.
  - **The story** themes a size, a spacing and a radius, plus fonts with a distinct mono family. It asserts the computed values, that a nested other-theme provider keeps them, and that an unsafe value or a value under a floor leaves the default. It checks that Button, Badge, Tabs, a Select trigger and a `timeReadoutW` readout do not overflow.
- **Registry and docs** are regenerated at the end (`pnpm duro:registry`, `pnpm duro:docs`).

### Phase 4: record, changesets, release

- Write a Duro ADR, `theming.overrides`. Changesets: minor for `@duro-app/tokens`, `@duro-app/ui` and `@duro-app/cli`.
- Ship one PR, merge on green, then tag v5.37.0. The audit gate passes today under the waivers.

### Phase 5: greenharness-site (local, not a repo yet)

- The `drive.html` keyboard and motion fixes depend on no Duro change and may land before Phase 1.
- **Theme file:** `theme.json` becomes the `tokens` shape:
  - `colors`: today's Matrix palette;
  - `typography`: `fontFamily` and `fontFamilyMono` set to `"'JetBrains Mono', ui-monospace, Menlo, monospace"`; the site loads weights 400, 500, 600 and 700, the ones the presets use;
  - `radii`: the near-square set, as strings with units (the validator refuses bare numbers): `"xs": "2px"`, `"sm": "4px"`, `"md": "6px"`, `"lg": "8px"`.
- **Mockup A:** re-seed it with v5.37.0, keep its authored layout, and size the stage with the hero tokens; add artboards for the focused, started game and the short-viewport poster.
- **`drive.html` hero** (the prototype the real site will port):
  - height `clamp(var(--duro-size-hero-min-h), calc(100svh - var(--duro-size-hero-reserve)), var(--duro-size-hero-max-h))`, the published vars, so the port carries no raw px;
  - arrows, J/L and Space are captured only while the canvas has focus, and only after the start;
  - a click, a tap, Space or Enter on the focused canvas starts the game;
  - the ready box and the canvas `aria-label` follow focus: unfocused, "[ CLICK / TAB HERE ] to drive"; focused, "[ SPACE / ENTER ] start at the red light" (today `drive.html:676` promises Space page-wide);
  - the focused canvas shows a focus ring (`borders.focusRing`, `borders.focusOffset`, `colors.accent`) and a one-line hint, "Enter to play, Esc to leave";
  - Escape moves focus from the canvas to the install command (WCAG 2.4.3); any blur during the countdown or the race pauses the game (`S.time` frozen) behind a "PAUSED · click or Enter to resume" box, and refocusing replays the light count;
  - a "Skip to install" link sits before the canvas;
  - the focusable canvas has an accessible name that states the start keys;
  - the code rain at rest stops by itself within 5 s for every user (WCAG 2.2.2), and is static under reduced motion until the player starts;
  - below `heroMinH + heroReserve` (632px after the measurement) of viewport height, a "tap to play" poster replaces the game (the hero would otherwise push the headline out of view); the switch is a JS `matchMedia` built from the computed vars, and `drive.html` links `@duro-app/ui`'s `dist/vars.css`; a tap on the poster opens the game at full viewport height, scrolled into view, and Escape or a close control returns to the poster;
  - no traffic light at rest;
  - the game-over box adds a line under "drive again": "↓ install the harness", which jumps to the command like the skip link.

## Non-goals

- A generic `Hero` component, or `clamp()` / `calc()` in `Length`.
- Theming `layers`, `breakpoints`, `microSpacing`, `radii.px6` or `radii.full` (see Decisions).
- Loading fonts from ThemeProvider.
- Building the real site on Duro: that is the next plan, after a direction is picked.
- Tool renames.

## Verification

| #   | Check                                                                                                                                                                                                                              | Expected                                                                                                                                                                                                                                                                              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `pnpm run typecheck`; `vitest --project=unit`; `check-token-drift.mjs` with heroMaxH moved out of order; `build-registry.mjs --check`                                                                                              | 0 errors; the new validator cases pass; the drift check fails on the reorder, then passes restored; the registry lists heroMinH/heroReserve/heroMaxH                                                                                                                                  |
| 2   | Storybook play test of `tokens` (CI "Storybook Tests")                                                                                                                                                                             | computed `font-family` (quotes normalised), `border-radius`, a themed size and a themed spacing equal the overrides; a nested other-theme provider keeps them; an unsafe value or one under a floor (`touchTarget: 40px`) leaves the default; no overflow in the mono stack           |
| 3   | Native spike in `examples/native` (simulator)                                                                                                                                                                                      | font and radius change on screen, or the documented fallback and warning                                                                                                                                                                                                              |
| 4   | CLI on the built bin: seed with a `tokens` file (colours, typography, radii, sizes, spacing, shadows, duration); legacy flat file; bad font (`a;b`), bad radius (`-1px`), `sizes.touchTarget: 40px`, `layers.modal`, unknown group | block written; legacy accepted; usage errors naming the key and the refused part (asserted text) on stderr with stdout empty, exit 2 (`emit` in `bin.ts` routes exitCode 2 text to stderr)                                                                                            |
| 5   | Published v5.37.0 (`npm view`, `npx --prefer-online … --help`)                                                                                                                                                                     | the new flags and docs are present                                                                                                                                                                                                                                                    |
| 6   | Mockup A re-seeded, `mockup check`, canvas next to `drive.html` in Chrome                                                                                                                                                          | the same font and corners; remaining differences listed                                                                                                                                                                                                                               |
| 7   | `drive.html` in Chrome at 1440×900, 1280×600, 1024×500, 390×844, 844×390                                                                                                                                                           | hero height = clamp(360, innerHeight−240, 720) measured; headline and install command bottom ≤ innerHeight; 1024×500 and 844×390 show the poster. svh stability is cited (web.dev), not emulated                                                                                      |
| 8   | Keyboard on `drive.html`                                                                                                                                                                                                           | arrow keys scroll the page until the canvas is focused and started; Tab leaves the canvas; Escape moves focus to the install command and pauses a race with the timer frozen; "Skip to install" focuses the command; the canvas announces its name; the rain at rest stops within 5 s |
| 9   | After v5.37.0: the colour-overrides story and `examples/native` ThemeDemo, computed colours vs 5.36.0                                                                                                                              | identical; any difference ships 5.37.1 reverting the `ui` change                                                                                                                                                                                                                      |

## Decision log

- 2026-10-29 — Measured on `drive.html` (Chrome, before Phase 1):
  - **heroMinH 360 kept:** the ready and game-over boxes start clipping at the top below 340px (rows = floor(h / 17), box top = floor(rows × 0.36) − 7).
  - **heroReserve raised from 240 to 272:** at 1280×600, the headline plus the install command need 267px under the canvas (272 on the 8px grid).
  - **Poster threshold:** it becomes heroMinH + heroReserve = 632px.
  - **Phone layout bug:** the phone page lays out 698px wide instead of 390 (a horizontal overflow, fixed in Phase 5). Even there, the stacked headline + text + command need 365px+.
- 2026-10-29 — The person chose **game wins on phones**. One reserve token everywhere; on phones the first screen shows the game and the headline, and the install command is one swipe away.

## Verification record (before the push)

Observed on the tree after Phase 3b and the review fixes (2026-10-29):

| #    | Input                                                                                                                                                                                               | Expected                                                                                | Actual                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | typecheck; drift check (normal and with `heroMaxH` reordered); registry `--check`/`--check-docs`; the new unit suites                                                                               | 0 errors; the new validator cases pass; the drift check fails on a reorder, then passes | typecheck 0; reordered → drift rc 1 ("SIZES_PX in keys.ts differs from its css.ts literal"), restored → rc 0; registry and docs 0; `tokens/test/theme.test.ts` 90/90 (fixture valid and invalid per kind, every shipped default kept), `ui/test/theme-tokens.test.ts` 13/13, `ui/test/override-rule.test.ts` 4/4, `cli/test/mockup.test.ts` 120/120; full unit project 42 files, 807/807 (it caught the missing deep paths, fixed in `a722a4de`) |
| 2    | Storybook project, `ThemeOverrides.stories.tsx` (run locally)                                                                                                                                       | the Tokens play test passes                                                             | 3/3 stories passed. The first run caught a story bug, now fixed: the surface did not read `typography.fontFamily`, the corner check probed `radii.sm`, which the story makes invalid, and the readout probe inherited 16px                                                                                                                                                                                                                       |
| 4    | built bin: a tokens file (colours, typography, radii, sizes, spacing, shadows, duration); legacy flat file; `a;b`, `-1px`, `sizes.touchTarget: 40px`, `layers.modal`, unknown group `foo`; `--json` | applied; accepted; exit 2 on stderr; JSON on stdout                                     | "with overrides from t.json: colors 1, shadows 1, typography 2, spacing 1, radii 4, sizes 1, duration 1."; legacy rc 0; the five refusals rc 2, stdout 0 B, each `<group>.<key>: <reason>` on stderr (e.g. "sizes.touchTarget: 40px is under the 44px floor"); `--json` rc 2 with `{"kind":"usage-error","problems":[…]}` on stdout                                                                                                              |
| pack | `pnpm pack` tokens + cli, `npm install` both into an empty dir, `npm ls react-strict-dom` / `react`                                                                                                 | none installed                                                                          | "added 2 packages"; both `(empty)`; the installed bin's `--help` lists `--overrides`                                                                                                                                                                                                                                                                                                                                                             |
| 3    | native spike on a simulator                                                                                                                                                                         | each group changes on screen                                                            | **not run**: machine load average 60–280. Covered by react-strict-dom's generic native `createTheme` (`dist/native/index.js:1315`) and the pure-helper tests (`nativeThemeInputs`, `resolvedColors`). ADR-0003 and the docs say native is unverified on a device. Open gap.                                                                                                                                                                      |
| 5–9  | release, mockup, site, post-release                                                                                                                                                                 | —                                                                                       | after the release (Phase 5)                                                                                                                                                                                                                                                                                                                                                                                                                      |

Phase status:

- [x] Phase 1: hero size tokens (fefe71e4).
- [x] Phase 2: ThemeProvider fonts and radii (5da1e234), superseded by 3b.
- [x] Phase 3: mockup overrides take fonts and radii (6aa02d6e), superseded by 3b.
- [x] Phase 3b: every token group through `tokens` (76b416cd; review fixes 354ac311).
- [ ] Phase 4: ADR-0003 rewritten and the changeset are done; the release follows the merge.
- [ ] Phase 5: the site's keyboard, motion and overflow fixes are done locally in drive.html; the sizing, the poster and the mockup follow the release.

## Implementation review

- **approve-with-changes** (round 1 on tree `d72315f0`, after the person chose "Fix" on the previous rework). Two record findings fixed: the drift check's negative case and the per-suite counts are now in row 1.
- Earlier rounds: round 1 on the fonts/radii tree was approve-with-changes, with its 3 blocking findings resolved in Phase 3b. The Delta was rework, and the person chose Fix: the record was re-run, the banners removed, `resolvedColors` extracted and the story completed.
- **deliberate:** the native simulator spike stays an open gap. ADR-0003 and the docs say native is unverified on a device.
- **Noted for later:** `overrideRule` validates again after the provider has; this is kept as CSS-injection defence in depth, like the colour rule before this branch. `--json` errors also reach stderr.
- **Delta** on tree `a722a4de` (the deep-path fix the pre-push run found): **approve**, no findings.
- Tokens ~125k + ~131k, about 70 s + 23 s.
