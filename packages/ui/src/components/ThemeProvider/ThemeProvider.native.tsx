// Native (React Native / Expo) ThemeProvider — Metro resolves this over
// ThemeProvider.tsx via the platform extension. The web version uses
// `display:contents` + a fixed portal-mount, neither of which exists on RN, so
// this applies the theme to a plain flex-column container, and passive
// overlays (toasts) draw through the host registry instead (plan N0,
// Decision 2).
import {createContext, type ReactNode, useContext, useMemo, useState} from 'react'
import {css, html} from 'react-strict-dom'
import type {ColorToken} from '@duro-app/tokens/keys'
import {darkColors, highContrastColors, lightColors, type RawColors} from '@duro-app/tokens/raw'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {lightTheme, lightShadows} from '@duro-app/tokens/themes/light.css'
import {highContrastTheme, highContrastShadows} from '@duro-app/tokens/themes/high-contrast.css'
import {createHostRegistry, type HostRegistry} from '../../shared/portal/hostRegistry'
import {HostRegistryContext, PortalHost} from '../../shared/portal/PortalHost'
import {
  ResolvedColorsContext,
  ThemeScopeContext,
  type ThemeScope,
} from '../../shared/portal/themeScope'
import {
  mergeOverrides,
  OverridesContext,
  type ColorOverrides,
  type FontOverrides,
  type RadiusOverrides,
} from './overrides'
import {nativeThemeInputs} from './nativeInputs'

export type ThemeName = 'dark' | 'light' | 'high-contrast'
export {firstFamily, nativeThemeInputs, type NativeThemeInputs} from './nativeInputs'
export type {ColorOverrides, FontOverrides, RadiusOverrides}

interface ThemeProviderProps {
  theme?: ThemeName
  /**
   * Colours that replace the theme's own, by token key (`{accent: '#ff5a1f'}`).
   * They update in place, without a re-mount. A nested provider on the same
   * theme keeps these and lays its own over them.
   */
  overrides?: ColorOverrides
  /**
   * Font stacks that replace the theme's own (`{fontFamilyMono: "'JetBrains Mono', monospace"}`).
   * Not tied to a theme: a nested provider always inherits them. On native only
   * the first family applies.
   */
  fonts?: FontOverrides
  /**
   * Radii that replace the theme's own, as `0` or a px/rem length
   * (`{md: '6px'}`). `px6` and `full` cannot be overridden.
   */
  radii?: RadiusOverrides
  children: ReactNode
}

// On the web, `dark` is the base vars and needs no theme. On native,
// createTheme is a runtime call, so dark gets an explicit one: a dark
// provider nested in a light one then draws dark, and its resolved colours
// (below) agree with what RSD draws.
const darkTheme = css.createTheme(colors, darkColors)

const themeMap: Record<ThemeName, readonly unknown[]> = {
  dark: [darkTheme],
  light: [lightTheme, lightShadows],
  'high-contrast': [highContrastTheme, highContrastShadows],
}

const palettes: Record<ThemeName, RawColors> = {
  dark: darkColors,
  light: lightColors,
  'high-contrast': highContrastColors,
}

const styles = css.create({
  // No `display:contents` on RN. RSD uses web flex semantics on native, so
  // declare flex + column explicitly.
  root: {
    display: 'flex',
    flexDirection: 'column',
    color: colors.text,
  },
  // The app canvas: the web paints it on body from vars.css; native has no
  // body, so the outermost provider paints it and fills its host (height,
  // not flex: the host is an RN view, which RSD does not know is flex).
  canvas: {
    backgroundColor: colors.bg,
    height: '100%',
  },
})

type DivStyle = Parameters<typeof html.div>[0]['style']

// Parity with the web export — there's no portal mount on native, so this is
// always null.
const PortalMountContext = createContext<HTMLElement | null>(null)

export function usePortalMount(): HTMLElement | null {
  return useContext(PortalMountContext)
}

/**
 * The nearest ThemeProvider's colours as real colour strings, for native hosts
 * that cannot read a `var(--…)` reference: an Icon renderer, an animated
 * backdrop, a Pressable. RSD styles keep using the `colors` tokens.
 */
export function useResolvedColors(): Record<ColorToken, string> {
  return useContext(ResolvedColorsContext)
}

export function ThemeProvider({
  theme = 'dark',
  overrides,
  fonts,
  radii: radiusOverrides,
  children,
}: ThemeProviderProps) {
  const outerRegistry = useContext(HostRegistryContext)
  const outerScope = useContext(ThemeScopeContext)
  // The outermost provider owns the registry and draws the root host.
  const [ownRegistry] = useState<HostRegistry | null>(() =>
    outerRegistry ? null : createHostRegistry(),
  )
  const registry = outerRegistry ?? ownRegistry
  const outerOverrides = useContext(OverridesContext)
  const effective = useMemo(
    () => mergeOverrides(outerOverrides, theme, overrides, fonts, radiusOverrides),
    [outerOverrides, theme, overrides, fonts, radiusOverrides],
  )
  const inputs = nativeThemeInputs(effective)
  // A runtime theme on native, applied after the base one so RSD styles
  // cascade it; rebuilt only when the colours change.
  const overrideKey = JSON.stringify(inputs.colors)
  const typographyKey = JSON.stringify(inputs.typography)
  const radiiKey = JSON.stringify(inputs.radii)
  const themeStyles = useMemo(() => {
    const layered = [...themeMap[theme]]
    if (overrideKey !== '{}') {
      layered.push(css.createTheme(colors, JSON.parse(overrideKey) as ColorOverrides))
    }
    if (typographyKey !== '{}') {
      layered.push(css.createTheme(typography, JSON.parse(typographyKey) as FontOverrides))
    }
    if (radiiKey !== '{}') {
      layered.push(css.createTheme(radii, JSON.parse(radiiKey) as RadiusOverrides))
    }
    return layered
  }, [theme, overrideKey, typographyKey, radiiKey])
  const resolved = useMemo(
    () => ({...palettes[theme], ...(JSON.parse(overrideKey) as ColorOverrides)}),
    [theme, overrideKey],
  )
  const scope = useMemo<ThemeScope>(
    () => ({styles: [...outerScope.styles, ...themeStyles]}),
    [outerScope, themeStyles],
  )

  return (
    <HostRegistryContext.Provider value={registry}>
      <ThemeScopeContext.Provider value={scope}>
        <ResolvedColorsContext.Provider value={resolved}>
          <OverridesContext.Provider value={effective}>
            <html.div
              style={[...themeStyles, styles.root, ownRegistry && styles.canvas] as DivStyle}
            >
              {children}
              {ownRegistry ? <PortalHost placement="base" /> : null}
            </html.div>
          </OverridesContext.Provider>
        </ResolvedColorsContext.Provider>
      </ThemeScopeContext.Provider>
    </HostRegistryContext.Provider>
  )
}
