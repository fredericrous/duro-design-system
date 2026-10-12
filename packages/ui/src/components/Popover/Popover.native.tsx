import {
  createContext,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {Pressable} from 'react-native'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {nativeStyles} from './native.css'
import type {PopoverAlign, PopoverSide} from './position'
import {AnchoredOverlay} from '../../shared/portal/AnchoredOverlay'
import {focusForAccessibility} from '../../shared/accessibilityFocus'
import {mergeRefs} from '../../shared/mergeRefs'
import {ModalContext} from '../../shared/ModalContext'
import type {ControlSize} from '../../shared/types'
import {useTooltipHint} from '../Tooltip/TooltipHint'
import {ControlContextBoundary} from '../Toolbar/ControlContextBoundary'

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  popoverId: string
  side: PopoverSide
  align: PopoverAlign
  triggerRef: RefObject<unknown>
  /** Bumped by `reposition()`: the popup measures its trigger again */
  placement: number
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

function usePopover(part: string) {
  const ctx = useContext(PopoverContext)
  if (!ctx) throw new Error(`Popover.${part} must be used within Popover.Root`)
  return ctx
}

export interface PopoverHandle {
  /** Place the popup against its trigger again. */
  reposition: () => void
}

interface RootProps {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: PopoverSide
  align?: PopoverAlign
  /** Web only: native places the popup against Popover.Trigger. */
  anchor?: () => DOMRect
  /** Web only: on native the popup is modal, so nothing outside it is pressed. */
  ignore?: ReadonlyArray<unknown>
  ref?: Ref<PopoverHandle>
}

/**
 * Native Popover (plan N0, Slice B): the popup is placed against the trigger
 * in an OverlayModal, so it is modal on native where the web's is not. A
 * press outside or Android's back button closes it; the screen reader's
 * focus moves into it on open and back to the trigger on close.
 */
function Root({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  ref,
}: RootProps) {
  const [inner, setInner] = useState(defaultOpen)
  const controlled = openProp !== undefined
  const open = controlled ? openProp : inner
  const popoverId = useId()
  const triggerRef = useRef<unknown>(null)
  const [placement, setPlacement] = useState(0)
  const openRef = useRef(open)
  openRef.current = open

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInner(next)
      if (next !== openRef.current) onOpenChange?.(next)
    },
    [controlled, onOpenChange],
  )

  useImperativeHandle(ref, () => ({reposition: () => setPlacement((n) => n + 1)}), [])

  const wasOpen = useRef(open)
  useEffect(() => {
    if (wasOpen.current && !open) focusForAccessibility(triggerRef.current, 'Popover')
    wasOpen.current = open
  }, [open])

  return (
    <PopoverContext.Provider value={{open, setOpen, popoverId, side, align, triggerRef, placement}}>
      {children}
    </PopoverContext.Provider>
  )
}

interface TriggerProps {
  children: ReactNode
  /** Accessible name: required when the label is an icon only. */
  'aria-label'?: string
  /** `small` matches a small Toggle or Button beside it. Default: `default`. */
  size?: ControlSize
  /** The trigger's host, e.g. to measure it. */
  ref?: Ref<unknown>
}

/**
 * An RN Pressable host, so it carries an enclosing Tooltip's text as its hint.
 *
 * holds-until: react-strict-dom maps aria-description to accessibilityHint
 * (https://github.com/react/react-strict-dom/issues/524).
 */
function Trigger({children, 'aria-label': ariaLabel, size = 'default', ref}: TriggerProps) {
  const {open, setOpen, triggerRef} = usePopover('Trigger')
  const hint = useTooltipHint()
  return (
    <Pressable
      ref={mergeRefs(triggerRef, ref) as Ref<never>}
      onPress={() => setOpen(!open)}
      accessibilityRole="button"
      accessibilityLabel={ariaLabel}
      accessibilityHint={hint}
      accessibilityState={{expanded: open}}
    >
      <html.div
        style={[styles.trigger, nativeStyles.nativeFlex, size === 'small' && styles.triggerSmall]}
      >
        {children}
      </html.div>
    </Pressable>
  )
}

interface PopupProps {
  children: ReactNode
  /** Accessible name for the dialog. */
  label: string
  /** Web only: on native every popup is its own Modal, above what opened it. */
  raised?: boolean
}

function Popup({children, label}: PopupProps) {
  const {open, setOpen, popoverId, side, align, triggerRef, placement} = usePopover('Popup')
  const popupRef = useRef<HTMLDivElement>(null)
  return (
    <AnchoredOverlay
      key={placement}
      visible={open}
      anchorRef={triggerRef}
      side={side}
      align={align}
      onRequestClose={() => setOpen(false)}
      onShow={() => focusForAccessibility(popupRef.current, 'Popover')}
    >
      <html.div
        ref={popupRef}
        id={popoverId}
        role="dialog"
        aria-modal
        aria-label={label}
        style={[styles.popup, nativeStyles.popupInPlace]}
      >
        {/* Modal on native: a Popover or Menu opened inside it stacks above it. */}
        <ModalContext.Provider value={true}>
          <ControlContextBoundary>{children}</ControlContextBoundary>
        </ModalContext.Provider>
      </html.div>
    </AnchoredOverlay>
  )
}

function Close({children}: {children: ReactNode}) {
  const {setOpen} = usePopover('Close')
  return (
    <html.button
      type="button"
      onClick={() => setOpen(false)}
      style={[styles.close, nativeStyles.nativeFlex]}
    >
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
