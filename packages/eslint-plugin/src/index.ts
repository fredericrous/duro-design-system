import type {TSESLint} from '@typescript-eslint/utils'
import {rules} from './rules/index.js'

const plugin = {
  meta: {name: 'duro'},
  rules,
  configs: {} as Record<string, TSESLint.FlatConfig.Config>,
}

// Assigned after construction because the config must reference the plugin
// object that contains it — the standard ESLint 9 self-referential shape.
Object.assign(plugin.configs, {
  recommended: {
    name: 'greenrack/recommended',
    plugins: {greenrack: plugin},
    rules: {
      'greenrack/no-raw-html-element': 'error',
      'greenrack/no-tokens-barrel-import': 'error',
      'greenrack/no-deprecated-table-parts': 'error',
      // Errors since 3.0: a raw design value is the drift the system exists
      // to prevent. Consumers with debt ratchet with an explicit-file
      // baseline block (see @greenharness/greenrack-eslint-config README), never a glob
      // and never --max-warnings.
      'greenrack/no-raw-design-values': 'error',
      // New in 5.3: raw z-index and blur values. A warning for the 5.x line,
      // so no consumer's lint turns red on a minor; an error in the next major.
      'greenrack/no-raw-layer-values': 'warn',
      'greenrack/no-raw-breakpoint-query': 'error',
      'greenrack/prefer-ds-form-components': 'error',
    },
  } satisfies TSESLint.FlatConfig.Config,
})

export default plugin
export {rules}
