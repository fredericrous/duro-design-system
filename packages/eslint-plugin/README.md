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
  Translucent black as a whole `background`/`backgroundColor` value
  (`'rgba(0,0,0,0.5)'`, `'rgb(0 0 0 / 45%)'`, `'#00000080'`) is a hand-rolled
  modal scrim: it suggests `colors.backdrop`.
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

Skipped on purpose: `0`, negatives, shorthands (`'8px 16px'`,
`'opacity 150ms'`), identifiers, member expressions, template literals, and
`width` / `top` / `lineHeight` — same numbers, different meaning. Since 3.0 it
ships as `error`: a raw value is the drift the design system exists to stop.

Options: `{factories?: string[], spacingProperties?: string[], radiiProperties?: string[]}`
(property lists replace the defaults, they don't merge)

### no-raw-breakpoint-query

A media-query string anywhere in a file — `useMediaQuery('(min-width:
768px)')`, `matchMedia(...)`, a constant — carries a raw breakpoint that
`no-raw-design-values` never sees (it only reads `css.create`). What the fix
writes depends on where the query runs:

| Context                                                                                                 | Autofix                                                                                                               |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Runtime** — `matchMedia`, `useMediaQuery`, any string outside `css.create`                            | `` `(min-width: ${breakpointsPx.md}px)` `` + `import {breakpointsPx} from '@duro-app/tokens/raw'`                     |
| **Style** — inside `css.create`, or a string that is itself a condition (`'@media (min-width: 768px)'`) | `` `@media (min-width: ${breakpoints.md})` `` + `import {breakpoints} from '@duro-app/tokens/tokens/breakpoints.css'` |

`tokens/breakpoints.css` is `css.defineConsts`: it only exists where StyleX
compiles the file, and importing it anywhere else — a hook under vitest,
Node, a module the app's StyleX config skips — throws at import time. So the
rule also reports:

- **`breakpoints.*` read at runtime** (outside `css.create` and outside a
  `@media`/`@container` template). When every read is a template
  interpolation and the file no longer needs the const for a style, the fix
  rewrites them to `${breakpointsPx.<key>}px` and swaps the import for raw.
- **`breakpointsPx` imported from `tokens/breakpoints.css`** — the fix
  repoints the import at `@duro-app/tokens/raw` when that module exports
  everything the declaration names.

Off the scale it reports without a fix, and it skips the fix when a local
binding would shadow the import. Skips `css.create` keys (that is
`no-raw-design-values`).

## Token data

The rule data (deep-path map, spacing/radius/breakpoint px values, font
sizes and weights, shadows, durations, easings, color palette) is mirrored
from `@duro-app/tokens` as literals so the published plugin stays
dependency-free. `test/token-drift.test.ts` rebuilds every table from the real
tokens package and fails CI when they drift.
