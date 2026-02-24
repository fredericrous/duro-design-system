import { type ReactNode, createContext, useContext, useState, useCallback, useMemo } from "react"
import { html } from "react-strict-dom"
import { styles } from "./styles.css"

// --- Context ---
interface SelectContextValue {
  open: boolean
  toggle: () => void
  close: () => void
  value: string | null
  setValue: (value: string) => void
  labels: Map<string, string>
  registerLabel: (value: string, label: string) => void
}

const SelectContext = createContext<SelectContextValue | null>(null)

function useSelect() {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error("Select compound components must be used within Select.Root")
  return ctx
}

// --- Root ---
interface RootProps {
  name?: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string | null) => void
  children: ReactNode
}

function Root({ defaultValue, value: controlledValue, onValueChange, children }: RootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? null)
  const [open, setOpen] = useState(false)
  const [labels] = useState(() => new Map<string, string>())

  const value = controlledValue !== undefined ? controlledValue : internalValue

  const toggle = useCallback(() => setOpen((v) => !v), [])
  const close = useCallback(() => setOpen(false), [])

  const setValue = useCallback(
    (v: string) => {
      if (controlledValue === undefined) {
        setInternalValue(v)
      }
      onValueChange?.(v)
    },
    [controlledValue, onValueChange],
  )

  const registerLabel = useCallback(
    (v: string, label: string) => {
      labels.set(v, label)
    },
    [labels],
  )

  const ctx = useMemo(
    () => ({ open, toggle, close, value, setValue, labels, registerLabel }),
    [open, toggle, close, value, setValue, labels, registerLabel],
  )

  return (
    <SelectContext.Provider value={ctx}>
      <html.div style={styles.root}>{children}</html.div>
    </SelectContext.Provider>
  )
}

// --- Trigger ---
function Trigger({ children }: { children: ReactNode }) {
  const { toggle } = useSelect()

  return (
    <html.button type="button" onClick={toggle} style={styles.trigger}>
      {children}
    </html.button>
  )
}

// --- Value ---
function Value({ placeholder }: { placeholder?: string }) {
  const { value, labels } = useSelect()
  const display = value ? (labels.get(value) ?? value) : null

  return <html.span style={display ? styles.value : styles.placeholder}>{display ?? placeholder}</html.span>
}

// --- Icon ---
function Icon({ children }: { children?: ReactNode }) {
  return <html.span style={styles.icon}>{children ?? "\u25BE"}</html.span>
}

// --- Popup ---
function Popup({ children }: { children: ReactNode }) {
  const { open, close } = useSelect()

  if (!open) return null

  return (
    <>
      <html.div style={styles.backdrop} onClick={close} />
      <html.div role="listbox" style={styles.popup}>
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
  const { value: selectedValue, setValue, close, registerLabel } = useSelect()
  const isSelected = selectedValue === itemValue

  // Extract text content for the value display
  const textContent = typeof children === "string" ? children : typeof children === "number" ? String(children) : null
  if (textContent) {
    registerLabel(itemValue, textContent)
  }

  const handleClick = () => {
    setValue(itemValue)
    close()
  }

  return (
    <html.div
      role="option"
      aria-selected={isSelected}
      onClick={handleClick}
      style={[styles.item, isSelected && styles.itemSelected]}
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
