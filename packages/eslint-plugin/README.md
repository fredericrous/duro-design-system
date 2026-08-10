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
| `duro/no-raw-design-values`      | warn   | suggestion           |

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

Inside `css.create()` objects: hex colors report everywhere (palette matches
suggest the `colors.*` token; off-palette hexes report without a fix), and
numeric/`px` values matching the spacing or radius scale report on the
properties where that mapping is unambiguous (padding/margin/gap families →
`spacing.*`, border radius family → `radii.*`). `width: 16` or `fontSize: 16`
never report — same number, different meaning. Ships as `warn`: it informs,
it doesn't gate.

Options: `{factories?: string[], spacingProperties?: string[], radiiProperties?: string[]}`
(property lists replace the defaults, they don't merge)

## Token data

The rule data (deep-path map, spacing/radius px values, color palette) is
mirrored from `@duro-app/tokens` as literals so the published plugin stays
dependency-free. `test/token-drift.test.ts` rebuilds every table from the real
tokens package and fails CI when they drift.
