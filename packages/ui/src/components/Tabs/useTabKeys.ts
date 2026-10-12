import {useEffect} from 'react'
import type {Orientation} from '../../shared/types'

interface TabKeysInput {
  listRef: React.RefObject<HTMLDivElement | null>
  orientation: Orientation
  activeValue: string | null
  onSelect: (value: string) => void
  tabsRef: React.RefObject<Map<string, boolean>>
  orderRef: React.RefObject<string[]>
}

/** Web: arrow keys, Home and End move the selection and focus along the list. */
export function useTabKeys({
  listRef,
  orientation,
  activeValue,
  onSelect,
  tabsRef,
  orderRef,
}: TabKeysInput) {
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const listEl = el

    function handleKeyDown(e: KeyboardEvent) {
      const order = orderRef.current
      const tabs = tabsRef.current
      if (order.length === 0) return

      const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
      const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'

      let targetValue: string | null = null

      switch (e.key) {
        case nextKey: {
          e.preventDefault()
          const currentIdx = activeValue ? order.indexOf(activeValue) : -1
          for (let i = 1; i <= order.length; i++) {
            const idx = (currentIdx + i) % order.length
            const val = order[idx]
            if (!tabs.get(val)) {
              targetValue = val
              break
            }
          }
          break
        }
        case prevKey: {
          e.preventDefault()
          const currentIdx = activeValue ? order.indexOf(activeValue) : 0
          for (let i = 1; i <= order.length; i++) {
            const idx = (currentIdx - i + order.length) % order.length
            const val = order[idx]
            if (!tabs.get(val)) {
              targetValue = val
              break
            }
          }
          break
        }
        case 'Home': {
          e.preventDefault()
          for (const val of order) {
            if (!tabs.get(val)) {
              targetValue = val
              break
            }
          }
          break
        }
        case 'End': {
          e.preventDefault()
          for (let i = order.length - 1; i >= 0; i--) {
            if (!tabs.get(order[i])) {
              targetValue = order[i]
              break
            }
          }
          break
        }
      }

      if (targetValue) {
        onSelect(targetValue)
        // Focus the newly activated tab button
        const tabEl = listEl.querySelector(
          `[data-tab-value="${targetValue}"]`,
        ) as HTMLElement | null
        tabEl?.focus()
      }
    }

    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [listRef, orientation, activeValue, onSelect, tabsRef, orderRef])
}
