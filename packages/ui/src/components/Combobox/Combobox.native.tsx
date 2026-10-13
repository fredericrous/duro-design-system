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
  useState,
} from 'react'
import {Pressable} from 'react-native'
import {html} from 'react-strict-dom'
import {DURATION_MS} from '@duro-app/tokens/keys'
import {styles} from './styles.css'
import {nativeStyles} from './native.css'
import {matchesQuery, useComboboxState} from './comboboxState'
import {Drawer} from '../Drawer/Drawer'
import {Listbox} from '../Listbox/Listbox'
import {sheetStyles} from '../Listbox/native.css'
import {Button} from '../Button/Button'
import {Icon} from '../Icon/Icon'
import {Chevron} from '../SideNav/Chevron'
import {focusForAccessibility} from '../../shared/accessibilityFocus'
import {focusInput} from '../../shared/focusInput'
import {textOf} from '../../shared/textOf'

/** The picker sheet's detents (plan N0, Decision 5); a Combobox opens at large. */
const SNAP_POINTS = ['medium', 'large'] as const

interface NativeComboboxContextValue {
  value: string | null
  open: boolean
  setOpen: (open: boolean) => void
  choose: (value: string) => void
  labels: Record<string, string>
  registerLabel: (value: string, label: string) => void
  /** The labels of the Items rendered now, by value: what Empty matches against */
  items: ReadonlyMap<string, string>
  registerItem: (value: string, label: string) => () => void
  /** What is typed in the sheet's search field */
  query: string
  setQuery: (query: string) => void
  /** The field's placeholder, also the search field's */
  placeholder: string | undefined
  setPlaceholder: (placeholder: string | undefined) => void
  listboxId: string
  triggerRef: RefObject<unknown>
}

const ComboboxContext = createContext<NativeComboboxContextValue | null>(null)

function useCombobox() {
  const ctx = useContext(ComboboxContext)
  if (!ctx) throw new Error('Combobox compound components must be used within Combobox.Root')
  return ctx
}

/** True while Popup renders its items unseen, so each registers its label. */
const CollectContext = createContext(false)

interface RootProps {
  /** The web's hidden form input; native has no form post. */
  name?: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string | null) => void
  /** The field's text: the chosen option's label on native */
  inputValue?: string
  onInputChange?: (value: string) => void
  initialLabels?: Record<string, string>
  children: ReactNode
}

/**
 * Native Combobox (plan N0, Slice C): the field opens a bottom sheet at its
 * large detent, above the keyboard, with a search field pinned under the
 * header and focused; the list below filters as you type, and a press picks
 * an option and closes the sheet (C0 direction A, "Check"). The search text
 * is the sheet's own and starts empty each time it opens.
 */
function Root({
  defaultValue,
  value,
  onValueChange,
  inputValue,
  onInputChange,
  initialLabels,
  children,
}: RootProps) {
  const state = useComboboxState({
    defaultValue,
    value,
    onValueChange,
    inputValue,
    onInputChange,
    initialLabels,
  })
  const {open, setOpen, chooseValue} = state
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<ReadonlyMap<string, string>>(new Map())
  const registerItem = useCallback((itemValue: string, label: string) => {
    setItems((prev) => new Map(prev).set(itemValue, label))
    return () =>
      setItems((prev) => {
        const next = new Map(prev)
        next.delete(itemValue)
        return next
      })
  }, [])
  const [placeholder, setPlaceholder] = useState<string | undefined>(undefined)
  const listboxId = useId()
  const triggerRef = useRef<unknown>(null)

  const wasOpen = useRef(open)
  useEffect(() => {
    if (open !== wasOpen.current) setQuery('')
    if (wasOpen.current && !open) focusForAccessibility(triggerRef.current, 'Combobox')
    wasOpen.current = open
  }, [open])

  const ctx: NativeComboboxContextValue = {
    value: state.value,
    open,
    setOpen,
    choose: chooseValue,
    labels: state.labels,
    registerLabel: state.registerLabel,
    items,
    registerItem,
    query,
    setQuery,
    placeholder,
    setPlaceholder,
    listboxId,
    triggerRef,
  }

  return (
    <ComboboxContext.Provider value={ctx}>
      <Drawer.Root
        open={open}
        onOpenChange={setOpen}
        anchor="bottom"
        snapPoints={SNAP_POINTS}
        defaultSnapPoint="large"
      >
        <html.div style={[styles.root, nativeStyles.nativeFlex]}>{children}</html.div>
      </Drawer.Root>
    </ComboboxContext.Provider>
  )
}

/**
 * The closed field: the chosen option's label, or the placeholder. A press
 * opens the sheet, where the typing happens.
 */
function Input({placeholder, children}: {placeholder?: string; children?: ReactNode}) {
  const {value, labels, open, setOpen, setPlaceholder, triggerRef} = useCombobox()
  const display = value ? (labels[value] ?? value) : null

  useEffect(() => {
    setPlaceholder(placeholder)
  }, [placeholder, setPlaceholder])

  return (
    <Pressable
      ref={triggerRef as RefObject<never>}
      onPress={() => setOpen(true)}
      accessibilityRole="combobox"
      accessibilityLabel={display ?? placeholder}
      accessibilityState={{expanded: open}}
    >
      <html.div style={[styles.inputWrapper, nativeStyles.field]}>
        <html.span style={[nativeStyles.fieldText, !display && nativeStyles.fieldPlaceholder]}>
          {display ?? placeholder}
        </html.span>
        {children}
        <html.div style={nativeStyles.chevronDown}>
          <Chevron color="textMuted" />
        </html.div>
      </html.div>
    </Pressable>
  )
}

/** The web's open/close button; on native the whole field opens the sheet. */
function Trigger(_props: {children?: ReactNode}) {
  return null
}

interface PopupProps {
  children: ReactNode
  /** The sheet's title (native) and the list's accessible name. */
  label?: string
  /** The sheet header's text button that closes it unchanged (native). Default: 'Cancel' */
  cancelLabel?: string
}

function Popup({children, label, cancelLabel = 'Cancel'}: PopupProps) {
  const {open, choose, query, setQuery, placeholder, listboxId} = useCombobox()
  const inputRef = useRef<unknown>(null)

  // Focus the search field once the sheet has entered: a TextInput's
  // autoFocus fires on mount, before iOS has presented the Modal.
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => focusInput(inputRef.current), DURATION_MS.base)
    return () => clearTimeout(timer)
  }, [open])

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
        <html.div style={sheetStyles.search}>
          <Icon name="search" size="sm" color="textMuted" />
          <html.input
            ref={inputRef as Ref<never>}
            type="search"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={query}
            placeholder={placeholder}
            aria-label={label ?? placeholder}
            onChange={(e: {target: {value: string}}) => setQuery(e.target.value)}
            style={sheetStyles.searchInput}
          />
        </html.div>
        <Drawer.Body flush>
          <Listbox.Root id={listboxId} open={open} onSelect={choose} aria-label={label}>
            {children}
          </Listbox.Root>
        </Drawer.Body>
      </Drawer.Portal>
    </>
  )
}

interface ItemProps {
  value: string
  children: ReactNode
}

function Item({value: itemValue, children}: ItemProps) {
  const collecting = useContext(CollectContext)
  const {value, labels, query, registerLabel, registerItem} = useCombobox()
  const label = textOf(children)
  useEffect(() => {
    if (collecting && label) registerLabel(itemValue, label)
  }, [collecting, itemValue, label, registerLabel])
  useEffect(() => {
    if (collecting) return registerItem(itemValue, label || itemValue)
  }, [collecting, itemValue, label, registerItem])
  if (collecting || !matchesQuery(labels[itemValue] ?? label, query)) return null
  return (
    <Listbox.Option value={itemValue} selected={value === itemValue}>
      {children}
    </Listbox.Option>
  )
}

function ItemText({children}: {children: ReactNode}) {
  return <html.span>{children}</html.span>
}

/** Shown under the search field when nothing matches what is typed. */
function Empty({children}: {children: ReactNode}) {
  const collecting = useContext(CollectContext)
  const {query, items} = useCombobox()
  if (collecting) return null
  // Only the Items rendered now count: an initialLabels entry with no Item
  // would otherwise hide Empty while the list shows nothing.
  const anyMatch = [...items.values()].some((label) => matchesQuery(label, query))
  if (anyMatch) return null
  return <Listbox.Empty>{children}</Listbox.Empty>
}

export const Combobox = {
  Root,
  Input,
  Trigger,
  Popup,
  Item,
  ItemText,
  Empty,
}
