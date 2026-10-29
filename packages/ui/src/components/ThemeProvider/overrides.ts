import {createContext} from 'react'
import type {ColorToken} from '@duro-app/tokens/keys'
import type {ThemeTokens} from '@duro-app/tokens/theme'

/** Colours that replace a theme's own, by token key. */
export type ColorOverrides = Partial<Record<ColorToken, string>>
export type {ThemeTokens}

/** The tokens in force at a provider, and the theme they were made for. */
export interface EffectiveOverrides {
  theme: string | null
  tokens: ThemeTokens
}

export const OverridesContext = createContext<EffectiveOverrides>({theme: null, tokens: {}})

/**
 * One rule on both platforms: colours and shadows are defined by every theme,
 * so a provider on the same theme as the one above it keeps that one's and
 * lays its own over them, and a provider on another theme starts from its own
 * theme's. Every other group is not tied to a theme: it always inherits, and
 * the child's entries lay over it. Pure: `own` is already validated
 * (`validateTokens`), and warnings are the provider's job, from an effect.
 */
export function mergeOverrides(
  outer: EffectiveOverrides,
  theme: string,
  own: ThemeTokens,
): EffectiveOverrides {
  const sameTheme = outer.theme === theme
  const merged: Record<string, Record<string, string>> = {}
  const groups = new Set<string>([...Object.keys(outer.tokens), ...Object.keys(own)])
  for (const group of groups) {
    const resetsOnThemeChange = group === 'colors' || group === 'shadows'
    const inherited =
      resetsOnThemeChange && !sameTheme
        ? {}
        : (outer.tokens as Record<string, Record<string, string> | undefined>)[group]
    const ownEntries = (own as Record<string, Record<string, string> | undefined>)[group]
    const entries = {...inherited, ...ownEntries}
    if (Object.keys(entries).length > 0) merged[group] = entries
  }
  return {theme, tokens: merged as ThemeTokens}
}

/**
 * A provider's own tokens, as `validateTokens` takes them: `overrides` is the
 * colour alias and `tokens.colors` wins on a clash.
 */
export function ownTokens(
  overrides: ColorOverrides | undefined,
  tokens: ThemeTokens | undefined,
): ThemeTokens {
  if (!overrides) return tokens ?? {}
  return {...tokens, colors: {...overrides, ...tokens?.colors}}
}
