import {type ReactNode, useRef, useId, useEffect, useState} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {ComboboxContext, useCombobox} from './ComboboxContext'
import {useComboboxRoot} from './useComboboxRoot'

// --- Root ---
interface RootProps {
  name?: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string | null) => void
  inputValue?: string
  onInputChange?: (value: string) => void
  initialLabels?: Record<string, string>
  children: ReactNode
}

function Root({
  name,
  defaultValue,
  value,
  onValueChange,
  inputValue,
  onInputChange,
  initialLabels,
  children,
}: RootProps) {
  const {ctx, rootRef} = useComboboxRoot({
    defaultValue,
    value,
    onValueChange,
    inputValue,
    onInputChange,
    initialLabels,
  })

  return (
    <ComboboxContext.Provider value={ctx}>
      <html.div ref={rootRef} style={styles.root}>
        {name && <html.input type="hidden" name={name} value={ctx.value ?? ''} />}
        {children}
      </html.div>
    </ComboboxContext.Provider>
  )
}

// --- Input ---
function Input({placeholder, children}: {placeholder?: string; children?: ReactNode}) {
  const {open, openPopup, close, inputValue, setInputValue, listboxId, highlightedId, inputRef} =
    useCombobox()
  const localRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    inputRef.current = localRef.current
  })

  return (
    <html.div style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
      <html.input
        ref={localRef}
        type="text"
        role={'combobox' as 'listbox'}
        value={inputValue}
        placeholder={placeholder}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={highlightedId ?? undefined}
        aria-autocomplete={'list' as 'none'}
        autoComplete="off"
        style={styles.input}
        onFocus={() => {
          setFocused(true)
          openPopup()
        }}
        onBlur={() => {
          setFocused(false)
          // Delay close to allow item click to register
          setTimeout(close, 150)
        }}
        onChange={(e: any) => {
          setInputValue(e.target.value)
          if (!open) openPopup()
        }}
      />
      {children}
    </html.div>
  )
}

// --- Trigger ---
function Trigger({children}: {children?: ReactNode}) {
  const {open, openPopup, close, inputRef} = useCombobox()

  return (
    <html.button
      type="button"
      tabIndex={-1}
      aria-label={open ? 'Close' : 'Open'}
      onClick={() => {
        if (open) {
          close()
        } else {
          openPopup()
        }
        inputRef.current?.focus()
      }}
      style={styles.trigger}
    >
      {children ?? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      )}
    </html.button>
  )
}

// --- Popup ---
function Popup({children}: {children: ReactNode}) {
  const {open, listboxId} = useCombobox()

  if (!open) return null

  return (
    <html.div id={listboxId} role="listbox" style={styles.popup}>
      {children}
    </html.div>
  )
}

// --- Item ---
interface ItemProps {
  value: string
  children: ReactNode
}

function Item({value: itemValue, children}: ItemProps) {
  const {
    value: selectedValue,
    setValue,
    inputValue,
    labels,
    registerLabel,
    highlightedId,
    setHighlightedId,
    registerItem,
  } = useCombobox()
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const isSelected = selectedValue === itemValue
  const isHighlighted = highlightedId === id

  // Filter: check if this item matches the input
  const label = labels[itemValue] ?? itemValue
  const query = inputValue.toLowerCase()
  const isVisible = !query || label.toLowerCase().includes(query)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const text = el.textContent
    if (text) registerLabel(itemValue, text)
  }, [itemValue, registerLabel])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerItem(id, itemValue, el)
  }, [id, itemValue, registerItem])

  if (!isVisible) return null

  return (
    <html.div
      ref={ref}
      id={id}
      role="option"
      aria-selected={isSelected}
      onClick={() => setValue(itemValue)}
      onPointerEnter={() => setHighlightedId(id)}
      style={[
        styles.item,
        isSelected && styles.itemSelected,
        isHighlighted && styles.itemHighlighted,
      ]}
    >
      {children}
    </html.div>
  )
}

// --- ItemText ---
function ItemText({children}: {children: ReactNode}) {
  return <html.span>{children}</html.span>
}

// --- Empty ---
function Empty({children}: {children: ReactNode}) {
  const {open, inputValue, labels} = useCombobox()

  if (!open) return null

  // Check if any items are visible
  const query = inputValue.toLowerCase()
  const hasVisibleItems = query
    ? Object.values(labels).some((label) => label.toLowerCase().includes(query))
    : true

  if (hasVisibleItems) return null

  return <html.div style={styles.empty}>{children}</html.div>
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
