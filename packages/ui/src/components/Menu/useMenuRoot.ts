import {useState, useCallback, useRef, useId, useEffect} from 'react'
import type {MenuContextValue} from './MenuContext'
import {isOutsidePress} from '../Popover/outside'

export interface MenuRootOptions {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * The menu-button pattern (WAI-ARIA APG): on open, focus moves to the
 * `role="menu"` popup, which carries `aria-activedescendant`; arrows move the
 * highlight; Escape closes and focus returns to the trigger. The keydown
 * handler sits on the popup itself, never on `document`, so keys typed
 * elsewhere (an editor) are never intercepted, and Escape stops there so an
 * enclosing Popover or Dialog stays open.
 */
export function useMenuRoot({open: openProp, defaultOpen = false, onOpenChange}: MenuRootOptions) {
  const [inner, setInner] = useState(defaultOpen)
  const controlled = openProp !== undefined
  const open = controlled ? openProp : inner
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const menuId = useId()
  const triggerId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const itemsRef = useRef(new Map<string, HTMLElement>())
  const orderRef = useRef<string[]>([])
  const openRef = useRef(open)
  openRef.current = open
  const onOpenChangeRef = useRef(onOpenChange)
  onOpenChangeRef.current = onOpenChange

  const setOpen = useCallback(
    (next: boolean) => {
      if (next === openRef.current) return
      if (!controlled) setInner(next)
      onOpenChangeRef.current?.(next)
    },
    [controlled],
  )

  const close = useCallback(
    ({restoreFocus = true}: {restoreFocus?: boolean} = {}) => {
      if (!openRef.current) return
      setOpen(false)
      setHighlightedId(null)
      if (restoreFocus) triggerRef.current?.focus()
    },
    [setOpen],
  )

  const toggle = useCallback(() => {
    if (openRef.current) close()
    else setOpen(true)
  }, [close, setOpen])

  // On open: focus the menu and highlight the first item. Child effects (item
  // registration) run before this parent effect, so orderRef is populated.
  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      popupRef.current?.focus({preventScroll: true})
      const first = orderRef.current[0]
      if (first) setHighlightedId(first)
    } else if (!open && wasOpenRef.current) {
      setHighlightedId(null)
    }
    wasOpenRef.current = open
  }, [open])

  // Keep the highlighted item in view when the popup scrolls.
  useEffect(() => {
    if (!highlightedId) return
    const el = itemsRef.current.get(highlightedId)
    el?.scrollIntoView?.({block: 'nearest'})
  }, [highlightedId])

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

  // Native keydown on the popup element, for full KeyboardEvent access.
  useEffect(() => {
    const popup = popupRef.current
    if (!popup || !open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        close()
        return
      }
      if (e.key === 'Tab') {
        // Back on the trigger before the browser moves focus, so Tab and
        // Shift+Tab continue from where the menu was opened.
        close()
        return
      }
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
            if (prev) items.get(prev)?.click()
            return prev
          })
          break
        }
      }
    }

    popup.addEventListener('keydown', handleKeyDown)
    return () => popup.removeEventListener('keydown', handleKeyDown)
  }, [open, close])

  // A press outside the trigger and the popup closes the menu, and leaves
  // focus where the press put it.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (isOutsidePress(e.target as Node | null, [popupRef.current, triggerRef.current])) {
        close({restoreFocus: false})
      }
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [open, close])

  const ctx: MenuContextValue = {
    open,
    toggle,
    close,
    menuId,
    triggerId,
    highlightedId,
    setHighlightedId,
    registerItem,
    triggerRef,
    popupRef,
  }

  return {ctx, rootRef}
}
