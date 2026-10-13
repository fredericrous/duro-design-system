import {useState, useCallback, useMemo, useRef, useId, useEffect} from 'react'
import type {ComboboxContextValue} from './ComboboxContext'
import {matchesQuery, useComboboxState, type ComboboxStateOptions} from './comboboxState'

/**
 * The web adapter over the shared Combobox state: the highlighted option,
 * document order, keys and DOM focus (the WAI-ARIA editable combobox).
 */
export function useComboboxRoot(options: ComboboxStateOptions) {
  const {value, inputValue, setInputValue, open, setOpen, labels, registerLabel, chooseValue} =
    useComboboxState(options)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const itemsRef = useRef(new Map<string, {value: string; element: HTMLElement}>())
  const orderRef = useRef<string[]>([])

  const close = useCallback(() => {
    setOpen(false)
    setHighlightedId(null)
  }, [setOpen])

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
  }, [value, setOpen])

  // Choosing keeps focus in the input (the web's editable combobox).
  const selectValue = useCallback(
    (itemValue: string) => {
      chooseValue(itemValue)
      setHighlightedId(null)
      inputRef.current?.focus()
    },
    [chooseValue],
  )

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
    if (!inputValue) return orderRef.current
    return orderRef.current.filter((id) => {
      const item = itemsRef.current.get(id)
      return item ? matchesQuery(labels[item.value] ?? item.value, inputValue) : false
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
      rootRef,
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
