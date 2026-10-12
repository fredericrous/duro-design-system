import type {ReactNode} from 'react'

/** The toast queue both platforms' ToastProvider render (plan N0, Slice B). */

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  /** Visual + semantic tone. Errors announce assertively; errors and
   *  warnings linger longer. */
  variant?: ToastVariant
  message: ReactNode
  /** Optional single action, e.g. Undo. Runs, then dismisses the toast. */
  action?: ToastAction
  /** Auto-dismiss delay in ms. `0` (or negative) keeps it until dismissed.
   *  The countdown pauses while the toast is hovered or holds focus. */
  duration?: number
}

export interface ToastContextValue {
  /** Show a toast; returns its id so it can be dismissed programmatically. */
  toast: (opts: ToastOptions) => string
  dismiss: (id: string) => void
}

export interface ToastEntry {
  id: string
  variant: ToastVariant
  message: ReactNode
  action?: ToastAction
  duration: number
}

export interface ToastStore {
  subscribe: (cb: () => void) => () => void
  getSnapshot: () => readonly ToastEntry[]
  add: (opts: ToastOptions) => string
  remove: (id: string) => void
  /**
   * What is left of a toast's countdown, in ms. Kept here, not in the toast's
   * component: on native a toast re-renders into another host when a Dialog
   * above it closes, and its countdown carries on.
   */
  remaining: (id: string) => number
  /** Count `ms` of shown time against a toast's countdown. */
  spend: (id: string, ms: number) => void
}

export const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 5000,
  info: 5000,
  error: 8000,
  warning: 8000,
}

export function createToastStore(): ToastStore {
  let entries: ToastEntry[] = []
  let seq = 0
  const left = new Map<string, number>()
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
      left.set(id, duration)
      notify()
      return id
    },
    remove: (id) => {
      left.delete(id)
      const next = entries.filter((e) => e.id !== id)
      if (next.length !== entries.length) {
        entries = next
        notify()
      }
    },
    remaining: (id) => left.get(id) ?? 0,
    spend: (id, ms) => {
      const current = left.get(id)
      if (current !== undefined) left.set(id, current - ms)
    },
  }
}
