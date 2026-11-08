import tseslintPlugin from '@typescript-eslint/eslint-plugin'
import {noRawHtmlElement} from './no-raw-html-element.js'
import {noTokensBarrelImport} from './no-tokens-barrel-import.js'
import {noDeprecatedTableParts} from './no-deprecated-table-parts.js'
import {noRawDesignValues} from './no-raw-design-values.js'
import {noRawLayerValues} from './no-raw-layer-values.js'
import {noRawBreakpointQuery} from './no-raw-breakpoint-query.js'
import {noFlexGrowWeb} from './no-flex-grow-web.js'
import {preferDsFormComponents} from './prefer-ds-form-components.js'

export const rules = {
  'no-raw-html-element': noRawHtmlElement,
  'no-tokens-barrel-import': noTokensBarrelImport,
  'no-deprecated-table-parts': noDeprecatedTableParts,
  'no-raw-design-values': noRawDesignValues,
  'no-raw-layer-values': noRawLayerValues,
  'no-raw-breakpoint-query': noRawBreakpointQuery,
  'no-flex-grow-web': noFlexGrowWeb,
  'prefer-ds-form-components': preferDsFormComponents,
  // typescript-eslint's rule under the duro prefix: the UI bans keep `allowTypeImports`
  // and report as `duro/no-restricted-imports`, apart from the harness's own ban.
  'no-restricted-imports': tseslintPlugin.rules['no-restricted-imports'],
}
