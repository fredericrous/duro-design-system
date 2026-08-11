import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {createPortal} from 'react-dom'
import {html} from 'react-strict-dom'
import {Icon, type IconName} from '../Icon'
import {usePortalMount} from '../ThemeProvider/ThemeProvider'
import {styles} from './styles.css'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  /** Visual + semantic tone. Errors announce assertively and linger longer. */
  variant?: ToastVariant
  message: ReactNode
  /** Optional single action, e.g. Undo. Runs, then dismisses the toast. */
  action?: ToastAction
  /** Auto-dismiss delay in ms. `0` (or negative) keeps it until dismissed. */
  duration?: number
}

export interface ToastContextValue {
  /** Show a toast; returns its id so it can be dismissed programmatically. */
  toast: (opts: ToastOptions) => string
  dismiss: (id: string) => void
}

interface ToastEntry {
  id: string
  variant: ToastVariant
  message: ReactNode
  action?: ToastAction
  duration: number
}

interface ToastStore {
  subscribe: (cb: () => void) => () => void
  getSnapshot: () => readonly ToastEntry[]
  add: (opts: ToastOptions) => string
  remove: (id: string) => void
}

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 5000,
  info: 5000,
  error: 8000,
}

function createToastStore(): ToastStore {
  let entries: ToastEntry[] = []
  let seq = 0
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((l) => l())

  return {
    subscribe: (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    getSnapshot: () => entries,
    add: (opts) => {
      const variant = opts.variant ?? 'info'
      const id = `toast-${++seq}`
      const duration = opts.duration ?? DEFAULT_DURATION[variant]
      entries = [...entries, {id, variant, message: opts.message, action: opts.action, duration}]
      notify()
      return id
    },
    remove: (id) => {
      const next = entries.filter((e) => e.id !== id)
      if (next.length !== entries.length) {
        entries = next
        notify()
      }
    },
  }
}

const variantIcon: Record<ToastVariant, IconName> = {
  success: 'check-circle-filled',
  error: 'x-circle-filled',
  info: 'info-circle-filled',
}
const variantIconStyle = {
  success: styles.iconSuccess,
  error: styles.iconError,
  info: styles.iconInfo,
} as const

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>')
  return ctx
}

function ToastItem({entry, onDismiss}: {entry: ToastEntry; onDismiss: (id: string) => void}) {
  const {id, variant, message, action, duration} = entry

  useEffect(() => {
    if (duration <= 0) return
    const timer = setTimeout(() => onDismiss(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onDismiss])

  return (
    <html.div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      style={[styles.toast, styles[variant]]}
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
        aria-label="Dismiss"
        style={styles.closeBtn}
        onClick={() => onDismiss(id)}
      >
        <Icon name="x-circle" size="sm" />
      </html.button>
    </html.div>
  )
}

export function ToastProvider({children}: {children: ReactNode}) {
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
        <ToastItem key={entry.id} entry={entry} onDismiss={dismiss} />
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
