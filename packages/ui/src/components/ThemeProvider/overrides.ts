import {createContext} from 'react'
import type {ColorToken} from '@duro-app/tokens/keys'

/** Colours that replace a theme's own, by token key. */
export type ColorOverrides = Partial<Record<ColorToken, string>>

/** The overrides in force at a provider, and the theme they were made for. */
export interface EffectiveOverrides {
  theme: string | null
  colors: ColorOverrides
}

export const OverridesContext = createContext<EffectiveOverrides>({theme: null, colors: {}})

/**
 * One rule on both platforms (plan N0, slice C): a provider on the same theme
 * as the one above it keeps that one's overrides and lays its own over them;
 * a provider on another theme starts from its own theme's colours.
 */
export function mergeOverrides(
  outer: EffectiveOverrides,
  theme: string,
  own: ColorOverrides | undefined,
): EffectiveOverrides {
  const inherited = outer.theme === theme ? outer.colors : {}
  return {theme, colors: own ? {...inherited, ...own} : inherited}
}
