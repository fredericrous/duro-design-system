/**
 * The web ThemeProvider's override rule, pure: it runs the same on the server
 * and in the browser (no `CSS` global), so a server-rendered rule hydrates.
 */
import {isSafeColor, THEMABLE_GROUPS, validateTokens} from '@duro-app/tokens/theme'
import type {ThemableGroup, ThemeTokens} from '@duro-app/tokens/theme'

export {isSafeColor}

/** `var(--bg-x1y2)` → `--bg-x1y2`: the compiled variable a token reference names. */
export function variableFromReference(reference: unknown): string | null {
  const match = /^var\((--[\w-]+)\)$/.exec(String(reference ?? ''))
  return match ? match[1] : null
}

/**
 * The scoped rule for a provider's tokens, or null when it has none. Values
 * are validated again here, so the rule is safe whatever the caller passed.
 */
export function overrideRule(
  scope: string,
  tokens: ThemeTokens,
  variableOf: (group: ThemableGroup, key: string) => string | null,
): string | null {
  const {kept} = validateTokens(tokens)
  const declarations = THEMABLE_GROUPS.flatMap((group) =>
    Object.entries(kept[group] ?? {}).flatMap(([key, value]) => {
      const variable = variableOf(group, key)
      return variable ? [`${variable}: ${value};`] : []
    }),
  )
  if (declarations.length === 0) return null
  // Doubled, so it outranks the theme classes (one class each) wherever the
  // stylesheets land.
  // useId output holds neither a quote nor a backslash: safe inside quotes.
  const selector = `[data-duro-theme="${scope}"]`
  return `${selector}${selector} { ${declarations.join(' ')} }`
}
