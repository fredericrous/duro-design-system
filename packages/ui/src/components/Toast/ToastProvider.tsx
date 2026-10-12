import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {createPortal} from 'react-dom'
import {html} from 'react-strict-dom'
import {Icon, type IconName} from '../Icon'
import {usePortalMount} from '../ThemeProvider/ThemeProvider'
import {styles} from './styles.css'
import {
  createToastStore,
  type ToastContextValue,
  type ToastEntry,
  type ToastStore,
  type ToastVariant,
} from './store'

export type {ToastAction, ToastContextValue, ToastOptions, ToastVariant} from './store'

const variantIcon: Record<ToastVariant, IconName> = {
  success: 'check-circle-filled',
  error: 'x-circle-filled',
  info: 'info-circle-filled',
  warning: 'alert-triangle-filled',
}
const variantIconStyle = {
  success: styles.iconSuccess,
  error: styles.iconError,
  info: styles.iconInfo,
  warning: styles.iconWarning,
} as const

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>')
  return ctx
}

function ToastItem({
  entry,
  store,
  onDismiss,
  dismissLabel,
}: {
  entry: ToastEntry
  store: ToastStore
  onDismiss: (id: string) => void
  dismissLabel: string
}) {
  const {id, variant, message, action, duration} = entry
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const paused = hovered || focused
  // The store keeps what is left of the countdown; a pause keeps it, a resume
  // restarts the timer with what was left (WCAG 2.2.1: the reader controls the timing).
  useEffect(() => {
    if (duration <= 0 || paused) return
    const started = Date.now()
    const timer = setTimeout(() => onDismiss(id), Math.max(store.remaining(id), 0))
    return () => {
      clearTimeout(timer)
      store.spend(id, Date.now() - started)
    }
  }, [id, duration, paused, onDismiss, store])

  return (
    <html.div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      style={[styles.toast, styles[variant]]}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e: {currentTarget: HTMLElement; relatedTarget: EventTarget | null}) => {
        // Focus moving between the toast's own buttons keeps it paused.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      <html.div style={[styles.iconWrap, variantIconStyle[variant]]}>
        <Icon name={variantIcon[variant]} size="md" />
      </html.div>
      <html.div style={styles.content}>
        <html.div style={styles.message}>{message}</html.div>
        {action ? (
          <html.button
            type="button"
            style={styles.action}
            onClick={() => {
              action.onClick()
              onDismiss(id)
            }}
          >
            {action.label}
          </html.button>
        ) : null}
      </html.div>
      <html.button
        type="button"
        aria-label={dismissLabel}
        style={styles.closeBtn}
        onClick={() => onDismiss(id)}
      >
        <Icon name="x-circle" size="sm" />
      </html.button>
    </html.div>
  )
}

export interface ToastProviderProps {
  /** Accessible name of each toast's close button, e.g. from the app's
   *  message catalog. */
  dismissLabel?: string
  children: ReactNode
}

export function ToastProvider({dismissLabel = 'Dismiss', children}: ToastProviderProps) {
  const storeRef = useRef<ToastStore>(null)
  if (storeRef.current === null) {
    storeRef.current = createToastStore()
  }
  const store = storeRef.current

  const entries = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const mount = usePortalMount()

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: (opts) => store.add(opts),
      dismiss: (id) => store.remove(id),
    }),
    [store],
  )

  const dismiss = useCallback((id: string) => store.remove(id), [store])

  const region = (
    <html.div role="region" aria-label="Notifications" style={styles.region}>
      {entries.map((entry) => (
        <ToastItem
          key={entry.id}
          entry={entry}
          store={store}
          onDismiss={dismiss}
          dismissLabel={dismissLabel}
        />
      ))}
    </html.div>
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mount ? createPortal(region, mount) : region}
    </ToastContext.Provider>
  )
}
