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
  const [highlightedId, setHighlightedState] = useState<string | null>(null)
  const highlightedRef = useRef<string | null>(null)
  const setHighlightedId = useCallback((id: string | null) => {
    highlightedRef.current = id
    setHighlightedState(id)
  }, [])
  // The list opens with every option while the field shows the chosen
  // option's label; the label only filters once it is edited.
  const query = value && inputValue === labels[value] ? '' : inputValue
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const refocusAfterChooseRef = useRef(false)
  // The list's items mount after the open, so the highlight they should take
  // is settled as they register.
  const pendingHighlightRef = useRef(false)
  const valueRef = useRef(value)
  useEffect(() => {
    valueRef.current = value
  })
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const itemsRef = useRef(new Map<string, {value: string; element: HTMLElement}>())
  const orderRef = useRef<string[]>([])

  const cancelBlurClose = useCallback(() => {
    if (blurTimerRef.current !== null) clearTimeout(blurTimerRef.current)
    blurTimerRef.current = null
  }, [])

  useEffect(() => cancelBlurClose, [cancelBlurClose])

  const close = useCallback(() => {
    setOpen(false)
    pendingHighlightRef.current = false
    setHighlightedId(null)
  }, [setOpen, setHighlightedId])

  const openPopup = useCallback(() => {
    setOpen(true)
    pendingHighlightRef.current = true
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
    if (found) pendingHighlightRef.current = false
  }, [value, setOpen, setHighlightedId])

  // Focus opens the list, except the refocus that follows choosing an option.
  const onInputFocus = useCallback(() => {
    cancelBlurClose()
    if (refocusAfterChooseRef.current) return
    openPopup()
  }, [cancelBlurClose, openPopup])

  // Delay close to allow an item click to register.
  const onInputBlur = useCallback(() => {
    cancelBlurClose()
    blurTimerRef.current = setTimeout(() => {
      blurTimerRef.current = null
      close()
    }, 150)
  }, [cancelBlurClose, close])

  // Choosing keeps focus in the input (the web's editable combobox).
  const selectValue = useCallback(
    (itemValue: string) => {
      cancelBlurClose()
      chooseValue(itemValue)
      setHighlightedId(null)
      refocusAfterChooseRef.current = true
      try {
        inputRef.current?.focus()
      } finally {
        refocusAfterChooseRef.current = false
      }
    },
    [chooseValue, cancelBlurClose, setHighlightedId],
  )

  const registerItem = useCallback(
    (id: string, itemValue: string, element: HTMLElement) => {
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
      if (pendingHighlightRef.current) {
        if (itemValue === valueRef.current) {
          pendingHighlightRef.current = false
          setHighlightedId(id)
        } else if (highlightedRef.current === null) {
          setHighlightedId(ids[0] ?? null)
        }
      }
      return () => {
        itemsRef.current.delete(id)
        orderRef.current = orderRef.current.filter((i) => i !== id)
      }
    },
    [setHighlightedId],
  )

  // Get visible items (those matching the filter)
  const getVisibleOrder = useCallback(() => {
    if (!query) return orderRef.current
    return orderRef.current.filter((id) => {
      const item = itemsRef.current.get(id)
      return item ? matchesQuery(labels[item.value] ?? item.value, query) : false
    })
  }, [query, labels])

  // Keyboard navigation
  useEffect(() => {
    const root = rootRef.current
    if (!root || !open) return

    function handleKeyDown(e: KeyboardEvent) {
      pendingHighlightRef.current = false
      const visibleOrder = getVisibleOrder()
      if (visibleOrder.length === 0 && e.key !== 'Escape' && e.key !== 'Tab') return

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          const idx = highlightedRef.current ? visibleOrder.indexOf(highlightedRef.current) : -1
          setHighlightedId(visibleOrder[(idx + 1) % visibleOrder.length] ?? null)
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          const idx = highlightedRef.current ? visibleOrder.indexOf(highlightedRef.current) : 0
          setHighlightedId(
            visibleOrder[(idx - 1 + visibleOrder.length) % visibleOrder.length] ?? null,
          )
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
          const highlighted = highlightedRef.current
          if (highlighted) {
            // A highlighted option the filter has hidden is never committed.
            const item = visibleOrder.includes(highlighted)
              ? itemsRef.current.get(highlighted)
              : undefined
            if (item) selectValue(item.value)
          } else if (!inputValue.trim()) {
            // Empty input + Enter = clear selection (reset to "All")
            selectValue('')
          }
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
  }, [open, close, selectValue, getVisibleOrder, inputValue, setHighlightedId])

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
      query,
      setInputValue,
      onInputFocus,
      onInputBlur,
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
      query,
      setInputValue,
      onInputFocus,
      onInputBlur,
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
