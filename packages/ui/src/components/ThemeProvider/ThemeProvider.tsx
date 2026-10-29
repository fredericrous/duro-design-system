import {createContext, type ReactNode, useContext, useEffect, useId, useMemo, useState} from 'react'
import {css, html} from 'react-strict-dom'
import {validateTokens, type ThemableGroup} from '@duro-app/tokens/theme'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {lightTheme, lightShadows} from '@duro-app/tokens/themes/light.css'
import {highContrastTheme, highContrastShadows} from '@duro-app/tokens/themes/high-contrast.css'
import {layers} from '@duro-app/tokens/tokens/layers.css'
import {
  mergeOverrides,
  OverridesContext,
  ownTokens,
  type ColorOverrides,
  type ThemeTokens,
} from './overrides'
import {overrideRule, variableFromReference} from './overrideRule'
import {TOKEN_GROUPS} from './tokenGroups'
import {warnDropped} from './warnDropped'

export type ThemeName = 'dark' | 'light' | 'high-contrast'
export type {ColorOverrides, ThemeTokens}

interface ThemeProviderProps {
  theme?: ThemeName
  /**
   * Colours that replace the theme's own, by token key (`{accent: '#ff5a1f'}`).
   * They update in place, without a re-mount. A nested provider on the same
   * theme keeps these and lays its own over them.
   */
  overrides?: ColorOverrides
  /**
   * Token values that replace the theme's own, keyed by group: `colors`,
   * `shadows`, `typography`, `typeScale`, `spacing`, `layoutSpacing`, `radii`,
   * `sizes`, `borders`, `duration`, `easing` and `effects`, each a partial
   * record of that group's keys (`{radii: {md: '6px'}}`). An app passes its
   * theme file as is. `layers`, `breakpoints`, `microSpacing`, `radii.px6` and
   * `radii.full` are refused, and `sizes.touchTarget` (44px),
   * `borders.focusRing` (2px) and `borders.focusOffset` keep their floors.
   * Invalid entries are dropped with one development warning. `colors` and
   * `shadows` reset when a nested provider changes theme; every other group
   * inherits. The app loads its own fonts; on native only the first family
   * applies (a face the app has loaded, at weights 400, 500, 600 and 700).
   * Keep `radii` ordered `xs <= sm <= md <= lg`. Native is unverified on a
   * device.
   */
  tokens?: ThemeTokens
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
function variableOf(group: ThemableGroup, key: string): string | null {
  return variableFromReference((TOKEN_GROUPS[group] as Record<string, unknown>)[key])
}

export function ThemeProvider({theme = 'dark', overrides, tokens, children}: ThemeProviderProps) {
  const themeStyles = themeMap[theme]
  const style = [themeStyles?.[0], themeStyles?.[1], styles.root] as DivStyle
  const [mount, setMount] = useState<HTMLElement | null>(null)
  const scope = useId()
  const outer = useContext(OverridesContext)
  const checked = useMemo(() => validateTokens(ownTokens(overrides, tokens)), [overrides, tokens])
  useEffect(() => warnDropped(checked.dropped), [checked])
  const effective = useMemo(
    () => mergeOverrides(outer, theme, checked.kept),
    [outer, theme, checked],
  )
  const rule = useMemo(() => overrideRule(scope, effective.tokens, variableOf), [scope, effective])

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
