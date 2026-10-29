---
id: ADR-0003
status: accepted
decisions:
  - key: theming.overrides
    choice: A ThemeProvider replaces three token groups and nothing else — colours (`overrides`), font families (`fonts`, the keys fontFamily and fontFamilyMono) and radii (`radii`, the keys xs, sm, md and lg; px6 and full stay fixed). Each provider's own font and radius values are validated before merging, in one pure module both platforms use (a font-family grammar of identifiers or balanced quoted names; `0` or a non-negative px/rem length), and an invalid value is dropped with one development warning. Fonts and radii inherit across a nested provider whatever its theme; colours reset on a theme change. Native takes the first family of a list, unquoted. Spacing, sizes, shadows and type sizes are not themable. `duro mockup seed --overrides` reads the same file, `{colors?, fonts?, radii?}`
    first: true
    reason: A brand (greenharness.dev, set in JetBrains Mono with near-square corners) could not be expressed through colour overrides alone, and the contract lived only in a plan (N0, Decision 4)
---

# 0003 — theme overrides: colours, fonts and radii

Plan: [`docs/plans/2026-10-29-fonts-radii-themes-hero.md`](../plans/2026-10-29-fonts-radii-themes-hero.md)

## Context

`ThemeProvider` took colour overrides only (plan N0, Decision 4, the only
record of the contract). greenharness.dev, the first site to run on Duro as
the optional `design` part of Green Harness (fleet ADR-0048), is set in
JetBrains Mono with near-square corners. Neither could be expressed: the font
families and the radii are `defineVars` like the colours, but the override
rule dropped anything that was not a colour.

## Decision

- **Three groups.** `overrides` (colours), `fonts` (`fontFamily`,
  `fontFamilyMono`) and `radii` (`xs`, `sm`, `md`, `lg`). `px6` is named after
  its value and `full` is a shape, so neither can be overridden. Nothing else
  is themable: spacing, sizes, shadows and type sizes stay the design system's.
- **Validated per provider, before merging.** One pure module
  (`ThemeProvider/validate.ts`) holds the rules for both platforms: a
  font-family list is identifiers or balanced quoted names, with no `;{}<>\`,
  comments, `url(`, `var(` or `expression(`; a radius is `0` or a
  non-negative `px`/`rem` length. An invalid value is dropped, with one warning
  per distinct value in development, and leaves the inherited one in place.
- **Inheritance.** Fonts and radii do not depend on a theme, so a nested
  provider inherits them even on another theme; colours keep their reset.
- **Native.** React Native takes one family name: the first of the list,
  unquoted. The app loads the font itself; ThemeProvider never loads fonts.
- **One file for mockups and apps.** `duro mockup seed --overrides` reads
  `{colors?, fonts?, radii?}` (or the flat colour object of 5.36), validates
  fonts and radii with the same rules, and writes them into the artboard's
  token block. An app spreads the same file into the provider's props.

## Relation to other records

- **ADR-0027** (`ui.measures`, fleet): every measure is a published token.
  The theme file is a named exemption: it is where token values are defined
  for one product, not consumer styles. Its radii must still be lengths the
  validator accepts.

## Consequences

- Colour values keep today's paths: filtered by the web rule generator, passed
  unchecked to native `createTheme`. A follow-up validates them per provider
  too, once a release can show native colour output unchanged.
- A consumer that sets `fonts` loads the faces itself (Google Fonts, `@font-face`,
  expo-font) at the weights the presets use (400, 500, 600, 700).

## Log

- 2026-10-29 — accepted with the plan the person approved after the review
  panel and Codex.

## Revisit when

- A product needs another group themed (shadows, spacing).
- Native colour validation lands and the colour path joins the others.
