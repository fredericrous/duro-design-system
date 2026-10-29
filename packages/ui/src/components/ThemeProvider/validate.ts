/**
 * The validators behind ThemeProvider's overrides, pure and free of web and
 * native imports: the same answer on the server, in the browser and on native.
 */
import {FONT_FAMILY_KEYS, RADIUS_KEYS} from '@duro-app/tokens/keys'
import type {FontFamilyToken, RadiusToken} from '@duro-app/tokens/keys'

/** Font stacks that replace a theme's own, by token key. */
export type FontOverrides = Partial<Record<FontFamilyToken, string>>

/** Radii that replace a theme's own, by token key (`px6` and `full` stay fixed). */
export type RadiusOverrides = Partial<Record<Exclude<RadiusToken, 'px6' | 'full'>, string>>

type RadiusKey = keyof RadiusOverrides

const RADIUS_OVERRIDE_KEYS: readonly RadiusKey[] = RADIUS_KEYS.filter(
  (key): key is RadiusKey => key !== 'px6' && key !== 'full',
)

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

const FORBIDDEN_IN_FONT_FAMILY = /[;{}<>\\]|\/\*|\*\/|url\(|var\(|expression\(/i
const FONT_FAMILY_ITEM = /^(?:[A-Za-z_-][\w -]*|"[^"'\\]*"|'[^"'\\]*')$/

/** A comma-separated font-family list: identifiers or balanced quoted names. */
export function isSafeFontFamily(value: string): boolean {
  if (FORBIDDEN_IN_FONT_FAMILY.test(value)) return false
  return value.split(',').every((item) => FONT_FAMILY_ITEM.test(item.trim()))
}

/** `0`, or a non-negative number with `px` or `rem`. */
export function isSafeLength(value: string): boolean {
  return /^(?:0|(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem))$/.test(value)
}

const warned = new Set<string>()

function warnOnce(group: string, key: string, value: unknown, rule: string): void {
  const signature = JSON.stringify([group, key, value])
  if (warned.has(signature)) return
  warned.add(signature)
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return
  console.warn(`[duro] ThemeProvider dropped ${group}.${key} = ${JSON.stringify(value)}: ${rule}`)
}

function keepValid<Key extends string>(
  group: string,
  own: Partial<Record<Key, string>> | undefined,
  supported: readonly Key[],
  isValid: (value: string) => boolean,
  rule: string,
): Partial<Record<Key, string>> {
  const kept: Partial<Record<Key, string>> = {}
  for (const [key, value] of Object.entries(own ?? {})) {
    if (!(supported as readonly string[]).includes(key)) {
      warnOnce(group, key, value, 'unsupported key')
    } else if (typeof value !== 'string' || !isValid(value)) {
      warnOnce(group, key, value, rule)
    } else {
      kept[key as Key] = value
    }
  }
  return kept
}

/**
 * One provider's own fonts and radii, reduced to supported keys with valid
 * values. Each dropped value is warned about once per distinct
 * group/key/value, in development.
 */
export function validateOwnTypography(
  fonts: FontOverrides | undefined,
  radii: RadiusOverrides | undefined,
): {fonts: FontOverrides; radii: RadiusOverrides} {
  return {
    fonts: keepValid(
      'fonts',
      fonts,
      FONT_FAMILY_KEYS,
      isSafeFontFamily,
      'not a safe font-family list',
    ),
    radii: keepValid(
      'radii',
      radii,
      RADIUS_OVERRIDE_KEYS,
      isSafeLength,
      'must be 0 or a non-negative px/rem length',
    ),
  }
}
