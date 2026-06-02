// Native (React Native / Expo) ThemeProvider — Metro resolves this over
// ThemeProvider.tsx via the platform extension. The web version uses
// `display:contents` + a fixed portal-mount, neither of which exists on RN, so
// this applies the theme StyleX styles to a plain flex-column container and
// drops the portal mount (native overlays don't portal to a fixed div).
import {createContext, type ReactNode, useContext} from 'react'
import {css, html} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {lightTheme, lightShadows} from '@duro-app/tokens/themes/light.css'
import {highContrastTheme, highContrastShadows} from '@duro-app/tokens/themes/high-contrast.css'

export type ThemeName = 'dark' | 'light' | 'high-contrast'

interface ThemeProviderProps {
  theme?: ThemeName
  children: ReactNode
}

const themeMap: Partial<Record<ThemeName, readonly [typeof lightTheme, typeof lightShadows]>> = {
  light: [lightTheme, lightShadows],
  'high-contrast': [highContrastTheme, highContrastShadows],
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
// always null. (The components that consume it aren't in the native barrel.)
const PortalMountContext = createContext<HTMLElement | null>(null)

export function usePortalMount(): HTMLElement | null {
  return useContext(PortalMountContext)
}

export function ThemeProvider({theme = 'dark', children}: ThemeProviderProps) {
  const overrides = themeMap[theme]
  const themeStyles = [overrides?.[0], overrides?.[1], styles.root] as DivStyle
  return <html.div style={themeStyles}>{children}</html.div>
}
