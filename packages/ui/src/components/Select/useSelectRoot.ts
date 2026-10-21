import {useState, useCallback, useMemo, useRef, useId, useEffect} from 'react'
import type {SelectContextValue} from './SelectContext'
import {useSelectState, type SelectStateOptions} from './selectState'

/**
 * The web adapter over the shared Select state: the highlighted option,
 * document order, keys and DOM focus (the WAI-ARIA select-only combobox).
 */
export function useSelectRoot(options: SelectStateOptions) {
  const {value, setValue, open, setOpen, labels, registerLabel} = useSelectState(options)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const itemsRef = useRef(
    new Map<string, {value: string; element: HTMLElement; disabled: boolean}>(),
  )
  const orderRef = useRef<string[]>([])
  // What the keys move through: the options in document order, without the disabled ones.
  const enabledOrder = useCallback(
    () => orderRef.current.filter((id) => !itemsRef.current.get(id)?.disabled),
    [],
  )

  const close = useCallback(() => {
    setOpen(false)
    setHighlightedId(null)
    triggerRef.current?.focus()
  }, [setOpen])

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        const items = itemsRef.current
        const order = enabledOrder()
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
  }, [value, setOpen, enabledOrder])

  const registerItem = useCallback(
    (id: string, itemValue: string, element: HTMLElement, disabled = false) => {
      itemsRef.current.set(id, {value: itemValue, element, disabled})
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
    },
    [],
  )

  // Closed: ArrowDown/ArrowUp on the trigger open the listbox (the APG
  // select-only combobox), on the selected option or the first. In a Toolbar
  // this is why a closed Select keeps those keys; Left/Right still move on.
  useEffect(() => {
    const root = rootRef.current
    if (!root || open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target !== triggerRef.current) return
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      if (e.altKey || e.ctrlKey || e.metaKey) return
      e.preventDefault()
      toggle()
    }
    root.addEventListener('keydown', handleKeyDown)
    return () => root.removeEventListener('keydown', handleKeyDown)
  }, [open, toggle])

  // Native keydown for full KeyboardEvent access (preventDefault)
  useEffect(() => {
    const root = rootRef.current
    if (!root || !open) return

    function handleKeyDown(e: KeyboardEvent) {
      const order = enabledOrder()
      const items = itemsRef.current
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (order.length === 0 && e.key !== 'Tab') return

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          setHighlightedId((prev) => {
            const idx = prev ? order.indexOf(prev) : -1
            return order[(idx + 1) % order.length]
          })
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          setHighlightedId((prev) => {
            const idx = prev ? order.indexOf(prev) : 0
            return order[(idx - 1 + order.length) % order.length]
          })
          break
        }
        case 'Home': {
          e.preventDefault()
          setHighlightedId(order[0])
          break
        }
        case 'End': {
          e.preventDefault()
          setHighlightedId(order[order.length - 1])
          break
        }
        case 'Enter':
        case ' ': {
          e.preventDefault()
          setHighlightedId((prev) => {
            if (prev) {
              const item = items.get(prev)
              if (item && !item.disabled) {
                setValue(item.value)
                close()
              }
            }
            return prev
          })
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
  }, [open, close, setValue, enabledOrder])

  const ctx: SelectContextValue = useMemo(
    () => ({
      open,
      disabled: false,
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
    [
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
    ],
  )

  return {ctx, rootRef}
}
