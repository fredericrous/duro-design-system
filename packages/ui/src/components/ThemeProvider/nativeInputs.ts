import type {EffectiveOverrides} from './overrides'
import type {ColorOverrides, FontOverrides, RadiusOverrides} from './overrides'

/** `"JetBrains Mono", monospace` → `JetBrains Mono`: native takes one family, unquoted. */
export function firstFamily(list: string): string {
  const first = list.split(',')[0].trim()
  return first.replace(/^(["'])(.*)\1$/, '$2')
}

/** What each `createTheme` call receives on native, one input per group. */
export interface NativeThemeInputs {
  colors: ColorOverrides
  typography: FontOverrides
  radii: RadiusOverrides
}

export function nativeThemeInputs(effective: EffectiveOverrides): NativeThemeInputs {
  const typography: FontOverrides = {}
  for (const [key, list] of Object.entries(effective.fonts)) {
    typography[key as keyof FontOverrides] = firstFamily(list)
  }
  return {colors: effective.colors, typography, radii: effective.radii}
}
