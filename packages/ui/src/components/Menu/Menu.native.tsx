import {
  createContext,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
} from 'react'
import {Linking, Platform, Pressable, ScrollView, StyleSheet} from 'react-native'
import {html} from 'react-strict-dom'
import {SIZES_PX} from '@duro-app/tokens/keys'
import {styles} from './styles.css'
import {nativeStyles} from './native.css'
import {useMenuOpen} from './useMenuOpen'
import {AnchoredOverlay} from '../../shared/portal/AnchoredOverlay'
import {focusForAccessibility} from '../../shared/accessibilityFocus'
import {mergeRefs} from '../../shared/mergeRefs'
import type {LinkClickEvent, OnNavigate} from '../../shared/navigate'
import type {ControlSize} from '../../shared/types'
import {useTooltipHint} from '../Tooltip/TooltipHint'
import {ControlContextBoundary} from '../Toolbar/ControlContextBoundary'

interface NativeMenuContextValue {
  open: boolean
  toggle: () => void
  /**
   * Close, then run `after` once the menu's Modal is gone: an item that opens
   * a Dialog would otherwise present during a dismissal, which iOS drops.
   */
  closeThen: (after?: () => void) => void
  menuId: string
  triggerRef: RefObject<unknown>
}

const MenuContext = createContext<NativeMenuContextValue | null>(null)

function useMenu() {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error('Menu compound components must be used within Menu.Root')
  return ctx
}

interface RootProps {
  children: ReactNode
  /** Controlled open state. */
  open?: boolean
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void
}

/**
 * Native Menu (plan N0, Slice B): the same compound API, its popup placed
 * against the trigger in an OverlayModal. A press outside or Android's back
 * button closes it; an item runs its action after the menu has gone. Native
 * has no arrow keys or active descendant (Decision 6): each item is its own
 * screen-reader stop.
 */
function Root({children, ...options}: RootProps) {
  const {open, setOpen} = useMenuOpen(options)
  const menuId = useId()
  const triggerRef = useRef<unknown>(null)
  const pendingRef = useRef<(() => void) | null>(null)

  const runPending = useCallback(() => {
    const pending = pendingRef.current
    pendingRef.current = null
    pending?.()
  }, [])

  const closeThen = useCallback(
    (after?: () => void) => {
      pendingRef.current = after ?? null
      setOpen(false)
    },
    [setOpen],
  )

  // Focus back on the trigger once the menu is gone; Android has no Modal
  // onDismiss, so a pending action runs on the next frame there.
  const wasOpen = useRef(open)
  useEffect(() => {
    if (wasOpen.current && !open) {
      focusForAccessibility(triggerRef.current, 'Menu')
      if (Platform.OS !== 'ios') requestAnimationFrame(runPending)
    }
    wasOpen.current = open
  }, [open, runPending])

  const toggle = useCallback(() => setOpen(!open), [open, setOpen])

  return (
    <MenuContext.Provider value={{open, toggle, closeThen, menuId, triggerRef}}>
      <PendingContext.Provider value={runPending}>
        <html.div style={[styles.root, nativeStyles.nativeFlex]}>{children}</html.div>
      </PendingContext.Provider>
    </MenuContext.Provider>
  )
}

/** iOS: run the pending item action once the Modal has dismissed. */
const PendingContext = createContext<() => void>(() => {})

export type MenuTriggerVariant = 'default' | 'ghost'

interface TriggerProps {
  children: ReactNode
  /** Accessible name — required when the label is an icon only. */
  'aria-label'?: string
  /** `ghost`: no border or fill until hover, for toolbars. Default: `default`. */
  variant?: MenuTriggerVariant
  /** `small` matches a small Toggle or Button beside it. Default: `default`. */
  size?: ControlSize
  ref?: Ref<unknown>
}

/**
 * The trigger is an RN Pressable host, so it carries an enclosing Tooltip's
 * text as its own accessibility hint (RSD drops `accessibilityHint` on html.*).
 */
function Trigger({
  children,
  'aria-label': ariaLabel,
  variant = 'default',
  size = 'default',
  ref,
}: TriggerProps) {
  const {open, toggle, triggerRef} = useMenu()
  const hint = useTooltipHint()
  return (
    <Pressable
      ref={mergeRefs(triggerRef, ref) as Ref<never>}
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={ariaLabel}
      accessibilityHint={hint}
      accessibilityState={{expanded: open}}
    >
      <html.div
        style={[
          styles.trigger,
          nativeStyles.nativeFlex,
          variant === 'ghost'
            ? [styles.triggerGhost, size === 'small' && styles.triggerGhostSmall]
            : size === 'small' && styles.triggerSmall,
        ]}
      >
        {children}
      </html.div>
    </Pressable>
  )
}

interface PopupProps {
  children: ReactNode
  align?: 'start' | 'end'
}

function Popup({children, align = 'start'}: PopupProps) {
  const {open, closeThen, menuId, triggerRef} = useMenu()
  const runPending = useContext(PendingContext)
  const popupRef = useRef<HTMLDivElement>(null)
  return (
    <AnchoredOverlay
      visible={open}
      anchorRef={triggerRef}
      side="bottom"
      align={align}
      onRequestClose={() => closeThen()}
      onShow={() => focusForAccessibility(popupRef.current, 'Menu')}
      onDismiss={runPending}
    >
      <html.div
        ref={popupRef}
        id={menuId}
        role="menu"
        style={[styles.popup, nativeStyles.popupInPlace]}
      >
        <ScrollView style={layout.scroll} bounces={false}>
          <ControlContextBoundary>{children}</ControlContextBoundary>
        </ScrollView>
      </html.div>
    </AnchoredOverlay>
  )
}

// The popup's height cap, `sizes.listMaxH`, on the view that scrolls.
const layout = StyleSheet.create({scroll: {maxHeight: SIZES_PX.listMaxH, flexGrow: 0}})

interface ItemProps {
  onClick?: () => void
  children: ReactNode
}

function Item({onClick, children}: ItemProps) {
  const {closeThen} = useMenu()
  return (
    <Pressable accessibilityRole="menuitem" onPress={() => closeThen(onClick)}>
      {({pressed}) => (
        <html.div style={[styles.item, pressed && nativeStyles.itemPressed]}>{children}</html.div>
      )}
    </Pressable>
  )
}

interface LinkItemProps {
  href: string
  /**
   * Called with the href when the item is pressed (ADR-0002). Call
   * `event.preventDefault()` to navigate in-app; otherwise, and without it,
   * the URL opens with the system (`Linking.openURL`).
   */
  onNavigate?: OnNavigate
  children: ReactNode
}

function LinkItem({href, onNavigate, children}: LinkItemProps) {
  const {closeThen} = useMenu()
  const follow = () => {
    let prevented = false
    const event: LinkClickEvent = {
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      get defaultPrevented() {
        return prevented
      },
      preventDefault() {
        prevented = true
      },
    }
    onNavigate?.(href, event)
    if (!prevented) void Linking.openURL(href)
  }
  return (
    <Pressable accessibilityRole="link" onPress={() => closeThen(follow)}>
      {({pressed}) => (
        <html.div style={[styles.item, pressed && nativeStyles.itemPressed]}>{children}</html.div>
      )}
    </Pressable>
  )
}

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
