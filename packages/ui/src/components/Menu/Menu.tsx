import {type ReactNode, useRef, useId, useEffect} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {MenuContext, useMenu} from './MenuContext'
import {useMenuRoot} from './useMenuRoot'

// --- Root ---
interface RootProps {
  children: ReactNode
}

function Root({children}: RootProps) {
  const {ctx, rootRef} = useMenuRoot()

  return (
    <MenuContext.Provider value={ctx}>
      <html.div ref={rootRef} style={styles.root}>
        {children}
      </html.div>
    </MenuContext.Provider>
  )
}

// --- Trigger ---
function Trigger({children}: {children: ReactNode}) {
  const {open, toggle, menuId, triggerRef} = useMenu()
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
  align?: 'start' | 'end'
}

function Popup({children, align = 'start'}: PopupProps) {
  const {open, close, menuId, highlightedId} = useMenu()

  if (!open) return null

  return (
    <>
      <html.div style={styles.backdrop} onClick={close} />
      <html.div
        id={menuId}
        role="menu"
        aria-activedescendant={highlightedId ?? undefined}
        style={[styles.popup, align === 'end' && styles.popupEnd]}
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

function Item({onClick, children}: ItemProps) {
  const {close, highlightedId, setHighlightedId, registerItem} = useMenu()
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

function LinkItem({href, children}: LinkItemProps) {
  const {close, highlightedId, setHighlightedId, registerItem} = useMenu()
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
