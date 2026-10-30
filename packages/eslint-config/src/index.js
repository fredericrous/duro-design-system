import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import effectPlugin from '@effect/eslint-plugin'
import prettier from 'eslint-config-prettier'
import duro from '@duro-app/eslint-plugin'
import {adrLint as aval, adrLintTyped as avalTyped} from '@aval-adr/eslint-config'

/**
 * Shareable flat config for the Duro stack. Four presets, each a plain flat
 * config array:
 *
 * - `base`    — TS + prettier interop; every TypeScript package.
 * - `react`   — base + react-hooks + the duro plugin + UI-library policy;
 *               anything rendering with react-strict-dom / @duro-app/ui.
 * - `effect`  — base + the @effect plugin + server-stack policy; Effect
 *               services and API packages.
 * - `tests`   — accessibility-first selectors; applies itself only to
 *               test/e2e files, so it can sit in any config unconditionally.
 *
 * `react` and `effect` both include `base`, so either works alone; applying
 * both in one repo just repeats identical entries, which flat config merges
 * harmlessly. Policy bans carry their rationale in the message — the lint
 * output is meant to teach the fix, not just refuse the code.
 */

export const base = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    name: 'duro-config/base',
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettier,
)

const FOREIGN_UI_MESSAGE =
  'UI primitives come from @duro-app/ui only. If the component you need is missing, add it to duro-design-system instead of reaching for another library — `npx duro list` shows what exists.'

const LEXICAL_MESSAGE =
  'Rich text goes through @fredericrous/lexical-multi at the app layer, never raw Lexical — the wrapper carries the multi-editor state, native support, and edit-state accessibility.'

const FOREIGN_UI_PATTERN = {
  allowTypeImports: true,
  group: [
    'react-aria',
    'react-aria-components',
    '@react-aria/*',
    '@adobe/react-spectrum',
    '@react-spectrum/*',
    '@mui/*',
    '@material-ui/*',
    '@radix-ui/*',
    '@chakra-ui/*',
    '@headlessui/*',
    'antd',
    'antd/*',
    '@frontjutsu/ui',
    '@frontjutsu/ui/*',
  ],
  message: FOREIGN_UI_MESSAGE,
}

const LEXICAL_PATTERN = {
  allowTypeImports: true,
  group: ['lexical', '@lexical/*'],
  message: LEXICAL_MESSAGE,
}

export const react = tseslint.config(
  ...base,
  // Classic hooks correctness only. react-hooks v7's flat.recommended also
  // ships the React Compiler-era rules (refs, set-state-in-effect,
  // immutability, …) at error — adopting those is a per-repo migration
  // (duro-design-system deferred ~27 sites, website-builder ~53), not a
  // default gate. A repo that adopts the compiler opts in on top.
  {
    name: 'duro-config/react-hooks-classic',
    plugins: {'react-hooks': reactHooks},
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  duro.configs.recommended,
  {
    name: 'duro-config/react-policy',
    rules: {
      // The typescript-eslint version, not the core rule, for `allowTypeImports`.
      // Banning a module by name also catches `import type {X} from 'lexical'`,
      // and a type import erases at compile time: it reaches no runtime module,
      // so it bypasses nothing these bans protect. kb-vision hit exactly that —
      // it uses the wrapper correctly and needed one type the wrapper does not
      // re-export — and had to carry a local override to say so.
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [FOREIGN_UI_PATTERN, LEXICAL_PATTERN],
        },
      ],
    },
  },
)

const KYSELY_MESSAGE =
  'DB access in this stack is @effect/sql (SqlClient + Migrator + SqlSchema) — Kysely duplicates it outside the Effect runtime.'

const OTEL_BARREL_MESSAGE =
  'Import the subpath you need (e.g. @effect/opentelemetry/NodeSdk) — the barrel re-exports WebSdk, which statically imports @opentelemetry/sdk-trace-web and crashes a Node service at module load.'

const OTEL_BARREL_PATH = {
  allowTypeImports: true,
  name: '@effect/opentelemetry',
  message: OTEL_BARREL_MESSAGE,
}

const KYSELY_PATTERN = {
  allowTypeImports: true,
  group: ['kysely', 'kysely-*', '@kysely/*'],
  message: KYSELY_MESSAGE,
}

export const effect = tseslint.config(...base, {
  name: 'duro-config/effect-policy',
  plugins: {'@effect': effectPlugin},
  rules: {
    '@effect/no-import-from-barrel-package': 'warn',
    // See the react preset: type imports erase, so they bypass nothing here.
    // The OTel barrel ban exists because WebSdk's transitive imports crash a
    // Node service *at module load* — which a type import never triggers.
    'no-restricted-imports': 'off',
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        paths: [OTEL_BARREL_PATH],
        patterns: [KYSELY_PATTERN],
      },
    ],
  },
})

const TESTID_MESSAGE =
  'Select by what users and assistive tech perceive — getByRole/getByLabel/getByText — not test ids. If nothing selectable exists, the control is not accessible; fix the component.'

const CSS_LOCATOR_MESSAGE =
  'CSS class/id locators are implementation details that drift. Use getByRole/getByLabel/getByText; gate readiness on aria-busy over a named region, not a class hook.'

export const tests = [
  {
    name: 'duro-config/tests',
    files: [
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/e2e/**/*.{ts,tsx,js,jsx}',
      '**/__tests__/**/*.{ts,tsx,js,jsx}',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.property.name=/^(get|query|find)(All)?ByTestId$/]',
          message: TESTID_MESSAGE,
        },
        {
          selector: 'CallExpression[callee.name=/^(get|query|find)(All)?ByTestId$/]',
          message: TESTID_MESSAGE,
        },
        {
          selector:
            'CallExpression[callee.property.name="locator"] > Literal.arguments:first-child[value=/^[.#]/]',
          message: CSS_LOCATOR_MESSAGE,
        },
      ],
    },
  },
]

const STACK_IMPORT_BANS = {
  react: {patterns: [FOREIGN_UI_PATTERN, LEXICAL_PATTERN]},
  effect: {paths: [OTEL_BARREL_PATH], patterns: [KYSELY_PATTERN]},
}

// Every non-empty subset of `items`, smaller subsets first.
function combinationsBySize(items) {
  const all = items.reduce(
    (subsets, item) => [...subsets, ...subsets.map((s) => [...s, item])],
    [[]],
  )
  return all.filter((subset) => subset.length > 0).sort((a, b) => a.length - b.length)
}

// One tuple per choice of one glob from each list: the `files` form that
// matches a file only when it matches every glob in the tuple.
function crossGlobs(globLists) {
  return globLists.reduce(
    (tuples, globs) => tuples.flatMap((tuple) => globs.map((glob) => [...tuple, glob])),
    [[]],
  )
}

// The preset emits one `no-restricted-imports` per `files` scope, and in a
// file several scopes cover flat config keeps only the last one's options.
// So each entry carries every ban that applies wherever it is the last match:
// - the repo-wide bans (plain stacks and unscoped consumer entries) go on the
//   unscoped entries and on every scoped or intersection entry;
// - a scoped stack's bans go on its own `files` entry, plus the plain bans;
// - where scopes can overlap, an intersection entry (`files: [[globA, globB]]`)
//   holds the bans of every scope in it plus the plain ones: stack x stack,
//   layer x each combination of scoped stacks;
// - entries are ordered fewest scopes first, so the most specific comes last.
function adrLintOptions({stack, restrictedImports = []}) {
  if (stack === undefined && restrictedImports.length > 0) {
    throw new Error(
      '@duro-app/eslint-config: adrLint({restrictedImports}) needs `stack` — the presets whose import bans it must keep (["react"], ["effect"], or [] for none); without it a react repo would lose its UI bans',
    )
  }
  const expected = 'expected "react" and/or "effect", or {name, files: [globs]} to scope one'
  const entries = (stack ?? []).map((stackEntry) => {
    const name = typeof stackEntry === 'string' ? stackEntry : stackEntry?.name
    if (typeof name !== 'string' || !Object.hasOwn(STACK_IMPORT_BANS, name)) {
      throw new Error(`@duro-app/eslint-config: unknown stack "${name}" — ${expected}`)
    }
    if (typeof stackEntry === 'string') return {bans: STACK_IMPORT_BANS[name]}
    const {files} = stackEntry
    if (
      !Array.isArray(files) ||
      files.length === 0 ||
      !files.every((glob) => typeof glob === 'string')
    ) {
      throw new Error(
        `@duro-app/eslint-config: scoped stack "${name}" needs a non-empty \`files\` array of globs — ${expected}`,
      )
    }
    return {bans: STACK_IMPORT_BANS[name], files}
  })
  const plainStackBans = entries
    .filter((entry) => entry.files === undefined)
    .map((entry) => entry.bans)
  // Unscoped consumer entries are repo-wide bans too: a scoped entry replaces
  // them for the files it covers, so it must carry them.
  const unscopedEntries = restrictedImports.filter((entry) => entry.files === undefined)
  const repoWide = [...plainStackBans, ...unscopedEntries]
  const scopedStacks = entries.filter((entry) => entry.files !== undefined)
  const stackCombinations = combinationsBySize(scopedStacks)
  // A ban repeated by name (two scopes of one stack) is listed once, so an
  // import is not reported twice.
  const mergeBans = (list) => ({
    paths: [...new Set(list.flatMap((bans) => bans.paths ?? []))],
    patterns: [...new Set(list.flatMap((bans) => bans.patterns ?? []))],
  })
  const scopedStackEntries = stackCombinations.map((combination) => ({
    // A single scoped stack's files stay a plain glob list, not a 1-tuple.
    files:
      combination.length === 1
        ? combination[0].files
        : crossGlobs(combination.map((scopedStack) => scopedStack.files)),
    ...mergeBans([...repoWide, ...combination.map((scopedStack) => scopedStack.bans)]),
  }))
  // Once per scope: the preset merges entries that share `files`, and a ban
  // listed twice there reports one import twice.
  const scopesGiven = new Set()
  const scoped = restrictedImports.flatMap((entry) => {
    if (entry.files === undefined) return []
    const scope = JSON.stringify(entry.files)
    const first = !scopesGiven.has(scope)
    scopesGiven.add(scope)
    const stackBansOnce = (list) => (first ? list : [])
    const layer = {
      ...entry,
      ...mergeBans([...stackBansOnce(repoWide), entry]),
    }
    const intersections = stackCombinations.map((combination) => ({
      files: crossGlobs([entry.files, ...combination.map((scopedStack) => scopedStack.files)]),
      ...mergeBans([
        ...stackBansOnce([...repoWide, ...combination.map((scopedStack) => scopedStack.bans)]),
        entry,
      ]),
    }))
    return [layer, ...intersections]
  })
  // The repo-wide group comes first: the preset emits one entry per `files`
  // group in first-insertion order, so an unscoped group inserted after a
  // scoped one would be the last match and replace that scope's bans.
  return {
    restrictedImports: [...plainStackBans, ...unscopedEntries, ...scopedStackEntries, ...scoped],
  }
}

/**
 * Opt-in: the decided code rules a linter matches exactly, from
 * @aval-adr/eslint-config. Flat config keeps the last options of a rule, so
 * `stack` re-states the named presets' import bans inside the one merged
 * `no-restricted-imports` that adr-lint emits.
 *
 * @param {import('../index.d.ts').AdrLintOptions} [options]
 * @returns {import('eslint').Linter.Config[]}
 */
export const adrLint = ({stack, restrictedImports} = {}) =>
  aval(adrLintOptions({stack, restrictedImports}))

/**
 * @param {import('../index.d.ts').AdrLintOptions} [options]
 * @returns {import('eslint').Linter.Config[]}
 */
export const adrLintTyped = ({stack, restrictedImports} = {}) =>
  avalTyped(adrLintOptions({stack, restrictedImports}))

export default {base, react, effect, tests, adrLint, adrLintTyped}
