import { useState, useCallback, useMemo, useRef, useId, useEffect } from "react"
import { useControllableValue } from "../../hooks/useControllableValue"
import type { SelectContextValue } from "./SelectContext"

interface UseSelectRootOptions {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string | null) => void
}

export function useSelectRoot({ defaultValue, value: controlledValue, onValueChange }: UseSelectRootOptions) {
  const [value, setValue] = useControllableValue<string | null>(controlledValue, defaultValue ?? null, onValueChange)
  const [open, setOpen] = useState(false)
  const [labels, setLabels] = useState<Record<string, string>>({})
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const itemsRef = useRef(new Map<string, { value: string; element: HTMLElement }>())
  const orderRef = useRef<string[]>([])

  const close = useCallback(() => {
    setOpen(false)
    setHighlightedId(null)
    triggerRef.current?.focus()
  }, [])

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
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

  const registerLabel = useCallback((v: string, label: string) => {
    setLabels((prev) => {
      if (prev[v] === label) return prev
      return { ...prev, [v]: label }
    })
  }, [])

  const registerItem = useCallback((id: string, itemValue: string, element: HTMLElement) => {
    itemsRef.current.set(id, { value: itemValue, element })
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

  const ctx: SelectContextValue = useMemo(
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
    [open, toggle, close, value, setValue, labels, registerLabel, listboxId, highlightedId, setHighlightedId, registerItem],
  )

  return { ctx, rootRef }
}
