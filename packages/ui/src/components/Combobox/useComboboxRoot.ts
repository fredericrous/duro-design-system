import {useState, useCallback, useMemo, useRef, useId, useEffect} from 'react'
import {useControllableValue} from '../../hooks/useControllableValue'
import type {ComboboxContextValue} from './ComboboxContext'

interface UseComboboxRootOptions {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string | null) => void
  inputValue?: string
  onInputChange?: (value: string) => void
  initialLabels?: Record<string, string>
}

export function useComboboxRoot({
  defaultValue,
  value: controlledValue,
  onValueChange,
  inputValue: controlledInputValue,
  onInputChange,
  initialLabels,
}: UseComboboxRootOptions) {
  const [value, setValue] = useControllableValue<string | null>(
    controlledValue,
    defaultValue ?? null,
    onValueChange,
  )
  const [internalInputValue, setInternalInputValue] = useState('')
  const inputValue = controlledInputValue !== undefined ? controlledInputValue : internalInputValue
  const setInputValue = useCallback(
    (v: string) => {
      if (controlledInputValue === undefined) setInternalInputValue(v)
      onInputChange?.(v)
    },
    [controlledInputValue, onInputChange],
  )

  const [open, setOpen] = useState(false)
  const [labels, setLabels] = useState<Record<string, string>>(initialLabels ?? {})
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const itemsRef = useRef(new Map<string, {value: string; element: HTMLElement}>())
  const orderRef = useRef<string[]>([])

  const close = useCallback(() => {
    setOpen(false)
    setHighlightedId(null)
  }, [])

  const openPopup = useCallback(() => {
    setOpen(true)
    // Highlight the selected item or first visible item
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
  }, [value])

  const selectValue = useCallback(
    (itemValue: string) => {
      setValue(itemValue)
      // Set input to show the selected label
      const label = labels[itemValue] ?? itemValue
      setInputValue(label)
      close()
      inputRef.current?.focus()
    },
    [setValue, labels, setInputValue, close],
  )

  const registerLabel = useCallback((v: string, label: string) => {
    setLabels((prev) => {
      if (prev[v] === label) return prev
      return {...prev, [v]: label}
    })
  }, [])

  const registerItem = useCallback((id: string, itemValue: string, element: HTMLElement) => {
    itemsRef.current.set(id, {value: itemValue, element})
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

  // Get visible items (those matching the filter)
  const getVisibleOrder = useCallback(() => {
    const query = inputValue.toLowerCase()
    if (!query) return orderRef.current
    return orderRef.current.filter((id) => {
      const item = itemsRef.current.get(id)
      if (!item) return false
      const label = labels[item.value] ?? item.value
      return label.toLowerCase().includes(query)
    })
  }, [inputValue, labels])

  // Keyboard navigation
  useEffect(() => {
    const root = rootRef.current
    if (!root || !open) return

    function handleKeyDown(e: KeyboardEvent) {
      const visibleOrder = getVisibleOrder()
      if (visibleOrder.length === 0 && e.key !== 'Escape' && e.key !== 'Tab') return

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          if (!open) {
            setOpen(true)
            return
          }
          setHighlightedId((prev) => {
            const idx = prev ? visibleOrder.indexOf(prev) : -1
            return visibleOrder[(idx + 1) % visibleOrder.length] ?? null
          })
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          setHighlightedId((prev) => {
            const idx = prev ? visibleOrder.indexOf(prev) : 0
            return visibleOrder[(idx - 1 + visibleOrder.length) % visibleOrder.length] ?? null
          })
          break
        }
        case 'Home': {
          e.preventDefault()
          setHighlightedId(visibleOrder[0] ?? null)
          break
        }
        case 'End': {
          e.preventDefault()
          setHighlightedId(visibleOrder[visibleOrder.length - 1] ?? null)
          break
        }
        case 'Enter': {
          e.preventDefault()
          setHighlightedId((prev) => {
            if (prev) {
              const item = itemsRef.current.get(prev)
              if (item) selectValue(item.value)
            } else if (!inputValue.trim()) {
              // Empty input + Enter = clear selection (reset to "All")
              selectValue('')
            }
            return prev
          })
          break
        }
        case 'Escape': {
          e.preventDefault()
          close()
          inputRef.current?.focus()
          break
        }
        case 'Tab': {
          close()
          break
        }
      }
    }

    root.addEventListener('keydown', handleKeyDown)
    return () => root.removeEventListener('keydown', handleKeyDown)
  }, [open, close, selectValue, getVisibleOrder])

  // Scroll highlighted item into view
  useEffect(() => {
    if (!highlightedId) return
    const item = itemsRef.current.get(highlightedId)
    item?.element.scrollIntoView({block: 'nearest'})
  }, [highlightedId])

  // Sync input value with selected label when value changes externally
  useEffect(() => {
    if (value && labels[value] && !open) {
      setInputValue(labels[value])
    }
  }, [value, labels, open, setInputValue])

  const ctx: ComboboxContextValue = useMemo(
    () => ({
      open,
      openPopup,
      close,
      value,
      setValue: selectValue,
      inputValue,
      setInputValue,
      labels,
      registerLabel,
      listboxId,
      highlightedId,
      setHighlightedId,
      registerItem,
      inputRef,
    }),
    [
      open,
      openPopup,
      close,
      value,
      selectValue,
      inputValue,
      setInputValue,
      labels,
      registerLabel,
      listboxId,
      highlightedId,
      setHighlightedId,
      registerItem,
    ],
  )

  return {ctx, rootRef}
}
