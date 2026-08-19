import duro from '@duro-app/eslint-plugin'
import {base, tests} from '@duro-app/eslint-config'
import reactHooks from 'eslint-plugin-react-hooks'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'storybook-static/**',
      // Full repo copies live here; linting them double-reports everything.
      '.claude/**',
    ],
  },
  // Dogfood the shared config's base + tests presets repo-wide.
  ...base,
  ...tests,
  {
    // Build/config scripts run under Node, not the browser.
    files: ['**/*.config.js', '**/babel.config.js', '**/scripts/**/*.mjs'],
    languageOptions: {
      globals: {console: 'readonly', process: 'readonly', URL: 'readonly', Buffer: 'readonly'},
    },
  },
  {
    // Classic hooks correctness on the component sources. The v7 compiler
    // rules (refs, set-state-in-effect, immutability, …) flag ~27 sites —
    // that migration is its own task, not an adoption gate.
    files: ['packages/ui/src/**/*.tsx'],
    plugins: {'react-hooks': reactHooks},
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    // CSF3 `render:` story functions ARE components at runtime — the
    // rule can't tell (canonical false positive).
    files: ['**/*.stories.tsx'],
    rules: {'react-hooks/rules-of-hooks': 'off'},
  },
  {
    ...duro.configs.recommended,
    // Scoped to the surfaces that model the API for consumers. Component
    // internals are exempt on purpose: Table.tsx *defines* the deprecated
    // Container, and the icon/diagram files are dense SVG whose churn we
    // don't want gating a commit.
    files: ['**/*.stories.tsx', 'packages/ui/src/docs/**/*.tsx', 'docs/ai/recipes/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {sourceType: 'module', ecmaFeatures: {jsx: true}},
    },
  },
]
