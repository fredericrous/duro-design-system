# @duro-app/eslint-plugin

ESLint rules that enforce the Duro design system conventions mechanically —
what CLAUDE.md can only suggest, these rules gate.

Requires ESLint 9 (flat config). The plugin has zero runtime dependencies.

## Usage

```js
// eslint.config.js
import duro from '@duro-app/eslint-plugin'
import tseslint from 'typescript-eslint'

export default [
  ...tseslint.configs.recommended,
  duro.configs.recommended,
  {
    rules: {
      // Example: a data grid the design system doesn't cover yet.
      'duro/no-raw-html-element': ['error', {allow: ['table', 'thead', 'tbody', 'tr', 'th', 'td']}],
    },
  },
]
```

The `recommended` preset registers the plugin under the `duro` namespace, so
you never have to register it yourself. Don't also register it manually under
another key — you'd get two live namespaces and confusing config.

## Rules

| Rule                             | Preset | Fix                  |
| -------------------------------- | ------ | -------------------- |
| `duro/no-raw-html-element`       | error  | suggestion           |
| `duro/no-tokens-barrel-import`   | error  | autofix              |
| `duro/no-deprecated-table-parts` | error  | autofix / suggestion |
| `duro/no-raw-design-values`      | error  | suggestion           |
| `duro/no-raw-breakpoint-query`   | error  | autofix              |

### no-raw-html-element

Raw lowercase JSX intrinsics (`<div>`, `<span>`, …) must be react-strict-dom
`html.*` elements. SVG subtrees are exempt (RSD has no SVG primitives).
Elements RSD doesn't export (`<table>`, `<canvas>`, …) report as non-portable;
allow them explicitly per-project via `allow`. The rewrite is a suggestion,
not an autofix, because `html.*` props are stricter than raw DOM props — a
mechanical `--fix` would trade lint errors for type errors.

Options: `{allow?: string[], reportUnsupported?: boolean, htmlModule?: string}`

### no-tokens-barrel-import

`import {colors} from '@duro-app/tokens'` breaks the StyleX babel plugin. The
autofix splits the barrel import into the right deep imports
(`@duro-app/tokens/tokens/colors.css`, …), preserving aliases and inline
`type` specifiers. Imports with any unmapped specifier report without a fix.

Options: `{packages?: string[]}`

### no-deprecated-table-parts

Flags `<Table.Container>` (Root owns the container query now; report-only —
unwrapping is layout-unsafe to automate) and the no-op `isActions` prop on
`<Table.HeaderCell>` (autofixed away for literal values; suggestion when the
value is an expression). Matches by identifier name (`Table`, `TableCore` by
default) — configure via `tableIdentifiers`.

### no-raw-design-values

Inside `css.create()` objects, a raw design value is the finding — anything
with a token equivalent, and anything on a tokenised property that is off the
scale:

- **colors** — a hex / `rgb()` / `hsl()` literal anywhere. A palette value
  suggests its `colors.*` token; an off-palette one reports without a fix.
- **spacing and radius** — a number or `'Npx'` on the padding/margin/gap
  families → `spacing.*`, on the border-radius family → `radii.*`. On the
  scale it suggests the token; off the scale (`marginTop: 23`) it reports —
  "not a token" is the point.
- **breakpoints** — a px inside a `'@media …'` / `'@container …'` condition
  key. On the scale it suggests the computed key
  ``[`@media (min-width: ${breakpoints.md})`]`` and the import.
- **font size** (number, `px` or `rem`) → `typography.fontSize*` or, for the
  steps typography lacks, `typeScale.fontSizeN`; **font weight** 400–700 →
  `typography.fontWeight*`; **`boxShadow`** → `shadows.*` on an exact match,
  otherwise a report; **`transitionDuration` / `animationDuration`** `'Nms'` →
  `duration.*`; **timing functions** → `easing.*`.

- **sizes and border widths** (since 5.0, ADR-0027) — a number, `'Npx'` or
  negative on `width`/`height` and their min/max, `flexBasis`, block/inline
  size; on `border*Width`, `outlineWidth`, `outlineOffset`; and the width
  inside a `border*` or `outline` shorthand string. Each property draws from
  its own candidates: sizes → `sizes.*`; border widths → `borders.hairline /
strong / accent`; outline width → `borders.focusRing`; outline offset →
  `borders.focusOffset / focusOffsetSm`. One match suggests it (a negative as
  `calc(-1 * …)`); several are listed without a fix; none says to add a
  token. A `calc()` or template literal whose static text holds a px is
  reported too.
- **micro spacing** — an off-scale spacing of 1/2/3/5/6px suggests
  `microSpacing.pxN`.

Allowed: `0`, relative units (`%`, `vh`, `fr`, `em`, `rem`, `ch`…), keywords
(`auto`, `max-content`…), identifiers and member expressions (tokens), a
`calc()` of tokens. Skipped on purpose: negatives on spacing properties,
spacing shorthands (`'8px 16px'`, `'opacity 150ms'`), and positions
(`top`, `left`) and `lineHeight`. Since 3.0 it ships as `error`: a raw value is
the drift the design system exists to stop.

Options: `{factories?: string[], spacingProperties?: string[], radiiProperties?: string[], exemptFiles?: string[]}`
(property lists replace the defaults, they don't merge). `exemptFiles` takes
globs (`**`, `*`, `?`, `{a,b}`), matched against the path relative to the
working directory and the absolute path; a matching file is not checked. Name
only a file whose literals are a technique, not a design value — Duro names
its visually-hidden module.

### no-raw-breakpoint-query

A media-query string anywhere in a file — `useMediaQuery('(min-width:
768px)')`, `matchMedia(...)`, a constant — carries a raw breakpoint that
`no-raw-design-values` never sees (it only reads `css.create`). On the scale
the autofix rewrites the literal to `` `(min-width: ${breakpoints.md})` `` and
adds the import (a `css.defineConsts` string, so it interpolates to
`'768px'`); off the scale it reports. Skips `css.create` keys, and skips the
fix when a local `breakpoints` binding would shadow the import.

## Token data

The rule data (deep-path map, spacing/radius/breakpoint px values, font
sizes and weights, shadows, durations, easings, color palette) is mirrored
from `@duro-app/tokens` as literals so the published plugin stays
dependency-free. `test/token-drift.test.ts` rebuilds every table from the real
tokens package and fails CI when they drift.
