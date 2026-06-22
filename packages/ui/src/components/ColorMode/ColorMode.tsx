import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {html} from 'react-strict-dom'
import {isNative} from '../../platform'
import {Icon, type IconName} from '../Icon/Icon'
import {ThemeProvider, type ThemeName} from '../ThemeProvider/ThemeProvider'
import {styles} from './styles.css'

/**
 * The user's *preference*. `'system'` follows the OS `prefers-color-scheme`;
 * the others pin a concrete {@link ThemeName}. Resolves to a ThemeName via
 * {@link useColorMode}().theme.
 */
export type ColorModePreference = 'system' | ThemeName

const PREFERENCES: readonly ColorModePreference[] = ['system', 'light', 'dark', 'high-contrast']

const ICON: Record<ColorModePreference, IconName> = {
  system: 'monitor',
  light: 'sun',
  dark: 'moon',
  'high-contrast': 'contrast',
}

const LABEL: Record<ColorModePreference, string> = {
  system: 'system',
  light: 'light',
  dark: 'dark',
  'high-contrast': 'high contrast',
}

interface ColorModeContextValue {
  /** The user's chosen preference. */
  preference: ColorModePreference
  /** The concrete theme the preference resolves to (system → OS scheme). */
  theme: ThemeName
  /** Set the preference explicitly. */
  setPreference: (preference: ColorModePreference) => void
  /** Advance to the next preference in {@link modes} (wraps). */
  cycle: () => void
  /** The cycle order used by `cycle()` and the toggle. */
  modes: readonly ColorModePreference[]
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null)

/**
 * Read the active color mode. Throws if used outside a {@link ColorModeProvider}.
 */
export function useColorMode(): ColorModeContextValue {
  const ctx = useContext(ColorModeContext)
  if (!ctx) {
    throw new Error('useColorMode must be used within a <ColorModeProvider>')
  }
  return ctx
}

const canUseDom =
  !isNative && typeof window !== 'undefined' && typeof window.matchMedia === 'function'

function isPreference(value: unknown): value is ColorModePreference {
  return typeof value === 'string' && (PREFERENCES as readonly string[]).includes(value)
}

function readStored(key: string | null): ColorModePreference | null {
  if (!key || isNative || typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return isPreference(raw) ? raw : null
  } catch {
    // Private mode / blocked storage — degrade to no persistence.
    return null
  }
}

function writeStored(key: string | null, value: ColorModePreference): void {
  if (!key || isNative || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

interface ColorModeProviderProps {
  children: ReactNode
  /** Initial preference (uncontrolled). Default `'system'`. For SSR with no
   * hydration flash, pass the value you persisted server-side (e.g. a cookie). */
  defaultPreference?: ColorModePreference
  /** Controlled preference — when set, the provider does not own the state. */
  preference?: ColorModePreference
  /** Fired whenever the preference changes (controlled or not). */
  onPreferenceChange?: (preference: ColorModePreference) => void
  /** Cycle order for `cycle()` / `<ColorModeToggle>`. Default `['light', 'dark']`. */
  modes?: readonly ColorModePreference[]
  /** localStorage key for persistence; `null` disables it. Default `'duro-color-mode'`. */
  storageKey?: string | null
  /** Wrap children in the DS `ThemeProvider` with the resolved theme. Default `true`.
   * Set `false` to drive your own ThemeProvider from `useColorMode().theme`. */
  applyTheme?: boolean
}

/**
 * Owns color-mode state, resolves `'system'` against the OS scheme, persists the
 * choice, and (by default) applies the resolved theme via `ThemeProvider`.
 * Pair with {@link ColorModeToggle} or read state via {@link useColorMode}.
 */
export function ColorModeProvider({
  children,
  defaultPreference = 'system',
  preference: controlled,
  onPreferenceChange,
  modes = ['light', 'dark'],
  storageKey = 'duro-color-mode',
  applyTheme = true,
}: ColorModeProviderProps) {
  const [internal, setInternal] = useState<ColorModePreference>(controlled ?? defaultPreference)
  const preference = controlled ?? internal

  // Hydrate from storage AFTER mount (not in the initializer) so the first
  // client render matches the server and React doesn't warn about a mismatch.
  useEffect(() => {
    if (controlled !== undefined) return
    const stored = readStored(storageKey)
    if (stored) setInternal(stored)
    // Only on mount / when the key changes.
  }, [controlled, storageKey])

  const setPreference = useCallback(
    (next: ColorModePreference) => {
      if (controlled === undefined) setInternal(next)
      writeStored(storageKey, next)
      onPreferenceChange?.(next)
    },
    [controlled, storageKey, onPreferenceChange],
  )

  // Track the OS scheme so `'system'` stays live. The initial value MUST be the
  // SSR-stable default ('dark', what the server renders without a DOM) so the
  // first client render matches the server — reading matchMedia in the
  // initializer would diverge (server 'dark' vs client's real scheme) and trip
  // a hydration mismatch. The effect reconciles to the real scheme after mount.
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark')
  useEffect(() => {
    if (!canUseDom) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemTheme(mq.matches ? 'dark' : 'light')
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const theme: ThemeName = preference === 'system' ? systemTheme : preference

  const cycle = useCallback(() => {
    const i = modes.indexOf(preference)
    const next = modes[(i + 1) % modes.length] ?? modes[0]
    if (next) setPreference(next)
  }, [modes, preference, setPreference])

  const value = useMemo<ColorModeContextValue>(
    () => ({preference, theme, setPreference, cycle, modes}),
    [preference, theme, setPreference, cycle, modes],
  )

  return (
    <ColorModeContext.Provider value={value}>
      {applyTheme ? <ThemeProvider theme={theme}>{children}</ThemeProvider> : children}
    </ColorModeContext.Provider>
  )
}

interface ColorModeToggleProps {
  /** Icon size in px. Default `20`. */
  size?: number
  /** Override the announced label (otherwise auto-generated from current/next). */
  'aria-label'?: string
}

/**
 * A compact icon button that cycles the color-mode preference through the
 * provider's `modes`. The glyph reflects the current preference
 * (sun/moon/monitor/contrast). Must be inside a {@link ColorModeProvider}.
 */
export function ColorModeToggle({size = 20, 'aria-label': ariaLabel}: ColorModeToggleProps) {
  const {preference, cycle, modes} = useColorMode()
  const i = modes.indexOf(preference)
  const next = modes[(i + 1) % modes.length] ?? modes[0] ?? preference
  const label = ariaLabel ?? `Color mode: ${LABEL[preference]}. Switch to ${LABEL[next]}.`

  return (
    <html.button type="button" aria-label={label} onClick={cycle} style={styles.button}>
      <Icon name={ICON[preference]} size={size} />
    </html.button>
  )
}
