import {
  type ReactNode,
  type Ref,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {createPortal} from 'react-dom'
import {html} from 'react-strict-dom'
import {usePortalMount} from '../ThemeProvider/ThemeProvider'
import {styles} from './styles.css'
import {computePopoverPosition, type PopoverAlign, type PopoverSide} from './position'
import {isOutsidePress} from './outside'
import {PopoverLayerContext, type PopoverLayerContextValue} from './PopoverLayerContext'
import {useGroupedControl} from '../ButtonGroup/useGroupedControl'
import {ControlContextBoundary} from '../Toolbar/ControlContextBoundary'
import {mergeRefs} from '../../shared/mergeRefs'

// --- Context ---

type IgnoreEntry = Element | null | (() => Element | null)

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  popoverId: string
  side: PopoverSide
  align: PopoverAlign
  anchor?: () => DOMRect
  triggerRef: React.RefObject<HTMLButtonElement | null>
  popupRef: React.RefObject<HTMLDivElement | null>
  repositionRef: React.RefObject<(() => void) | null>
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

function usePopover(part: string) {
  const ctx = useContext(PopoverContext)
  if (!ctx) throw new Error(`Popover.${part} must be used within Popover.Root`)
  return ctx
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const OFFSET = 4 // `xs` token

// --- Root ---

export interface PopoverHandle {
  /** Re-measure the anchor and re-place the popup. */
  reposition: () => void
}

interface RootProps {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: PopoverSide
  align?: PopoverAlign
  /** Virtual anchor: a viewport rect. Replaces the Trigger as the anchor. */
  anchor?: () => DOMRect
  /** Elements (or getters) whose pointerdown does not count as an outside press. */
  ignore?: ReadonlyArray<IgnoreEntry>
  ref?: Ref<PopoverHandle>
}

function Root({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  anchor,
  ignore,
  ref,
}: RootProps) {
  const [inner, setInner] = useState(defaultOpen)
  const controlled = openProp !== undefined
  const open = controlled ? openProp : inner
  const popoverId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const repositionRef = useRef<(() => void) | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const ignoreRef = useRef(ignore)
  ignoreRef.current = ignore
  const openRef = useRef(open)
  openRef.current = open

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInner(next)
      if (next !== openRef.current) onOpenChange?.(next)
    },
    [controlled, onOpenChange],
  )

  useImperativeHandle(ref, () => ({reposition: () => repositionRef.current?.()}), [])

  // Focus: into the popup on open, back to the trigger (or the previously
  // focused element when there is no trigger) on close.
  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      const popup = popupRef.current
      if (popup) {
        const first = popup.querySelector<HTMLElement>(FOCUSABLE)
        ;(first ?? popup).focus({preventScroll: true})
      }
    } else if (!open && wasOpenRef.current) {
      const target = triggerRef.current ?? previousFocusRef.current
      target?.focus?.()
      previousFocusRef.current = null
    }
    wasOpenRef.current = open
  }, [open])

  // Esc and outside press.
  useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      e.preventDefault()
      setOpen(false)
    }

    function onPointerDown(e: PointerEvent) {
      const ignored = (ignoreRef.current ?? []).map((entry) =>
        typeof entry === 'function' ? entry() : entry,
      )
      const inside = [popupRef.current, triggerRef.current, ...ignored, ...layersRef.current]
      if (isOutsidePress(e.target as Node | null, inside)) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [open, setOpen])

  const layersRef = useRef(new Set<Element>())
  // A nested Popover's layers are inside its parent too.
  const parentLayer = useContext(PopoverLayerContext)
  const layerCtx = useMemo<PopoverLayerContextValue>(
    () => ({
      register: (el) => {
        layersRef.current.add(el)
        const unregisterParent = parentLayer?.register(el)
        return () => {
          layersRef.current.delete(el)
          unregisterParent?.()
        }
      },
    }),
    [parentLayer],
  )
  useLayoutEffect(() => {
    const popup = popupRef.current
    if (!open || !popup) return
    return parentLayer?.register(popup)
  }, [open, parentLayer])

  const ctx: PopoverContextValue = {
    open,
    setOpen,
    popoverId,
    side,
    align,
    anchor,
    triggerRef,
    popupRef,
    repositionRef,
  }

  return (
    <PopoverContext.Provider value={ctx}>
      <PopoverLayerContext.Provider value={layerCtx}>{children}</PopoverLayerContext.Provider>
    </PopoverContext.Provider>
  )
}

// --- Trigger ---
// Trigger IS the button (like Menu.Trigger): give it a label, not a Button.

interface TriggerProps {
  children: ReactNode
  /** Accessible name: required when the label is an icon only. */
  'aria-label'?: string
  /** The trigger <button>, e.g. to measure it or return focus to it. */
  ref?: Ref<HTMLButtonElement>
}

function Trigger({children, 'aria-label': ariaLabel, ref}: TriggerProps) {
  const {open, setOpen, popoverId, triggerRef} = usePopover('Trigger')
  const grouped = useGroupedControl<HTMLButtonElement>()

  return (
    <html.button
      ref={mergeRefs(triggerRef, grouped.ref, ref)}
      tabIndex={grouped.tabIndex}
      onFocus={grouped.onFocus}
      type="button"
      onClick={() => setOpen(!open)}
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? popoverId : undefined}
      style={[styles.trigger, grouped.style]}
    >
      {children}
    </html.button>
  )
}

// --- Popup ---

interface PopupProps {
  children: ReactNode
  /** Accessible name for the dialog. */
  label: string
}

function Popup({children, label}: PopupProps) {
  const {open, popoverId, side, align, anchor, triggerRef, popupRef, repositionRef} =
    usePopover('Popup')
  const [coords, setCoords] = useState({top: 0, left: 0})
  // Inside ThemeProvider's portal layer, like Select/Dialog/Drawer: theme
  // tokens cascade into the popup and it stacks above dialogs.
  const mount = usePortalMount()

  // Measure before paint on open; re-measure on scroll/resize (capture phase
  // catches any scrolling ancestor) and when Root.reposition() is called.
  useLayoutEffect(() => {
    if (!open) {
      repositionRef.current = null
      return
    }
    const update = () => {
      const popup = popupRef.current
      if (!popup) return
      const rect = anchor ? anchor() : triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const next = computePopoverPosition({
        anchor: {top: rect.top, left: rect.left, width: rect.width, height: rect.height},
        popup: {width: popup.offsetWidth, height: popup.offsetHeight},
        viewport: {width: window.innerWidth, height: window.innerHeight},
        side,
        align,
        offset: OFFSET,
      })
      setCoords((prev) =>
        prev.top === next.top && prev.left === next.left ? prev : {top: next.top, left: next.left},
      )
    }
    repositionRef.current = update
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      repositionRef.current = null
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, side, align, anchor, triggerRef, popupRef, repositionRef])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <html.div
      ref={popupRef}
      id={popoverId}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      style={[styles.popup, styles.popupPosition(coords.top, coords.left)]}
    >
      <ControlContextBoundary>{children}</ControlContextBoundary>
    </html.div>,
    mount ?? document.body,
  )
}

// --- Close ---

function Close({children}: {children: ReactNode}) {
  const {setOpen} = usePopover('Close')

  return (
    <html.button type="button" onClick={() => setOpen(false)} style={styles.close}>
      {children}
    </html.button>
  )
}

export const Popover = {
  Root,
  Trigger,
  Popup,
  Close,
}
