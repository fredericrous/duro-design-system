/**
 * The web ThemeProvider's override rule, pure: it runs the same on the server
 * and in the browser (no `CSS` global), so a server-rendered rule hydrates.
 */
import type {ColorToken, FontFamilyToken} from '@duro-app/tokens/keys'
import type {ColorOverrides, RadiusOverrides} from './overrides'
import {isSafeColor, isSafeFontFamily, isSafeLength} from './validate'

export {isSafeColor}

/** One group's values and the compiled variable each key names. */
interface OverrideGroup<Key extends string> {
  values: Partial<Record<Key, string>>
  variableOf: (key: Key) => string | null
}

/** The groups beyond colours that a rule can cover. */
export interface TypographyGroups {
  fonts?: OverrideGroup<FontFamilyToken>
  radii?: OverrideGroup<keyof RadiusOverrides & string>
}

/** `var(--bg-x1y2)` → `--bg-x1y2`: the compiled variable a token reference names. */
export function variableFromReference(reference: unknown): string | null {
  const match = /^var\((--[\w-]+)\)$/.exec(String(reference ?? ''))
  return match ? match[1] : null
}

function declarationsOf<Key extends string>(
  values: Partial<Record<Key, string>>,
  variableOf: (key: Key) => string | null,
  isValid: (value: string) => boolean,
): string[] {
  return Object.entries(values).flatMap(([key, value]) => {
    const variable = variableOf(key as Key)
    return variable && typeof value === 'string' && isValid(value) ? [`${variable}: ${value};`] : []
  })
}

/** The scoped rule for a provider's overrides, or null when it has none. */
export function overrideRule(
  scope: string,
  overrides: ColorOverrides,
  variableOf: (key: ColorToken) => string | null,
  groups: TypographyGroups = {},
): string | null {
  const declarations = [
    ...declarationsOf(overrides, variableOf, isSafeColor),
    ...(groups.fonts
      ? declarationsOf(groups.fonts.values, groups.fonts.variableOf, isSafeFontFamily)
      : []),
    ...(groups.radii
      ? declarationsOf(groups.radii.values, groups.radii.variableOf, isSafeLength)
      : []),
  ]
  if (declarations.length === 0) return null
  // Doubled, so it outranks the theme classes (one class each) wherever the
  // stylesheets land.
  // useId output holds neither a quote nor a backslash: safe inside quotes.
  const selector = `[data-duro-theme="${scope}"]`
  return `${selector}${selector} { ${declarations.join(' ')} }`
}
