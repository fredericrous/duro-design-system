import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import effectPlugin from '@effect/eslint-plugin'
import prettier from 'eslint-config-prettier'
import duro from '@duro-app/eslint-plugin'

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

export const react = tseslint.config(
  ...base,
  reactHooks.configs.flat.recommended,
  duro.configs.recommended,
  {
    name: 'duro-config/react-policy',
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
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
            },
            {
              group: ['lexical', '@lexical/*'],
              message: LEXICAL_MESSAGE,
            },
          ],
        },
      ],
    },
  },
)

const KYSELY_MESSAGE =
  'DB access in this stack is @effect/sql (SqlClient + Migrator + SqlSchema) — Kysely duplicates it outside the Effect runtime.'

const OTEL_BARREL_MESSAGE =
  'Import the subpath you need (e.g. @effect/opentelemetry/NodeSdk) — the barrel re-exports WebSdk, which statically imports @opentelemetry/sdk-trace-web and crashes a Node service at module load.'

export const effect = tseslint.config(...base, {
  name: 'duro-config/effect-policy',
  plugins: {'@effect': effectPlugin},
  rules: {
    '@effect/no-import-from-barrel-package': 'warn',
    'no-restricted-imports': [
      'error',
      {
        paths: [{name: '@effect/opentelemetry', message: OTEL_BARREL_MESSAGE}],
        patterns: [
          {
            group: ['kysely', 'kysely-*', '@kysely/*'],
            message: KYSELY_MESSAGE,
          },
        ],
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

export default {base, react, effect, tests}
