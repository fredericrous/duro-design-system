# @duro-app/eslint-config

Shareable ESLint flat config for the Duro stack — the policies CLAUDE.md and
agent memory can only suggest, wired into the linter so every consumer repo
gates them at commit time (via amont's built-in `pre-commit-lint-js`, which
activates on the presence of a root ESLint config) and in CI.

Requires ESLint 9 or 10 (flat config). All plugins arrive as dependencies of
this package — consumers install one package.

## Usage

```js
// eslint.config.js (repo root — amont only detects a ROOT config)
import {react, effect, tests} from '@duro-app/eslint-config'

export default [
  {ignores: ['**/dist/**', '**/build/**']},
  ...react,
  ...tests,
  // Server-only packages in a monorepo can scope the effect preset:
  ...effect.map((c) => ({...c, files: ['apps/api/**/*.ts']})),
]
```

## Presets

| Preset   | Composes                                                           | For                       |
| -------- | ------------------------------------------------------------------ | ------------------------- |
| `base`   | `@eslint/js` + `typescript-eslint` recommended, prettier interop   | every TypeScript package  |
| `react`  | base + classic react-hooks + `@duro-app/eslint-plugin` + UI policy | RSD / `@duro-app/ui` apps |
| `effect` | base + `@effect` plugin + server-stack policy                      | Effect services           |
| `tests`  | accessibility-first selectors (self-scoped to test/e2e files)      | any repo with tests       |

`react` and `effect` both include `base`; applying both just repeats
identical entries, which flat config merges harmlessly. `tests` carries its
own `files` scope, so it can be appended unconditionally.

## What the policies enforce

- **`react`** — UI primitives come from `@duro-app/ui` only (react-aria,
  Spectrum, MUI, Radix, Chakra, headlessui, antd and `@frontjutsu/ui` are
  banned with a message that says where to add missing components); rich
  text goes through `@fredericrous/lexical-multi`, never raw `lexical`;
  plus everything in `@duro-app/eslint-plugin` (html.\* elements, deep token
  imports, token values, form kit, the RSD flexGrow trap).
- **`effect`** — `@effect/sql` not Kysely; `@effect/opentelemetry` only via
  subpath (the barrel statically imports the web SDK and crashes Node at
  module load); barrel-import hygiene via `@effect/eslint-plugin`.
- **`tests`** — no `getByTestId` family, no CSS class/id `locator()`
  strings: select by role/label/text, gate readiness on `aria-busy`.

Severity is the one gating line: `error` gates at commit and CI, `warn`
informs everywhere. Don't add `--max-warnings=0` — promote a rule to
`error` here instead if it earns gating.

### Adopting 3.0 with existing debt

3.0 promotes `duro/no-raw-design-values` to `error` and adds
`duro/no-raw-breakpoint-query`. A repo that already carries raw values keeps
the gate for every **new** file and ratchets the old ones down with an
explicit file list — never a glob, never `--max-warnings`:

```js
// eslint.duro-baseline.js — delete a line when its file is migrated. Never add one.
export const RAW_VALUES_BASELINE = [
  'app/routes/legacy-dashboard.tsx',
  'app/components/OldChart/OldChart.tsx',
]
```

```js
// eslint.config.js — after the presets, so last-wins downgrades only these
import {RAW_VALUES_BASELINE} from './eslint.duro-baseline.js'
export default [
  ...react,
  {files: RAW_VALUES_BASELINE, rules: {'duro/no-raw-design-values': 'warn'}},
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
  rules: {'no-restricted-imports': 'off'},
}
```
