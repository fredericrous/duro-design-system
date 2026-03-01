import { type ReactNode, useRef, useId, useEffect } from "react"
import { html } from "react-strict-dom"
import { styles } from "./styles.css"
import { SelectContext, useSelect } from "./SelectContext"
import { useSelectRoot } from "./useSelectRoot"

// --- Root ---
interface RootProps {
  name?: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string | null) => void
  children: ReactNode
}

function Root({ name, defaultValue, value, onValueChange, children }: RootProps) {
  const { ctx, rootRef } = useSelectRoot({ defaultValue, value, onValueChange })

  return (
    <SelectContext.Provider value={ctx}>
      <html.div ref={rootRef} style={styles.root}>
        {name && <html.input type="hidden" name={name} value={ctx.value ?? ""} />}
        {children}
      </html.div>
    </SelectContext.Provider>
  )
}

// --- Trigger ---
function Trigger({ children }: { children: ReactNode }) {
  const { open, toggle, listboxId, highlightedId, triggerRef } = useSelect()
  const localRef = useRef<HTMLButtonElement>(null)

  // Sync local ref to context triggerRef
  useEffect(() => {
    triggerRef.current = localRef.current
  })

  return (
    <html.button
      ref={localRef}
      type="button"
      role={"combobox" as "listbox"}
      onClick={toggle}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls={open ? listboxId : undefined}
      aria-activedescendant={highlightedId ?? undefined}
      style={styles.trigger}
    >
      {children}
    </html.button>
  )
}

// --- Value ---
function Value({ placeholder }: { placeholder?: string }) {
  const { value, labels } = useSelect()
  const display = value ? (labels[value] ?? value) : null

  return <html.span style={display ? styles.value : styles.placeholder}>{display ?? placeholder}</html.span>
}

// --- Icon ---
function Icon({ children }: { children?: ReactNode }) {
  return <html.span style={styles.icon}>{children ?? "\u25BE"}</html.span>
}

// --- Popup ---
function Popup({ children }: { children: ReactNode }) {
  const { open, close, listboxId } = useSelect()

  return (
    <>
      {open && <html.div style={styles.backdrop} onClick={close} />}
      <html.div
        id={listboxId}
        role="listbox"
        aria-hidden={!open}
        style={[styles.popup, !open && styles.hidden]}
      >
        {children}
      </html.div>
    </>
  )
}

// --- Item ---
interface ItemProps {
  value: string
  children: ReactNode
}

function Item({ value: itemValue, children }: ItemProps) {
  const {
    value: selectedValue,
    setValue,
    close,
    registerLabel,
    highlightedId,
    setHighlightedId,
    registerItem,
  } = useSelect()
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const isSelected = selectedValue === itemValue
  const isHighlighted = highlightedId === id

  // Register label from DOM text content (works with both string and JSX children)
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

  const handleClick = () => {
    setValue(itemValue)
    close()
  }

  return (
    <html.div
      ref={ref}
      id={id}
      role="option"
      aria-selected={isSelected}
      onClick={handleClick}
      onPointerEnter={() => setHighlightedId(id)}
      style={[styles.item, isSelected && styles.itemSelected, isHighlighted && styles.itemHighlighted]}
    >
      {children}
    </html.div>
  )
}

// --- ItemText ---
function ItemText({ children }: { children: ReactNode }) {
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
