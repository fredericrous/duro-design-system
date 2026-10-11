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
import {lightTheme, lightShadows} from '@duro-app/tokens/themes/light.css'
import {highContrastTheme, highContrastShadows} from '@duro-app/tokens/themes/high-contrast.css'
import {createHostRegistry, type HostRegistry} from '../../shared/portal/hostRegistry'
import {HostRegistryContext, PortalHost} from '../../shared/portal/PortalHost'
import {
  ResolvedColorsContext,
  ThemeScopeContext,
  type ThemeScope,
} from '../../shared/portal/themeScope'

export type ThemeName = 'dark' | 'light' | 'high-contrast'

interface ThemeProviderProps {
  theme?: ThemeName
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
  // declare flex + column explicitly; flex:1 lets a root provider fill.
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    color: colors.text,
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

export function ThemeProvider({theme = 'dark', children}: ThemeProviderProps) {
  const outerRegistry = useContext(HostRegistryContext)
  const outerScope = useContext(ThemeScopeContext)
  // The outermost provider owns the registry and draws the root host.
  const [ownRegistry] = useState<HostRegistry | null>(() =>
    outerRegistry ? null : createHostRegistry(),
  )
  const registry = outerRegistry ?? ownRegistry
  const themeStyles = themeMap[theme]
  const scope = useMemo<ThemeScope>(
    () => ({styles: [...outerScope.styles, ...themeStyles]}),
    [outerScope, themeStyles],
  )

  return (
    <HostRegistryContext.Provider value={registry}>
      <ThemeScopeContext.Provider value={scope}>
        <ResolvedColorsContext.Provider value={palettes[theme]}>
          <html.div style={[...themeStyles, styles.root] as DivStyle}>
            {children}
            {ownRegistry ? <PortalHost placement="base" /> : null}
          </html.div>
        </ResolvedColorsContext.Provider>
      </ThemeScopeContext.Provider>
    </HostRegistryContext.Provider>
  )
}
