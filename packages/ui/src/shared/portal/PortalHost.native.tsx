import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useSyncExternalStore,
} from 'react'
import {StyleSheet, View} from 'react-native'
import {css, html} from 'react-strict-dom'
import type {HostRegistry} from './hostRegistry'
import {ResolvedColorsContext, ThemeScopeContext} from './themeScope'

/** The registry the outermost ThemeProvider owns; null outside every provider. */
export const HostRegistryContext = createContext<HostRegistry | null>(null)

function useHostRegistry(component: string): HostRegistry {
  const registry = useContext(HostRegistryContext)
  if (!registry) throw new Error(`${component} must be rendered inside a Duro ThemeProvider`)
  return registry
}

const styles = css.create({
  // An entry covers its host without taking touches the entry does not draw on.
  entry: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
})

type DivStyle = Parameters<typeof html.div>[0]['style']

interface PortalHostProps {
  /**
   * `base`: the app root, always below every other host (the ThemeProvider
   * draws it). `presented` (the default): a natively presented route, which
   * a consumer mounts in that route's layout so toasts draw above it.
   */
  placement?: 'base' | 'presented'
}

/**
 * Where passive overlays (toasts) draw on native. The ThemeProvider draws the
 * root host and each open Duro Modal draws its own; mount one inside a
 * natively presented route (`presentation: 'modal'`), or toasts raised there
 * draw behind it.
 */
export function PortalHost({placement = 'presented'}: PortalHostProps) {
  const registry = useHostRegistry('PortalHost')
  const id = useId()
  useLayoutEffect(() => registry.addHost(id, placement), [registry, id, placement])
  const {topHost, entries} = useSyncExternalStore(registry.subscribe, registry.getSnapshot)
  if (topHost !== id) return null
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {entries.map((entry) => (
        <View key={entry.key} style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {entry.node}
        </View>
      ))}
    </View>
  )
}

interface PortalProps {
  /** Numeric layer from `LAYERS` in `@duro-app/tokens/keys`. */
  layer: number
  children: ReactNode
}

/**
 * Draws its children in the top host, above the app and every open Duro
 * Modal. The children keep the source's theme and resolved colours; no other
 * context crosses, so pass data, not components that read the app's contexts.
 */
export function Portal({layer, children}: PortalProps) {
  const registry = useHostRegistry('Portal')
  const key = useId()
  const scope = useContext(ThemeScopeContext)
  const resolvedColors = useContext(ResolvedColorsContext)

  useLayoutEffect(() => {
    registry.setEntry({
      key,
      layer,
      node: (
        <ThemeScopeContext.Provider value={scope}>
          <ResolvedColorsContext.Provider value={resolvedColors}>
            <html.div style={[...scope.styles, styles.entry] as DivStyle}>{children}</html.div>
          </ResolvedColorsContext.Provider>
        </ThemeScopeContext.Provider>
      ),
    })
  })
  useEffect(() => () => registry.removeEntry(key), [registry, key])
  return null
}
