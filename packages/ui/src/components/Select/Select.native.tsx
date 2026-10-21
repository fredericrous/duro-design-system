import {
  Children,
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useId,
  useRef,
} from 'react'
import {Pressable} from 'react-native'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {useSelectState} from './selectState'
import {Drawer} from '../Drawer/Drawer'
import {Listbox} from '../Listbox/Listbox'
import {Button} from '../Button/Button'
import {nativeStyles} from './native.css'
import {Chevron} from '../SideNav/Chevron'
import {useTooltipHint} from '../Tooltip/TooltipHint'
import {focusForAccessibility} from '../../shared/accessibilityFocus'
import {textOf} from '../../shared/textOf'
import type {ControlSize} from '../../shared/types'

/** The picker sheet's detents (plan N0, Decision 5). */
const SNAP_POINTS = ['medium', 'large'] as const

interface NativeSelectContextValue {
  value: string | null
  open: boolean
  disabled: boolean
  setOpen: (open: boolean) => void
  choose: (value: string) => void
  labels: Record<string, string>
  registerLabel: (value: string, label: string) => void
  listboxId: string
  triggerRef: RefObject<unknown>
}

const SelectContext = createContext<NativeSelectContextValue | null>(null)

function useSelect() {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error('Select compound components must be used within Select.Root')
  return ctx
}

/**
 * True while Popup renders its items unseen, so each registers its label
 * before the sheet first opens (the web reads them from the hidden list).
 */
const CollectContext = createContext(false)

interface RootProps {
  /** The web's hidden form input; native has no form post. */
  name?: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string | null) => void
  initialLabels?: Record<string, string>
  /** Called when the sheet opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** The whole control is disabled: the trigger does not open the sheet. */
  disabled?: boolean
  children: ReactNode
}

/**
 * Native Select (plan N0, Slice C): the trigger opens a bottom sheet (a
 * Drawer at the medium and large detents) listing the options; a press picks
 * one and closes the sheet (C0 direction A, "Check"). The screen reader's
 * focus returns to the trigger.
 */
function Root({
  defaultValue,
  value,
  onValueChange,
  initialLabels,
  onOpenChange,
  disabled = false,
  children,
}: RootProps) {
  const state = useSelectState({defaultValue, value, onValueChange, initialLabels, onOpenChange})
  const {open, setOpen, setValue} = state
  const listboxId = useId()
  const triggerRef = useRef<unknown>(null)

  const wasOpen = useRef(open)
  useEffect(() => {
    if (wasOpen.current && !open) focusForAccessibility(triggerRef.current, 'Select')
    wasOpen.current = open
  }, [open])

  const ctx: NativeSelectContextValue = {
    value: state.value,
    open,
    disabled,
    setOpen,
    choose: (v) => {
      setValue(v)
      setOpen(false)
    },
    labels: state.labels,
    registerLabel: state.registerLabel,
    listboxId,
    triggerRef,
  }

  return (
    <SelectContext.Provider value={ctx}>
      <Drawer.Root open={open} onOpenChange={setOpen} anchor="bottom" snapPoints={SNAP_POINTS}>
        <html.div style={[styles.root, nativeStyles.nativeFlex]}>{children}</html.div>
      </Drawer.Root>
    </SelectContext.Provider>
  )
}

/**
 * An RN Pressable host, so it carries an enclosing Tooltip's text as its
 * accessibility hint (RSD drops `accessibilityHint` on html.*).
 */
function Trigger({
  children,
  'aria-label': ariaLabel,
  size = 'default',
}: {
  children: ReactNode
  'aria-label'?: string
  size?: ControlSize
}) {
  const {open, disabled, setOpen, triggerRef} = useSelect()
  const hint = useTooltipHint()
  return (
    <Pressable
      ref={triggerRef as RefObject<never>}
      disabled={disabled}
      onPress={() => setOpen(true)}
      accessibilityRole="combobox"
      accessibilityLabel={ariaLabel}
      accessibilityHint={hint}
      accessibilityState={{expanded: open, disabled}}
    >
      <html.div
        style={[
          styles.trigger,
          nativeStyles.nativeFlex,
          size === 'small' && styles.triggerSmall,
          disabled && styles.triggerDisabled,
        ]}
      >
        {children}
      </html.div>
    </Pressable>
  )
}

function Value({placeholder}: {placeholder?: string}) {
  const {value, labels} = useSelect()
  const display = value ? (labels[value] ?? value) : null
  return (
    <html.span style={display ? styles.value : styles.placeholder}>
      {display ?? placeholder}
    </html.span>
  )
}

function Icon({children}: {children?: ReactNode}) {
  return (
    <html.div style={[styles.icon, nativeStyles.nativeFlex, nativeStyles.iconDown]}>
      {children ?? <Chevron color="textMuted" />}
    </html.div>
  )
}

interface PopupProps {
  children: ReactNode
  /** The sheet's title (native) and the list's accessible name. */
  label?: string
  /** The sheet header's text button that closes it unchanged (native). Default: 'Cancel' */
  cancelLabel?: string
  /** Shown in place of the list when there are no items. */
  empty?: ReactNode
}

function Popup({children, label, cancelLabel = 'Cancel', empty}: PopupProps) {
  const {open, choose, listboxId} = useSelect()
  const hasItems = Children.toArray(children).length > 0
  return (
    <>
      <CollectContext.Provider value={true}>{children}</CollectContext.Provider>
      <Drawer.Portal>
        <Drawer.Header titleAlign="center">
          {label ? <Drawer.Title>{label}</Drawer.Title> : null}
          <Drawer.Close>
            <Button variant="link">{cancelLabel}</Button>
          </Drawer.Close>
        </Drawer.Header>
        {!hasItems && empty != null ? (
          <Listbox.Empty>{empty}</Listbox.Empty>
        ) : (
          <Drawer.Body flush>
            <Listbox.Root id={listboxId} open={open} onSelect={choose} aria-label={label}>
              {children}
            </Listbox.Root>
          </Drawer.Body>
        )}
      </Drawer.Portal>
    </>
  )
}

interface ItemProps {
  value: string
  /** Shown but not choosable. */
  disabled?: boolean
  children: ReactNode
}

function Item({value: itemValue, disabled = false, children}: ItemProps) {
  const collecting = useContext(CollectContext)
  const {value, registerLabel} = useSelect()
  const label = textOf(children)
  useEffect(() => {
    if (collecting && label) registerLabel(itemValue, label)
  }, [collecting, itemValue, label, registerLabel])
  if (collecting) return null
  return (
    <Listbox.Option value={itemValue} selected={value === itemValue} disabled={disabled}>
      {children}
    </Listbox.Option>
  )
}

function ItemText({children}: {children: ReactNode}) {
  return <html.span>{children}</html.span>
}

export const Select = {
  Root,
  Trigger,
  Value,
  Icon,
  Popup,
  Item,
  ItemText,
}
