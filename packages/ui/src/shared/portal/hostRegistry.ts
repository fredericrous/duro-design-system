import type {ReactNode} from 'react'

/** One passive surface (a toast region) waiting for a host to draw it. */
export interface PortalEntry {
  readonly key: string
  /** Numeric layer from `LAYERS` in `@duro-app/tokens/keys`; higher draws on top. */
  readonly layer: number
  readonly node: ReactNode
  /**
   * Which host draws it. `top` (the default): the last host presented, above an open Modal.
   * `base`: the app root host, below every Modal, so a Dialog opened later covers the entry
   * and the entry stays mounted (a non-modal pane).
   * holds-until: Drawer.native.tsx draws a non-modal pane through it (Pane's native phase).
   */
  readonly host?: 'base' | 'top'
}

export interface HostRegistrySnapshot {
  /** The host that draws the `top` entries: the last one presented, else the root. */
  readonly topHost: string | undefined
  /** The host that draws the `base` entries: the app root, whatever is presented above it. */
  readonly baseHost: string | undefined
  /** Entries ordered by layer, lowest first (equal layers keep insertion order). */
  readonly entries: readonly PortalEntry[]
}

/**
 * The hosts that passive surfaces draw into, on native: the app root, each
 * open Duro Modal and each `PortalHost` a consumer mounts in a natively
 * presented route. An entry renders in the top host unless it asks for the
 * base host, so a toast raised under an open Dialog draws above it and a
 * non-modal pane stays below it.
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

/**
 * The entries one host draws, or null when it draws none. The top host draws the `top` entries and
 * the base host the `base` ones; the root is both while nothing is presented above it, so it draws
 * every entry in layer order. Entries keep their keys, so a base entry stays mounted in the root
 * when a Modal opens and the top entries move to the Modal's host.
 */
export function entriesForHost(
  snapshot: HostRegistrySnapshot,
  id: string,
): readonly PortalEntry[] | null {
  const drawsTop = snapshot.topHost === id
  const drawsBase = snapshot.baseHost === id
  if (!drawsTop && !drawsBase) return null
  return snapshot.entries.filter((entry) => (entry.host === 'base' ? drawsBase : drawsTop))
}

export function createHostRegistry(): HostRegistry {
  let hosts: readonly string[] = []
  let entries: readonly PortalEntry[] = []
  let base: string | undefined
  let snapshot: HostRegistrySnapshot = {topHost: undefined, baseHost: undefined, entries}
  const listeners = new Set<() => void>()

  const publish = () => {
    snapshot = {topHost: hosts[hosts.length - 1], baseHost: base, entries}
    for (const listener of listeners) listener()
  }

  return {
    addHost(id, placement) {
      hosts = placement === 'base' ? [id, ...hosts] : [...hosts, id]
      if (placement === 'base') base = id
      publish()
      return () => {
        hosts = hosts.filter((host) => host !== id)
        if (base === id) base = undefined
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
