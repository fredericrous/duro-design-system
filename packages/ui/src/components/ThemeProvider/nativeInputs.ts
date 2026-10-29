import {THEMABLE_GROUPS} from '@duro-app/tokens/theme'
import type {ThemableGroup} from '@duro-app/tokens/theme'
import type {ColorOverrides, EffectiveOverrides} from './overrides'

/** `"JetBrains Mono", monospace` → `JetBrains Mono`: native takes one family, unquoted. */
export function firstFamily(list: string): string {
  const first = list.split(',')[0].trim()
  return first.replace(/^(["'])(.*)\1$/, '$2')
}

/** What each `createTheme` call receives on native: one input per group that has entries. */
export type NativeThemeInputs = Partial<Record<ThemableGroup, Record<string, string>>>

export function nativeThemeInputs(effective: EffectiveOverrides): NativeThemeInputs {
  const inputs: NativeThemeInputs = {}
  for (const group of THEMABLE_GROUPS) {
    const entries = (effective.tokens as NativeThemeInputs)[group]
    if (!entries || Object.keys(entries).length === 0) continue
    inputs[group] =
      group === 'typography'
        ? Object.fromEntries(
            Object.entries(entries).map(([key, value]) => [
              key,
              key.startsWith('fontFamily') ? firstFamily(value) : value,
            ]),
          )
        : entries
  }
  return inputs
}

/** What `useResolvedColors` returns: the theme's palette with the colour overrides laid over it, and nothing else. */
export function resolvedColors<Palette extends Record<string, string>>(
  palette: Palette,
  colors: ColorOverrides | undefined,
): Palette {
  return {...palette, ...colors}
}
