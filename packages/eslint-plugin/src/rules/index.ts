import {noRawHtmlElement} from './no-raw-html-element.js'
import {noTokensBarrelImport} from './no-tokens-barrel-import.js'
import {noDeprecatedTableParts} from './no-deprecated-table-parts.js'
import {noRawDesignValues} from './no-raw-design-values.js'
import {noFlexGrowWeb} from './no-flex-grow-web.js'
import {preferDsFormComponents} from './prefer-ds-form-components.js'

export const rules = {
  'no-raw-html-element': noRawHtmlElement,
  'no-tokens-barrel-import': noTokensBarrelImport,
  'no-deprecated-table-parts': noDeprecatedTableParts,
  'no-raw-design-values': noRawDesignValues,
  'no-flex-grow-web': noFlexGrowWeb,
  'prefer-ds-form-components': preferDsFormComponents,
}
