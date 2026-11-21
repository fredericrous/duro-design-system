# @greenharness/greenrack-eslint-config

Shareable ESLint flat config for the greenrack stack — the policies CLAUDE.md and
agent memory can only suggest, wired into the linter so every consumer repo
gates them at commit time (via amont's built-in `pre-commit-lint-js`, which
activates on the presence of a root ESLint config) and in CI.

Requires ESLint 9 or 10 (flat config). It keeps only the design-system and
UI-library policy, as `react`. The general conventions (`base`, `effect`,
`tests`) and the decided-rule bridge (`adrLint`) come from
[`@aval-adr/eslint-config`](https://www.npmjs.com/package/@aval-adr/eslint-config),
which this package extends and declares as a peer: install both.

```sh
pnpm add -D @greenharness/greenrack-eslint-config @aval-adr/eslint-config
```

## Usage

```js
// eslint.config.js (repo root — amont only detects a ROOT config)
import {react} from '@greenharness/greenrack-eslint-config'
import {effect, tests} from '@aval-adr/eslint-config'

export default [
  {ignores: ['**/dist/**', '**/build/**']},
  ...react,
  ...tests,
  // Server-only packages in a monorepo can scope the effect preset:
  ...effect.map((c) => ({...c, files: ['apps/api/**/*.ts']})),
]
```

## Presets

| Preset   | From                                    | Composes                                                             | For                                     |
| -------- | --------------------------------------- | -------------------------------------------------------------------- | --------------------------------------- |
| `react`  | `@greenharness/greenrack-eslint-config` | aval `base` + classic react-hooks + the greenrack plugin + UI policy | RSD / `@greenharness/greenrack-ui` apps |
| `base`   | `@aval-adr/eslint-config`               | `@eslint/js` + `typescript-eslint` recommended, prettier interop     | every TypeScript package                |
| `effect` | `@aval-adr/eslint-config`               | `base` + `@effect` plugin + server-stack policy                      | Effect services                         |
| `tests`  | `@aval-adr/eslint-config`               | accessibility-first selectors (self-scoped to test/e2e files)        | any repo with tests                     |

`react` reports its import bans as `greenrack/no-restricted-imports`, apart from
`effect`'s `@typescript-eslint/no-restricted-imports` and adr-lint's
`adr-lint/no-restricted-imports`, so composing them keeps every ban: none of
the three overrides another.

A repository that scopes `react` to part of its tree restates its import bans
for the other files by name: `uiImportBans` is the
`greenrack/no-restricted-imports` entry `react` sets, and `greenrackPlugin` is
the plugin it registers (the same object, so ESLint never sees two plugins
under one key):

```js
import {greenrackPlugin, react, uiImportBans} from '@greenharness/greenrack-eslint-config'

export default [
  ...react.map((c) => ({...c, files: ['app/**/*.{ts,tsx}']})),
  {
    ignores: ['app/**'],
    plugins: {greenrack: greenrackPlugin},
    rules: {'greenrack/no-restricted-imports': uiImportBans},
  },
]
```

## What the policy enforces

- **`react`**: UI primitives come from `@greenharness/greenrack-ui` only. react-aria,
  Spectrum, MUI, Radix, Chakra, headlessui, antd and `@frontjutsu/ui` are
  banned with a message that says where to add a missing component. Rich
  text goes through `@fredericrous/lexical-multi`, never raw `lexical`. It
  also carries everything in `@greenharness/greenrack-eslint-plugin`: html.\* elements,
  deep token imports, token values and the form kit.
- `effect` and `tests` are documented with `@aval-adr/eslint-config`.

Severity is the one gating line: `error` gates at commit and CI, `warn`
informs everywhere. Don't add `--max-warnings=0` — promote a rule to
`error` here instead if it earns gating.

### Adopting 3.0 with existing debt

3.0 promotes `greenrack/no-raw-design-values` to `error` and adds
`greenrack/no-raw-breakpoint-query`. A repo that already carries raw values keeps
the gate for every **new** file and ratchets the old ones down with an
explicit file list — never a glob, never `--max-warnings`:

```js
// eslint.greenrack-baseline.js — delete a line when its file is migrated. Never add one.
export const RAW_VALUES_BASELINE = [
  'app/routes/legacy-dashboard.tsx',
  'app/components/OldChart/OldChart.tsx',
]
```

```js
// eslint.config.js — after the presets, so last-wins downgrades only these
import {RAW_VALUES_BASELINE} from './eslint.greenrack-baseline.js'
export default [
  ...react,
  {files: RAW_VALUES_BASELINE, rules: {'greenrack/no-raw-design-values': 'warn'}},
]
```

Most findings carry a suggestion; the ESLint API can apply them in bulk
(`message.suggestions[0].fix`). What is left is the handful that need a
human choice — an off-palette color, an off-scale spacing.

## Escape hatches

Flat config is last-wins — scope an override after the preset:

```js
...react,
{
  // The one file allowed to import the raw engine reset:
  files: ['packages/editor/src/usePageNode.ts'],
  rules: {'greenrack/no-restricted-imports': 'off'},
}
```

## adr-lint rules (opt-in)

`adrLint` and `adrLintTyped` add the decided code rules a linter matches
exactly. Import them from `@aval-adr/eslint-config` and put them last. Their
bans have their own rule id, so no `stack` option is needed (6.0 drops it):

```js
import {react} from '@greenharness/greenrack-eslint-config'
import {adrLint} from '@aval-adr/eslint-config'

export default [...react, ...adrLint()]
```

## Migrating from 5.x

- Add `@aval-adr/eslint-config` (`^0.16.0`) beside this package.
- Import `base`, `effect`, `tests` and `adrLint` from it; keep `react` from here.
- Drop `stack` from an `adrLint` call.
- An override of `no-restricted-imports` for the UI bans becomes `greenrack/no-restricted-imports`.
