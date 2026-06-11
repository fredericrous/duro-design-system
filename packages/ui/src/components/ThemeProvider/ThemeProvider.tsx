import {createContext, type ReactNode, useContext, useState} from 'react'
import {css, html} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {lightTheme, lightShadows} from '@duro-app/tokens/themes/light.css'
import {highContrastTheme, highContrastShadows} from '@duro-app/tokens/themes/high-contrast.css'
import {
  landscapeTheme,
  landscapeShadows,
  landscapeTypography,
} from '@duro-app/tokens/themes/landscape.css'

export type ThemeName = 'dark' | 'light' | 'high-contrast' | 'landscape'

interface ThemeProviderProps {
  theme?: ThemeName
  children: ReactNode
}

// A theme is a list of createTheme() overrides (colors + shadows, and
// optionally typography — e.g. landscape carries its editorial font stack).
// Loosely typed: each entry themes a DIFFERENT VarGroup (colors / shadows /
// typography), and the array is cast to the style prop's type at the use site.
const themeMap: Partial<Record<ThemeName, readonly unknown[]>> = {
  light: [lightTheme, lightShadows],
  'high-contrast': [highContrastTheme, highContrastShadows],
  landscape: [landscapeTheme, landscapeShadows, landscapeTypography],
}

const styles = css.create({
  root: {
    display: 'contents',
    color: colors.text,
  },
  // Sibling overlay where floating popups (Combobox, Menu, Tooltip) portal to.
  // Lives inside ThemeProvider so theme tokens cascade. Fixed + inset 0 so
  // popups can position freely with viewport coords; pointer-events: none lets
  // clicks fall through except where children re-enable them.
  portalMount: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    // Above Dialog (1001) so popups inside dialogs render on top.
    zIndex: 1100,
  },
})

// react-strict-dom's style prop rejects Theme<VarGroup<{named keys}>> because the
// concrete VarGroup lacks the generic index signature. This is a known typing gap.
type DivStyle = Parameters<typeof html.div>[0]['style']

const PortalMountContext = createContext<HTMLElement | null>(null)

export function usePortalMount(): HTMLElement | null {
  return useContext(PortalMountContext)
}

export function ThemeProvider({theme = 'dark', children}: ThemeProviderProps) {
  const overrides = themeMap[theme]
  const themeStyles = [...(overrides ?? []), styles.root] as DivStyle
  const [mount, setMount] = useState<HTMLElement | null>(null)

  return (
    <html.div data-theme={theme} style={themeStyles}>
      <PortalMountContext.Provider value={mount}>{children}</PortalMountContext.Provider>
      <html.div ref={setMount} data-portal-mount style={styles.portalMount} />
    </html.div>
  )
}
