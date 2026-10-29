---
id: ADR-0003
status: accepted
decisions:
  - key: theming.overrides
    choice: A ThemeProvider replaces token values by group and key through one `tokens` prop over twelve groups — colors, shadows, typography, typeScale, spacing, layoutSpacing, radii, sizes, borders, duration, easing and effects — with `overrides` kept as the colour alias (`tokens.colors` wins on a clash). `layers`, `breakpoints`, `microSpacing`, `radii.px6` and `radii.full` are refused; `sizes.touchTarget` stays at 44px or more, `borders.focusRing` at 2px or more and `borders.focusOffset`/`focusOffsetSm` at 0 or more. Each provider's own values are validated before merging, one rule per kind of value, in the pure module `@duro-app/tokens/theme` that both platforms and the CLI import, and an invalid value is dropped with one development warning. `colors` and `shadows` reset when a nested provider changes theme; every other group inherits. Native takes the first font family of a list, unquoted, and is unverified on a device. `duro mockup seed --overrides` reads the same file, the `tokens` shape (or a flat map of colours)
    first: true
    reason: A brand (greenharness.dev, set in JetBrains Mono with near-square corners) could not be expressed through colour overrides alone, and the person asked for every token group to be themable rather than three; the contract lived only in a plan (N0, Decision 4)
---

# 0003 — theme overrides: every token group

Plan: [`docs/plans/2026-10-29-fonts-radii-themes-hero.md`](../plans/2026-10-29-fonts-radii-themes-hero.md)

## Context

`ThemeProvider` took colour overrides only (plan N0, Decision 4, the only
record of the contract). greenharness.dev, the first site to run on Duro as
the optional `design` part of Green Harness (fleet ADR-0048), is set in
JetBrains Mono with near-square corners. Neither could be expressed: the font
families and the radii are `defineVars` like the colours, but the override
rule dropped anything that was not a colour. Asked how other components with
sizes would be themed, the person chose to generalise in 5.37 instead of
shipping three groups first.

## Decision

- **One `tokens` prop.** An object keyed by token group, each a partial record
  of that group's keys: `colors`, `shadows`, `typography`, `typeScale`,
  `spacing`, `layoutSpacing`, `radii`, `sizes`, `borders`, `duration`, `easing`
  and `effects`. `overrides` stays as the colour alias for 5.x (`tokens.colors`
  wins on a clash). The `fonts` and `radii` props of the unreleased first cut
  are gone.
- **Refused, with a warning naming why.** `layers` order one stacking context;
  `breakpoints` are read by media queries and JS; `microSpacing` and
  `radii.px6` are named after their value; `radii.full` is a shape, not a size.
- **Guard rails.** `sizes.touchTarget` is at least 44px, `borders.focusRing`
  at least 2px, `borders.focusOffset` and `focusOffsetSm` at least 0 (rem is
  converted at 16px). A value under its floor is refused like an invalid one.
- **One rule per kind of value, in one module.** `@duro-app/tokens/theme`
  (built to `dist/theme.js`, pure, no React or native imports) holds the group
  table, the refused keys, the floors, the validators and `validateTokens`,
  which returns `{kept, dropped}` with one reason wording for the warning and
  the CLI error. The kinds: colour; font-family list (identifiers or balanced
  quoted names, with no `;{}<>\`, comments, `url(`, `var(` or `expression(`);
  non-negative `px`/`rem` length; fluid length (`clamp(` of three items);
  letter spacing; font weight 100 to 900; unitless line height 1 to 3; shadow
  list; duration; easing; `blur(<length>)`. Every shipped default passes its
  own rule, asserted by a test.
- **Validated per provider, before merging.** An invalid value is dropped and
  leaves the inherited one in place. The warning, once per distinct value in
  development, comes from an effect, not from render.
- **Inheritance.** `colors` and `shadows` reset when a nested provider changes
  theme, because every theme defines them. Every other group always inherits
  and the child's valid entries lay over it, so the CSS cascade on the web and
  `createTheme` on native agree.
- **Native.** One `css.createTheme(<group>, …)` per group with entries.
  React Native takes one family name: the first of the list, unquoted. The
  app loads the font itself (weights 400, 500, 600 and 700); ThemeProvider
  never loads fonts. `useResolvedColors` is the palette plus the colour
  overrides only. Radii should stay ordered `xs <= sm <= md <= lg`. Native is
  unverified on a device until a simulator check.
- **One file for mockups and apps.** `duro mockup seed --overrides` reads the
  same object as `tokens` (or the flat colour object of 5.36), validates it
  with `@duro-app/tokens/theme`, and writes `--duro-<alias>-<key>` rules into
  the artboard's token block. An app passes the file as is:
  `<ThemeProvider tokens={theme}>`. `@duro-app/cli` gains `@duro-app/tokens`
  as a runtime dependency for this; `react-strict-dom` is an optional peer of
  the tokens package, so the CLI does not install it.

## Relation to other records

- **ADR-0027** (`ui.measures`, fleet): every measure is a published token.
  The theme file is a named exemption: it is where token values are defined
  for one product, not consumer styles (the measures principle of the fleet decisions corpus, decisions#112). Its values must still be ones the validators accept.

## Consequences

- A consumer that sets `typography` loads the faces itself (Google Fonts,
  `@font-face`, expo-font) at the weights the presets use.
- The first cut's `FontOverrides` and `RadiusOverrides` were never released
  and are removed; `ThemeTokens` is exported from both barrels.
- Colour values on native were passed unchecked before; they now go through
  `validateTokens` like every group, and the `isSafeColor` rule is unchanged.

## Log

- 2026-10-29 — accepted with the plan the person approved after the review
  panel and Codex (fonts and radii).
- 2026-10-29 — rewritten for every group, at the person's request after the
  first implementation review.

## Revisit when

- A product needs `layers`, `breakpoints` or `microSpacing` themed.
- A device check shows native does not apply a group, and the fallback needs
  recording.
