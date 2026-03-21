import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

interface ActionBarEntry {
  id: string
  render: () => ReactNode
}

interface ActionBarStore {
  subscribe: (cb: () => void) => () => void
  getSnapshot: () => readonly ActionBarEntry[]
  push: (id: string, render: () => ReactNode) => void
  update: (id: string, render: () => ReactNode) => void
  remove: (id: string) => void
}

function createActionBarStore(): ActionBarStore {
  let entries: ActionBarEntry[] = []
  const listeners = new Set<() => void>()

  const notify = () => listeners.forEach((l) => l())

  return {
    subscribe: (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    getSnapshot: () => entries,
    push: (id, render) => {
      entries = [...entries, {id, render}]
      notify()
    },
    update: (id, render) => {
      entries = entries.map((e) => (e.id === id ? {id, render} : e))
      notify()
    },
    remove: (id) => {
      entries = entries.filter((e) => e.id !== id)
      notify()
    },
  }
}

const ActionBarContext = createContext<ActionBarStore | null>(null)

export function ActionBarProvider({children}: {children: ReactNode}) {
  const storeRef = useRef<ActionBarStore>(null)
  if (storeRef.current === null) {
    storeRef.current = createActionBarStore()
  }
  const store = storeRef.current

  const entries = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const topEntry = entries.length > 0 ? entries[entries.length - 1] : null

  return (
    <ActionBarContext.Provider value={store}>
      {children}
      {topEntry?.render()}
    </ActionBarContext.Provider>
  )
}

export function useActionBarStack() {
  const store = useContext(ActionBarContext)
  const id = useId()

  const register = useCallback(
    (render: () => ReactNode) => {
      if (!store) return
      const entries = store.getSnapshot()
      if (entries.some((e) => e.id === id)) {
        store.update(id, render)
      } else {
        store.push(id, render)
      }
    },
    [store, id],
  )

  const unregister = useCallback(() => {
    store?.remove(id)
  }, [store, id])

  const isTop = useMemo(() => {
    if (!store) return false
    const entries = store.getSnapshot()
    return entries.length > 0 && entries[entries.length - 1].id === id
  }, [store, id])

  return {id, register, unregister, managed: store !== null, isTop}
}
