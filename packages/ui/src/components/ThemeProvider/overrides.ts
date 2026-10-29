import {createContext} from 'react'
import type {ColorToken} from '@duro-app/tokens/keys'
import {validateOwnTypography, type FontOverrides, type RadiusOverrides} from './validate'

/** Colours that replace a theme's own, by token key. */
export type ColorOverrides = Partial<Record<ColorToken, string>>
export type {FontOverrides, RadiusOverrides}

/** The overrides in force at a provider, and the theme they were made for. */
export interface EffectiveOverrides {
  theme: string | null
  colors: ColorOverrides
  fonts: FontOverrides
  radii: RadiusOverrides
}

export const OverridesContext = createContext<EffectiveOverrides>({
  theme: null,
  colors: {},
  fonts: {},
  radii: {},
})

/**
 * One rule on both platforms (plan N0, slice C): a provider on the same theme
 * as the one above it keeps that one's colours and lays its own over them; a
 * provider on another theme starts from its own theme's colours. Fonts and
 * radii are not tied to a theme: they always inherit, and the child's valid
 * entries lay over them.
 */
export function mergeOverrides(
  outer: EffectiveOverrides,
  theme: string,
  own: ColorOverrides | undefined,
  ownFonts?: FontOverrides,
  ownRadii?: RadiusOverrides,
): EffectiveOverrides {
  const inherited = outer.theme === theme ? outer.colors : {}
  const valid = validateOwnTypography(ownFonts, ownRadii)
  return {
    theme,
    colors: own ? {...inherited, ...own} : inherited,
    fonts: {...outer.fonts, ...valid.fonts},
    radii: {...outer.radii, ...valid.radii},
  }
}
