import duro from '@duro-app/eslint-plugin'
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
