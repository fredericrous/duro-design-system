import {createContext, type ReactNode, useContext, useId, useMemo, useState} from 'react'
import {css, html} from 'react-strict-dom'
import type {ColorToken, FontFamilyToken, RadiusToken} from '@duro-app/tokens/keys'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {lightTheme, lightShadows} from '@duro-app/tokens/themes/light.css'
import {highContrastTheme, highContrastShadows} from '@duro-app/tokens/themes/high-contrast.css'
import {layers} from '@duro-app/tokens/tokens/layers.css'
import {
  mergeOverrides,
  OverridesContext,
  type ColorOverrides,
  type FontOverrides,
  type RadiusOverrides,
} from './overrides'
import {overrideRule, variableFromReference} from './overrideRule'

export type ThemeName = 'dark' | 'light' | 'high-contrast'
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

const themeMap: Partial<Record<ThemeName, readonly [typeof lightTheme, typeof lightShadows]>> = {
  light: [lightTheme, lightShadows],
  'high-contrast': [highContrastTheme, highContrastShadows],
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
    // The stacking context the layers scale orders: Dialog, Drawer, the
    // popups and toasts all portal in here.
    zIndex: layers.portal,
  },
})

// react-strict-dom's style prop rejects Theme<VarGroup<{named keys}>> because the
// concrete VarGroup lacks the generic index signature. This is a known typing gap.
type DivStyle = Parameters<typeof html.div>[0]['style']

const PortalMountContext = createContext<HTMLElement | null>(null)

export function usePortalMount(): HTMLElement | null {
  return useContext(PortalMountContext)
}

/** `var(--bg-x1y2)` → `--bg-x1y2`: the compiled variable a token key names. */
function variableOf(key: ColorToken): string | null {
  return variableFromReference(colors[key])
}

function fontVariableOf(key: FontFamilyToken): string | null {
  return variableFromReference(typography[key])
}

function radiusVariableOf(key: RadiusToken): string | null {
  return variableFromReference(radii[key])
}

export function ThemeProvider({
  theme = 'dark',
  overrides,
  fonts,
  radii: radiusOverrides,
  children,
}: ThemeProviderProps) {
  const themeStyles = themeMap[theme]
  const style = [themeStyles?.[0], themeStyles?.[1], styles.root] as DivStyle
  const [mount, setMount] = useState<HTMLElement | null>(null)
  const scope = useId()
  const outer = useContext(OverridesContext)
  const effective = useMemo(
    () => mergeOverrides(outer, theme, overrides, fonts, radiusOverrides),
    [outer, theme, overrides, fonts, radiusOverrides],
  )
  const rule = useMemo(
    () =>
      overrideRule(scope, effective.colors, variableOf, {
        fonts: {values: effective.fonts, variableOf: fontVariableOf},
        radii: {values: effective.radii, variableOf: radiusVariableOf},
      }),
    [scope, effective],
  )

  return (
    <html.div data-theme={theme} data-duro-theme={rule ? scope : undefined} style={style}>
      {/* A plain, updating <style> (react-strict-dom has no html.style): no
          href or precedence, which would make React hoist it once and ignore
          later changes. */}
      {rule ? <style>{rule}</style> : null}
      <OverridesContext.Provider value={effective}>
        <PortalMountContext.Provider value={mount}>{children}</PortalMountContext.Provider>
      </OverridesContext.Provider>
      <html.div ref={setMount} data-portal-mount style={styles.portalMount} />
    </html.div>
  )
}
