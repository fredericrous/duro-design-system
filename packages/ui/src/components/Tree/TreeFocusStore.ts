import {useSyncExternalStore} from 'react'

/** What a row reads of the tree's focus: nothing, the tab stop, or the tab stop with the ring. */
export type RowFocus = 'none' | 'tabStop' | 'ringed'

/**
 * The tree's focus, outside React state: the item holding the roving tab stop,
 * whether its ring shows (keyboard focus), and a focus request an off-screen
 * row waits on. A row reads only "am I the tab stop / ringed" through
 * `useTreeRowFocus`, so a focus move re-renders the row that lost it and the
 * row that gained it, not the tree.
 */
export interface TreeFocusStore {
  getValue: () => string | null
  getPending: () => string | null
  /** moves the tab stop */
  setValue: (value: string | null) => void
  setRing: (ring: boolean) => void
  /** moves the tab stop and asks the window to focus the row once it mounts */
  request: (value: string) => void
  clearPending: () => void
  subscribe: (listener: () => void) => () => void
  read: (value: string) => RowFocus
}

export function createTreeFocusStore(initial: string | null): TreeFocusStore {
  let value = initial
  let ring = false
  let pending: string | null = null
  const listeners = new Set<() => void>()
  const emit = () => {
    for (const listener of listeners) listener()
  }
  return {
    getValue: () => value,
    getPending: () => pending,
    setValue: (next) => {
      if (next === value) return
      value = next
      emit()
    },
    setRing: (next) => {
      if (next === ring) return
      ring = next
      emit()
    },
    request: (next) => {
      value = next
      pending = next
      emit()
    },
    clearPending: () => {
      if (pending === null) return
      pending = null
      emit()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    read: (own) => (own !== value ? 'none' : ring ? 'ringed' : 'tabStop'),
  }
}

export function useTreeRowFocus(store: TreeFocusStore, value: string): RowFocus {
  return useSyncExternalStore(store.subscribe, () => store.read(value))
}

export function useTreePendingFocus(store: TreeFocusStore): string | null {
  return useSyncExternalStore(store.subscribe, store.getPending)
}
