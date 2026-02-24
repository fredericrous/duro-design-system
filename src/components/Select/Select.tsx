import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useId,
  useEffect,
} from "react"
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
  listboxId: string
  highlightedId: string | null
  setHighlightedId: (id: string | null) => void
  registerItem: (id: string, value: string, element: HTMLElement) => () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
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

function Root({ name, defaultValue, value: controlledValue, onValueChange, children }: RootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? null)
  const [open, setOpen] = useState(false)
  const [labels] = useState(() => new Map<string, string>())
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const itemsRef = useRef(new Map<string, { value: string; element: HTMLElement }>())
  const orderRef = useRef<string[]>([])

  const value = controlledValue !== undefined ? controlledValue : internalValue

  const close = useCallback(() => {
    setOpen(false)
    setHighlightedId(null)
    triggerRef.current?.focus()
  }, [])

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        // On open, highlight the currently selected item
        const items = itemsRef.current
        const order = orderRef.current
        let found: string | null = null
        for (const id of order) {
          const item = items.get(id)
          if (item && item.value === value) {
            found = id
            break
          }
        }
        setHighlightedId(found ?? (order.length > 0 ? order[0] : null))
      } else {
        setHighlightedId(null)
      }
      return !prev
    })
  }, [value])

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

  const registerItem = useCallback((id: string, itemValue: string, element: HTMLElement) => {
    itemsRef.current.set(id, { value: itemValue, element })
    // Rebuild order sorted by DOM position
    const map = itemsRef.current
    const ids = [...map.keys()]
    ids.sort((a, b) => {
      const elA = map.get(a)?.element
      const elB = map.get(b)?.element
      if (!elA || !elB) return 0
      return elA.compareDocumentPosition(elB) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    })
    orderRef.current = ids
    return () => {
      itemsRef.current.delete(id)
      orderRef.current = orderRef.current.filter((i) => i !== id)
    }
  }, [])

  // Native keydown for full KeyboardEvent access (preventDefault)
  useEffect(() => {
    const root = rootRef.current
    if (!root || !open) return

    function handleKeyDown(e: KeyboardEvent) {
      const order = orderRef.current
      const items = itemsRef.current
      if (order.length === 0) return

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault()
          setHighlightedId((prev) => {
            const idx = prev ? order.indexOf(prev) : -1
            return order[(idx + 1) % order.length]
          })
          break
        }
        case "ArrowUp": {
          e.preventDefault()
          setHighlightedId((prev) => {
            const idx = prev ? order.indexOf(prev) : 0
            return order[(idx - 1 + order.length) % order.length]
          })
          break
        }
        case "Home": {
          e.preventDefault()
          setHighlightedId(order[0])
          break
        }
        case "End": {
          e.preventDefault()
          setHighlightedId(order[order.length - 1])
          break
        }
        case "Enter":
        case " ": {
          e.preventDefault()
          setHighlightedId((prev) => {
            if (prev) {
              const item = items.get(prev)
              if (item) {
                setValue(item.value)
                close()
              }
            }
            return prev
          })
          break
        }
        case "Escape":
        case "Tab": {
          close()
          break
        }
      }
    }

    root.addEventListener("keydown", handleKeyDown)
    return () => root.removeEventListener("keydown", handleKeyDown)
  }, [open, close, setValue])

  const ctx = useMemo(
    () => ({
      open,
      toggle,
      close,
      value,
      setValue,
      labels,
      registerLabel,
      listboxId,
      highlightedId,
      setHighlightedId,
      registerItem,
      triggerRef,
    }),
    [open, toggle, close, value, setValue, labels, registerLabel, listboxId, highlightedId, registerItem],
  )

  return (
    <SelectContext.Provider value={ctx}>
      <html.div ref={rootRef} style={styles.root}>
        {name && <html.input type="hidden" name={name} value={value ?? ""} />}
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
  const display = value ? (labels.get(value) ?? value) : null

  return <html.span style={display ? styles.value : styles.placeholder}>{display ?? placeholder}</html.span>
}

// --- Icon ---
function Icon({ children }: { children?: ReactNode }) {
  return <html.span style={styles.icon}>{children ?? "\u25BE"}</html.span>
}

// --- Popup ---
function Popup({ children }: { children: ReactNode }) {
  const { open, close, listboxId } = useSelect()

  if (!open) return null

  return (
    <>
      <html.div style={styles.backdrop} onClick={close} />
      <html.div id={listboxId} role="listbox" style={styles.popup}>
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
  const { value: selectedValue, setValue, close, registerLabel, highlightedId, setHighlightedId, registerItem } =
    useSelect()
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const isSelected = selectedValue === itemValue
  const isHighlighted = highlightedId === id

  // Extract text content for the value display
  const textContent = typeof children === "string" ? children : typeof children === "number" ? String(children) : null
  if (textContent) {
    registerLabel(itemValue, textContent)
  }

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
