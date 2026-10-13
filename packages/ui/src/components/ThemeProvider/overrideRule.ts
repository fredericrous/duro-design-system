/**
 * The web ThemeProvider's override rule, pure: it runs the same on the server
 * and in the browser (no `CSS` global), so a server-rendered rule hydrates.
 */
import type {ColorToken} from '@duro-app/tokens/keys'
import type {ColorOverrides} from './overrides'

/** A value that is a colour and nothing else, so it cannot leave its rule. */
export function isSafeColor(value: string): boolean {
  // The same answer on the server and in the browser (no CSS.supports), so a
  // server-rendered rule hydrates unchanged: a hex, a colour function, or a
  // keyword, with nothing that could close the declaration or the rule.
  if (/[;{}<>"'\\]/.test(value)) return false
  return (
    /^#[0-9a-f]{3,8}$/i.test(value) ||
    /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)$/i.test(value) ||
    /^[a-z]+$/i.test(value)
  )
}

/** The scoped rule for a provider's overrides, or null when it has none. */
export function overrideRule(
  scope: string,
  overrides: ColorOverrides,
  variableOf: (key: ColorToken) => string | null,
): string | null {
  const declarations = Object.entries(overrides).flatMap(([key, value]) => {
    const variable = variableOf(key as ColorToken)
    return variable && typeof value === 'string' && isSafeColor(value)
      ? [`${variable}: ${value};`]
      : []
  })
  if (declarations.length === 0) return null
  // Doubled, so it outranks the theme classes (one class each) wherever the
  // stylesheets land.
  // useId output holds neither a quote nor a backslash: safe inside quotes.
  const selector = `[data-duro-theme="${scope}"]`
  return `${selector}${selector} { ${declarations.join(' ')} }`
}
