import {type ReactNode, createContext, useContext, useRef} from 'react'
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
  root: {
    display: 'contents',
    color: colors.text,
  },
})

// react-strict-dom's style prop rejects Theme<VarGroup<{named keys}>> because the
// concrete VarGroup lacks the generic index signature. This is a known typing gap.
type DivStyle = Parameters<typeof html.div>[0]['style']

/** Context providing a portal target inside the themed tree. */
const OverlayContainerContext = createContext<React.RefObject<HTMLDivElement | null> | null>(null)

/** Returns the overlay container element for portals (inside the ThemeProvider). */
export function useOverlayContainer(): HTMLElement {
  const ref = useContext(OverlayContainerContext)
  return ref?.current ?? (typeof document !== 'undefined' ? document.body : null!)
}

export function ThemeProvider({theme = 'dark', children}: ThemeProviderProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const overrides = themeMap[theme]
  const themeStyles = [overrides?.[0], overrides?.[1], styles.root] as DivStyle

  return (
    <html.div style={themeStyles}>
      <OverlayContainerContext.Provider value={overlayRef}>
        {children}
        <html.div ref={overlayRef} />
      </OverlayContainerContext.Provider>
    </html.div>
  )
}
