import {useState, useCallback, useRef, useId, useEffect} from 'react'
import type {MenuContextValue} from './MenuContext'

export function useMenuRoot() {
  const [open, setOpen] = useState(false)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const itemsRef = useRef(new Map<string, HTMLElement>())
  const orderRef = useRef<string[]>([])
  const needsInitialHighlightRef = useRef(false)

  const close = useCallback(() => {
    setOpen(false)
    setHighlightedId(null)
    needsInitialHighlightRef.current = false
    triggerRef.current?.focus()
  }, [])

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        needsInitialHighlightRef.current = true
      } else {
        setHighlightedId(null)
        needsInitialHighlightRef.current = false
      }
      return !prev
    })
  }, [])

  // Highlight the first item after items register on open.
  // Child effects (item registration) run before this parent effect,
  // so orderRef is populated by the time this runs.
  useEffect(() => {
    if (open && needsInitialHighlightRef.current) {
      needsInitialHighlightRef.current = false
      const order = orderRef.current
      if (order.length > 0) {
        setHighlightedId(order[0])
      }
    }
  }, [open])

  const registerItem = useCallback((id: string, element: HTMLElement) => {
    itemsRef.current.set(id, element)
    const map = itemsRef.current
    const ids = [...map.keys()]
    ids.sort((a, b) => {
      const elA = map.get(a)
      const elB = map.get(b)
      if (!elA || !elB) return 0
      return elA.compareDocumentPosition(elB) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    })
    orderRef.current = ids
    return () => {
      itemsRef.current.delete(id)
      orderRef.current = orderRef.current.filter((i) => i !== id)
    }
  }, [])

  // Native keydown for full KeyboardEvent access (preventDefault)
  useEffect(() => {
    const root = rootRef.current
    if (!root || !open) return

    function handleKeyDown(e: KeyboardEvent) {
      const order = orderRef.current
      if (order.length === 0) return

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          setHighlightedId((prev) => {
            const idx = prev ? order.indexOf(prev) : -1
            return order[(idx + 1) % order.length]
          })
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          setHighlightedId((prev) => {
            const idx = prev ? order.indexOf(prev) : 0
            return order[(idx - 1 + order.length) % order.length]
          })
          break
        }
        case 'Home': {
          e.preventDefault()
          setHighlightedId(order[0])
          break
        }
        case 'End': {
          e.preventDefault()
          setHighlightedId(order[order.length - 1])
          break
        }
        case 'Enter':
        case ' ': {
          e.preventDefault()
          const items = itemsRef.current
          setHighlightedId((prev) => {
            if (prev) {
              const el = items.get(prev)
              el?.click()
            }
            return prev
          })
          break
        }
        case 'Escape':
        case 'Tab': {
          close()
          break
        }
      }
    }

    root.addEventListener('keydown', handleKeyDown)
    return () => root.removeEventListener('keydown', handleKeyDown)
  }, [open, close])

  const ctx: MenuContextValue = {
    open,
    toggle,
    close,
    menuId,
    highlightedId,
    setHighlightedId,
    registerItem,
    triggerRef,
  }

  return {ctx, rootRef}
}
