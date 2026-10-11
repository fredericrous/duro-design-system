import type {ReactNode} from 'react'

/** One passive surface (a toast region) waiting for a host to draw it. */
export interface PortalEntry {
  readonly key: string
  /** Numeric layer from `LAYERS` in `@duro-app/tokens/keys`; higher draws on top. */
  readonly layer: number
  readonly node: ReactNode
}

export interface HostRegistrySnapshot {
  /** The host that draws every entry: the last one presented, else the root. */
  readonly topHost: string | undefined
  /** Entries ordered by layer, lowest first (equal layers keep insertion order). */
  readonly entries: readonly PortalEntry[]
}

/**
 * The hosts that passive surfaces draw into, on native: the app root, each
 * open Duro Modal and each `PortalHost` a consumer mounts in a natively
 * presented route. Entries render in the top host only, so a toast raised
 * under an open Dialog draws above it.
 *
 * A plain store (subscribe / getSnapshot) for `useSyncExternalStore`; it holds
 * no React state and imports nothing from React Native.
 */
export interface HostRegistry {
  /** Adds a host. A `base` host (the app root) always sits below the others. */
  addHost(id: string, placement: 'base' | 'presented'): () => void
  setEntry(entry: PortalEntry): void
  removeEntry(key: string): void
  getSnapshot(): HostRegistrySnapshot
  subscribe(listener: () => void): () => void
}

export function createHostRegistry(): HostRegistry {
  let hosts: readonly string[] = []
  let entries: readonly PortalEntry[] = []
  let snapshot: HostRegistrySnapshot = {topHost: undefined, entries}
  const listeners = new Set<() => void>()

  const publish = () => {
    snapshot = {topHost: hosts[hosts.length - 1], entries}
    for (const listener of listeners) listener()
  }

  return {
    addHost(id, placement) {
      hosts = placement === 'base' ? [id, ...hosts] : [...hosts, id]
      publish()
      return () => {
        hosts = hosts.filter((host) => host !== id)
        publish()
      }
    },
    setEntry(entry) {
      const others = entries.filter((existing) => existing.key !== entry.key)
      const at = others.findIndex((existing) => existing.layer > entry.layer)
      entries =
        at === -1 ? [...others, entry] : [...others.slice(0, at), entry, ...others.slice(at)]
      publish()
    },
    removeEntry(key) {
      if (!entries.some((entry) => entry.key === key)) return
      entries = entries.filter((entry) => entry.key !== key)
      publish()
    },
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
