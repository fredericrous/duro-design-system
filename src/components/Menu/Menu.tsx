import { type ReactNode, createContext, useContext, useState, useCallback, useRef, useId, useEffect } from "react"
import { html } from "react-strict-dom"
import { styles } from "./styles.css"

// --- Context ---
interface MenuContextValue {
  open: boolean
  toggle: () => void
  close: () => void
  menuId: string
  highlightedId: string | null
  setHighlightedId: (id: string | null) => void
  registerItem: (id: string, element: HTMLElement) => () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const MenuContext = createContext<MenuContextValue | null>(null)

function useMenu() {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error("Menu compound components must be used within Menu.Root")
  return ctx
}

// --- Root ---
interface RootProps {
  children: ReactNode
}

function Root({ children }: RootProps) {
  const [open, setOpen] = useState(false)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const itemsRef = useRef(new Map<string, HTMLElement>())
  const orderRef = useRef<string[]>([])

  const close = useCallback(() => {
    setOpen(false)
    setHighlightedId(null)
    triggerRef.current?.focus()
  }, [])

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        const order = orderRef.current
        if (order.length > 0) setHighlightedId(order[0])
      } else {
        setHighlightedId(null)
      }
      return !prev
    })
  }, [])

  const registerItem = useCallback((id: string, element: HTMLElement) => {
    itemsRef.current.set(id, element)
    // Rebuild order sorted by DOM position
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
        case "ArrowDown": {
          e.preventDefault()
          setHighlightedId((prev) => {
            const idx = prev ? order.indexOf(prev) : -1
            return order[(idx + 1) % order.length]
          })
          break
        }
        case "ArrowUp": {
          e.preventDefault()
          setHighlightedId((prev) => {
            const idx = prev ? order.indexOf(prev) : 0
            return order[(idx - 1 + order.length) % order.length]
          })
          break
        }
        case "Home": {
          e.preventDefault()
          setHighlightedId(order[0])
          break
        }
        case "End": {
          e.preventDefault()
          setHighlightedId(order[order.length - 1])
          break
        }
        case "Enter":
        case " ": {
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
        case "Escape":
        case "Tab": {
          close()
          break
        }
      }
    }

    root.addEventListener("keydown", handleKeyDown)
    return () => root.removeEventListener("keydown", handleKeyDown)
  }, [open, close])

  return (
    <MenuContext.Provider
      value={{
        open,
        toggle,
        close,
        menuId,
        highlightedId,
        setHighlightedId,
        registerItem,
        triggerRef,
      }}
    >
      <html.div ref={rootRef} style={styles.root}>
        {children}
      </html.div>
    </MenuContext.Provider>
  )
}

// --- Trigger ---
function Trigger({ children }: { children: ReactNode }) {
  const { open, toggle, menuId, triggerRef } = useMenu()
  const localRef = useRef<HTMLButtonElement>(null)

  // Sync local ref to context triggerRef
  useEffect(() => {
    triggerRef.current = localRef.current
  })

  return (
    <html.button
      ref={localRef}
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-controls={open ? menuId : undefined}
      style={styles.trigger}
    >
      {children}
    </html.button>
  )
}

// --- Popup ---
interface PopupProps {
  children: ReactNode
  align?: "start" | "end"
}

function Popup({ children, align = "start" }: PopupProps) {
  const { open, close, menuId, highlightedId } = useMenu()

  if (!open) return null

  return (
    <>
      <html.div style={styles.backdrop} onClick={close} />
      <html.div
        id={menuId}
        role="menu"
        aria-activedescendant={highlightedId ?? undefined}
        style={[styles.popup, align === "end" && styles.popupEnd]}
      >
        {children}
      </html.div>
    </>
  )
}

// --- Item ---
interface ItemProps {
  onClick?: () => void
  children: ReactNode
}

function Item({ onClick, children }: ItemProps) {
  const { close, highlightedId, setHighlightedId, registerItem } = useMenu()
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const isHighlighted = highlightedId === id

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerItem(id, el)
  }, [id, registerItem])

  const handleClick = () => {
    onClick?.()
    close()
  }

  return (
    <html.div
      ref={ref}
      id={id}
      role="menuitem"
      onClick={handleClick}
      onPointerEnter={() => setHighlightedId(id)}
      style={[styles.item, isHighlighted && styles.itemHighlighted]}
    >
      {children}
    </html.div>
  )
}

// --- LinkItem ---
interface LinkItemProps {
  href: string
  children: ReactNode
}

function LinkItem({ href, children }: LinkItemProps) {
  const { close, highlightedId, setHighlightedId, registerItem } = useMenu()
  const id = useId()
  const ref = useRef<HTMLAnchorElement>(null)
  const isHighlighted = highlightedId === id

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerItem(id, el)
  }, [id, registerItem])

  return (
    <html.a
      ref={ref}
      id={id}
      href={href}
      onClick={close}
      role="menuitem"
      onPointerEnter={() => setHighlightedId(id)}
      style={[styles.item, styles.linkItem, isHighlighted && styles.itemHighlighted]}
    >
      {children}
    </html.a>
  )
}

export const Menu = {
  Root,
  Trigger,
  Popup,
  Item,
  LinkItem,
}
