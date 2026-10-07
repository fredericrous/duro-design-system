import {
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {createPortal} from 'react-dom'
import {html} from 'react-strict-dom'
import {SPACING_PX} from '@duro-app/tokens/keys'
import {styles} from './styles.css'
import {MenuContext, useMenu} from './MenuContext'
import {useMenuRoot} from './useMenuRoot'
import {devWarnOnce} from '../../shared/devWarnOnce'
import {usePortalMount} from '../ThemeProvider/ThemeProvider'
import {computePopoverPosition} from '../Popover/position'
import {usePopoverLayer} from '../Popover/PopoverLayerContext'
import {useGroupedControl} from '../ButtonGroup/useGroupedControl'
import {ControlContextBoundary} from '../Toolbar/ControlContextBoundary'

// --- Root ---
interface RootProps {
  children: ReactNode
  /** Controlled open state. */
  open?: boolean
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void
}

function Root({children, open, defaultOpen, onOpenChange}: RootProps) {
  const {ctx, rootRef} = useMenuRoot({open, defaultOpen, onOpenChange})

  return (
    <MenuContext.Provider value={ctx}>
      <html.div ref={rootRef} style={styles.root}>
        {children}
      </html.div>
    </MenuContext.Provider>
  )
}

// --- Trigger ---
// Trigger IS the button: aria-haspopup / aria-expanded / aria-controls have to
// sit on the focusable element, so it cannot be a wrapper like Dialog.Trigger.
// Its children are the label (text, an Icon) — never a Button or other control.
const NESTED_CONTROL = 'button, a[href], input, select, textarea, [role="button"]'

export type MenuTriggerVariant = 'default' | 'ghost'

interface TriggerProps {
  children: ReactNode
  /** Accessible name — required when the label is an icon only. */
  'aria-label'?: string
  /** `ghost`: no border or fill until hover, for toolbars. Default: `default`. */
  variant?: MenuTriggerVariant
  ref?: Ref<HTMLButtonElement>
}

function Trigger({children, 'aria-label': ariaLabel, variant = 'default', ref}: TriggerProps) {
  const {open, toggle, menuId, triggerId, triggerRef} = useMenu()
  const grouped = useGroupedControl<HTMLButtonElement>()
  const groupedRef = grouped.ref

  const setRef = useCallback(
    (el: HTMLButtonElement | null) => {
      triggerRef.current = el
      groupedRef.current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) ref.current = el
    },
    [ref, triggerRef, groupedRef],
  )

  // TypeScript can't stop a <Button> child; the DOM can tell.
  useEffect(() => {
    if (triggerRef.current?.querySelector(NESTED_CONTROL)) {
      devWarnOnce(
        'Menu',
        'trigger-nested-control',
        'Menu.Trigger is itself the button — give it the label (text, an Icon), not a Button, link or other control. A control inside a <button> is invalid HTML: it breaks hydration and hands assistive tech a button inside a button.',
      )
    }
  }, [triggerRef])

  return (
    <html.button
      ref={setRef}
      tabIndex={grouped.tabIndex}
      onFocus={grouped.onFocus}
      id={triggerId}
      type="button"
      onClick={toggle}
      aria-label={ariaLabel}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-controls={open ? menuId : undefined}
      style={[styles.trigger, variant === 'ghost' && styles.triggerGhost, grouped.style]}
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

// Portalled into the ThemeProvider mount and placed against the trigger, so a
// sticky or overflow-clipped toolbar never cuts it off. Capped at
// `sizes.listMaxH`; longer menus scroll.
function Popup({children, align = 'start'}: PopupProps) {
  const {open, menuId, triggerId, highlightedId, triggerRef, popupRef} = useMenu()
  const [coords, setCoords] = useState({top: 0, left: 0})
  const mount = usePortalMount()
  // Inside a Popover, a press on this portalled popup is not an outside press.
  usePopoverLayer(popupRef, {active: open})

  useLayoutEffect(() => {
    if (!open) return
    const update = () => {
      const popup = popupRef.current
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!popup || !rect) return
      const next = computePopoverPosition({
        anchor: {top: rect.top, left: rect.left, width: rect.width, height: rect.height},
        popup: {width: popup.offsetWidth, height: popup.offsetHeight},
        viewport: {width: window.innerWidth, height: window.innerHeight},
        side: 'bottom',
        align,
        offset: SPACING_PX.xs,
      })
      setCoords((prev) =>
        prev.top === next.top && prev.left === next.left ? prev : {top: next.top, left: next.left},
      )
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, align, popupRef, triggerRef])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <html.div
      ref={popupRef}
      id={menuId}
      role="menu"
      tabIndex={-1}
      aria-labelledby={triggerId}
      aria-activedescendant={highlightedId ?? undefined}
      style={[styles.popup, styles.popupPosition(coords.top, coords.left)]}
    >
      <ControlContextBoundary>{children}</ControlContextBoundary>
    </html.div>,
    mount ?? document.body,
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
      onClick={() => close()}
      role="menuitem"
      onPointerEnter={() => setHighlightedId(id)}
      style={[styles.item, styles.linkItem, isHighlighted && styles.itemHighlighted]}
    >
      {children}
    </html.a>
  )
}

// --- Separator ---
// A rule between groups of items. role="separator" is a valid child of a
// menu (WAI-ARIA menu pattern), and it is never registered as an item, so
// arrow keys and the active descendant pass over it.
function Separator() {
  return <html.div role="separator" aria-orientation="horizontal" style={styles.separator} />
}

export const Menu = {
  Root,
  Trigger,
  Popup,
  Item,
  LinkItem,
  Separator,
}
