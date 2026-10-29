---
status: active
branch: feat/theme-fonts-radii
repos: [duro-design-system]
adrs: [ADR-0027, ADR-0048]
---

# Fonts and radii in Duro themes, hero size tokens

## Review panel

👉 **Decide:** none — approve if a 5.37 minor that adds `fonts`/`radii` to ThemeProvider plus three hero size tokens is the right scope.
📍 duro-design-system + greenharness-site (local) · plan reviewed, nothing built · next: measure heroMinH/heroReserve on drive.html. Panel: architect, backend, game-ux, typescript, po, react, tui, ui-design, unix, ux-research (opus-5-5), codex.
**Changed by review:** fonts/radii inherit across themes and are validated per provider before merging, on both platforms; poster below 600px (heroMinH + heroReserve) so the headline always shows; game keys only on focus, Escape → install, pause on blur, rain stops in 5 s.
**Verdicts:** 10 approve-with-changes in round 1; backend approve-with-changes in rounds 2 and 3; codex approve-with-changes (1 high applied). 12 findings carried into implementation.
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

- **API shape, additive.** `overrides` keeps meaning colours (no break). `ThemeProvider` gains two props:
  - `fonts?: FontOverrides`, the keys `fontFamily` and `fontFamilyMono`;
  - `radii?: RadiusOverrides`, keyed by `RadiusToken` except `px6` (its name is its value) and `full`.

  They merge across nested providers like colours, with one difference: fonts and radii do not depend on the theme. A nested provider inherits them even when its theme differs (`mergeOverrides` in `overrides.ts`), so web (inheritance through the cascade) and native (explicit `createTheme`) agree.

- **Theme file shape.** The file `mockup seed --overrides` reads becomes `{colors?, fonts?, radii?}`. A flat object of colour keys (the v5.36 shape) is still accepted. An app spreads the same file: `<ThemeProvider overrides={t.colors} fonts={t.fonts} radii={t.radii}>`.
- **Validation, one rule per group, mirrored in the CLI:**
  - **colours:** `isSafeColor` (unchanged);
  - **font families:** a grammar, not a blacklist: a comma-separated list where each item is a run of identifiers (`[A-Za-z_-][\w -]*`) or one balanced single- or double-quoted string with no quote or backslash inside; nothing in the value may contain `;{}<>\`, `/*`, `*/`, `url(`, `var(` or `expression(` (an unbalanced quote or comment would swallow the rule's closing brace);
  - **radii:** `0`, or a non-negative number with `px` or `rem`.
  - An invalid value is dropped in the app and is a usage error in the CLI, as colours are today. In dev mode the app logs one warning per dropped value, naming the group, key, value and rule (e.g. `radii.md: 6 needs px or rem`).
- **Native.** Colour overrides already apply through `css.createTheme(colors, …)` (`ThemeProvider.native.tsx:100-112`). Fonts and radii append `css.createTheme(typography, …)` / `css.createTheme(radii, …)` to the same `themeStyles`, which `ThemeScopeContext` / `PortalHost` already carry.
  - React Native takes one family name, so native uses the first family of the list, with its quotes stripped (`'JetBrains Mono'` → `JetBrains Mono`).
  - The app loads the font itself (expo-font); ThemeProvider never loads fonts, on web or native.
  - **Open risk:** whether react-strict-dom's native `createTheme` overrides the `typography` and `radii` vars at runtime is unverified. Phase 2 starts with a spike in `examples/native`. If it does not work, native ignores `fonts` / `radii` and logs one dev-mode warning. The plan records that; it is not worked around.
- **Hero tokens.** `heroMinH` 360px (the smallest height where the game is playable, to be confirmed before Phase 1 by rendering the ready box, the game-over box and the HUD in `drive.html` at decreasing heights and recording the first height that clips; today's canvas minimum is 440px), `heroReserve` 240px (room for the site header, the top padding, the headline and the install command; measured on `drive.html` at 1280×600 and 390×844 before Phase 1 fixes it, raised if the command does not fit), `heroMaxH` 720px.
  - The site sizes its hero as `clamp(heroMinH, calc(100svh - heroReserve), heroMaxH)`. A `calc()` of tokens is allowed under `ui.measures` (ADR-0027).
  - `Length` does not take `clamp()` / `calc()`, so this lives in the site's `css.create`, not in a prop.
- **Record.** The theming contract becomes a Duro ADR. Today it lives only in plan N0, Decision 4. The ADR states what overrides may replace (colours, font families, radii), the validation, the native first-family rule, and that spacing, sizes and shadows are not themable. It names the theme file (colour, font and radius values) as an ADR-0027 exemption: the place where token values are defined, not consumer styles.

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

### Phase 4: record, changesets, release

- Write a Duro ADR, `theming.overrides`. Changesets: minor for `@duro-app/tokens`, `@duro-app/ui` and `@duro-app/cli`.
- Ship one PR, merge on green, then tag v5.37.0. The audit gate passes today under the waivers.

### Phase 5: greenharness-site (local, not a repo yet)

- The `drive.html` keyboard and motion fixes depend on no Duro change and may land before Phase 1.
- **Theme file:** `theme.json` gains:
  - `fonts`: `"'JetBrains Mono', ui-monospace, Menlo, monospace"` for both families; the site loads weights 400, 500, 600 and 700, the ones the presets use;
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
  - below `heroMinH + heroReserve` (600px) of viewport height, a "tap to play" poster replaces the game (the hero would otherwise push the headline out of view: clamp floors at 360, and 360 + 240 = 600); a tap on the poster opens the game at full viewport height, scrolled into view, and Escape or a close control returns to the poster;
  - no traffic light at rest;
  - the game-over box adds a line under "drive again": "↓ install the harness", which jumps to the command like the skip link.

## Non-goals

- A generic `Hero` component, or `clamp()` / `calc()` in `Length`.
- Theming spacing, sizes, shadows or type sizes.
- Loading fonts from ThemeProvider.
- Building the real site on Duro: that is the next plan, after a direction is picked.
- Tool renames.

## Verification

| #   | Check                                                                                                                                 | Expected                                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `pnpm run typecheck`; `vitest --project=unit`; `check-token-drift.mjs` with heroMaxH moved out of order; `build-registry.mjs --check` | 0 errors; the new validator cases pass; the drift check fails on the reorder, then passes restored; the registry lists heroMinH/heroReserve/heroMaxH                                                                                                                                  |
| 2   | Storybook play test of fonts and radii overrides                                                                                      | computed `font-family` starts with the override after normalising quotes to double quotes (CSSOM serialisation); `border-radius` equals the override; an unsafe value leaves the default                                                                                              |
| 3   | Native spike in `examples/native` (simulator)                                                                                         | font and radius change on screen, or the documented fallback and warning                                                                                                                                                                                                              |
| 4   | CLI on the built bin: seed with `{colors, fonts, radii}`; legacy flat file; bad font (`a;b`), bad radius (`-1px`)                     | block written; legacy accepted; usage errors naming the key and the refused part (asserted text) on stderr with stdout empty, exit 2 (`emit` in `bin.ts` routes exitCode 2 text to stderr)                                                                                            |
| 5   | Published v5.37.0 (`npm view`, `npx --prefer-online … --help`)                                                                        | the new flags and docs are present                                                                                                                                                                                                                                                    |
| 6   | Mockup A re-seeded, `mockup check`, canvas next to `drive.html` in Chrome                                                             | the same font and corners; remaining differences listed                                                                                                                                                                                                                               |
| 7   | `drive.html` in Chrome at 1440×900, 1280×600, 1024×500, 390×844, 844×390                                                              | hero height = clamp(360, innerHeight−240, 720) measured; headline and install command bottom ≤ innerHeight; 1024×500 and 844×390 show the poster. svh stability is cited (web.dev), not emulated                                                                                      |
| 8   | Keyboard on `drive.html`                                                                                                              | arrow keys scroll the page until the canvas is focused and started; Tab leaves the canvas; Escape moves focus to the install command and pauses a race with the timer frozen; "Skip to install" focuses the command; the canvas announces its name; the rain at rest stops within 5 s |
| 9   | After v5.37.0: the colour-overrides story and `examples/native` ThemeDemo, computed colours vs 5.36.0                                 | identical; any difference ships 5.37.1 reverting the `ui` change                                                                                                                                                                                                                      |

<!-- panel: repos=duro-design-system reviewers=architect,backend,game-ux,lang:typescript,po,react,tui,ui-design,unix,ux-research,codex body-sha=c59b91df113d -->

## Decision log

- 2026-10-29 — Measured on `drive.html` (Chrome, before Phase 1):
  - **heroMinH 360 kept:** the ready and game-over boxes start clipping at the top below 340px (rows = floor(h / 17), box top = floor(rows × 0.36) − 7).
  - **heroReserve raised from 240 to 272:** at 1280×600, the headline plus the install command need 267px under the canvas (272 on the 8px grid).
  - **Poster threshold:** it becomes heroMinH + heroReserve = 632px.
  - **Phone layout bug:** the phone page lays out 698px wide instead of 390 (a horizontal overflow, fixed in Phase 5). Even there, the stacked headline + text + command need 365px+.
- 2026-10-29 — The person chose **game wins on phones**. One reserve token everywhere; on phones the first screen shows the game and the headline, and the install command is one swipe away.

## Verification record (before the push)

| #   | Input                                                                                                               | Expected                                                      | Actual                                                                                                                                                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | typecheck; ThemeProvider and CLI unit files; drift check with heroMaxH reordered; registry `--check`/`--check-docs` | 0 errors; pass; fails, then passes; registry lists the tokens | typecheck 0; ui override tests 14/14, CLI mockup + cli 106/106, the three tests relais saw fail under load 99/99; drift rc 1 reordered, rc 0 restored; registry and docs checks rc 0                                                                                                                               |
| 4   | built bin: grouped file; legacy flat file; `a;b`, `-1px`, `px6`, unknown group `font`, mixed file, `'Jet`           | applied with counts; accepted; exit 2 on stderr, stdout empty | "with 2 colour, 2 font, 4 radius overrides"; legacy rc 0; all six rc 2, stdout 0 bytes, message on stderr naming the key                                                                                                                                                                                           |
| 3   | native spike in `examples/native` on a simulator                                                                    | font and radius change on screen                              | **not run**: machine load average 60–280 made an Expo build impractical. Covered instead by react-strict-dom's native `createTheme` source (`dist/native/index.js:1315`, generic over any `defineVars` group) and the unit tests of `nativeThemeInputs` (first family unquoted, colour input unchanged). Open gap. |
| 2   | Storybook play test                                                                                                 | as planned                                                    | runs in CI (Storybook Tests) on the PR                                                                                                                                                                                                                                                                             |
| 5–9 | release, mockup, site, post-release                                                                                 | —                                                             | after the release (Phase 5)                                                                                                                                                                                                                                                                                        |

Phase status:

- [x] Phase 1: hero size tokens (fefe71e4).
- [x] Phase 2: ThemeProvider fonts and radii (5da1e234).
- [x] Phase 3: mockup overrides take fonts and radii (6aa02d6e).
- [ ] Phase 4: ADR-0003 and the changeset are done (45c76bce); the release follows the merge.
- [ ] Phase 5: the site's keyboard, motion and overflow fixes are done locally in drive.html; the sizing, the poster and the mockup follow the release.
