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
    name: 'duro/recommended',
    plugins: {duro: plugin},
    rules: {
      'duro/no-raw-html-element': 'error',
      'duro/no-tokens-barrel-import': 'error',
      'duro/no-deprecated-table-parts': 'error',
      'duro/no-raw-design-values': 'warn',
    },
  } satisfies TSESLint.FlatConfig.Config,
})

export default plugin
export {rules}
