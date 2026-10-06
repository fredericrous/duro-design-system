import {useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject} from 'react'

const ROW_TOLERANCE = 2

function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

/**
 * Roving focus for a wrapping ToggleGroup (WAI-ARIA toolbar pattern): one tab
 * stop — the focused item, else the first pressed one, else the first — with
 * arrow keys in reading order, Up/Down by visual row, Home/End.
 */
export function useRovingFocus({
  enabled,
  pressed,
  rootRef,
}: {
  enabled: boolean
  pressed: string[]
  rootRef: RefObject<HTMLElement | null>
}) {
  const items = useRef(new Map<string, HTMLElement>())
  const [order, setOrder] = useState<string[]>([])
  const [focusedValue, setFocusedValue] = useState<string | null>(null)

  const sync = useCallback(() => {
    const entries = [...items.current.entries()].sort(([, a], [, b]) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    )
    const next = entries.map(([v]) => v)
    setOrder((prev) => (sameOrder(prev, next) ? prev : next))
  }, [])

  const register = useCallback(
    (value: string, el: HTMLElement) => {
      items.current.set(value, el)
      sync()
      return () => {
        if (items.current.get(value) === el) items.current.delete(value)
        sync()
      }
    },
    [sync],
  )

  // a focus holder that unmounted no longer holds the tab stop
  useLayoutEffect(() => {
    if (focusedValue !== null && !order.includes(focusedValue)) setFocusedValue(null)
  }, [order, focusedValue])

  const tabStopValue = !enabled
    ? null
    : focusedValue !== null && order.includes(focusedValue)
      ? focusedValue
      : (pressed.find((v) => order.includes(v)) ?? order[0] ?? null)

  // native listener: RSD's onKeyDown event is a reduced shape (as in Tree)
  useEffect(() => {
    const root = rootRef.current
    if (!enabled || !root) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const els = order
        .map((v) => items.current.get(v))
        .filter((el): el is HTMLElement => !!el && !(el as HTMLButtonElement).disabled)
      const i = els.indexOf(e.target as HTMLElement)
      if (i < 0) return
      let target: HTMLElement | undefined
      switch (e.key) {
        case 'ArrowRight':
          target = els[Math.min(i + 1, els.length - 1)]
          break
        case 'ArrowLeft':
          target = els[Math.max(i - 1, 0)]
          break
        case 'Home':
          target = els[0]
          break
        case 'End':
          target = els[els.length - 1]
          break
        case 'ArrowDown':
        case 'ArrowUp': {
          const down = e.key === 'ArrowDown'
          const cur = els[i].getBoundingClientRect()
          const cx = cur.left + cur.width / 2
          const rects = els.map((el) => el.getBoundingClientRect())
          // rows, by distinct top, in the direction of travel
          const tops = [...new Set(rects.map((r) => Math.round(r.top)))].sort((a, b) => a - b)
          const rowIdx = tops.findIndex((t) => Math.abs(t - cur.top) <= ROW_TOLERANCE)
          const nextTop = tops[rowIdx + (down ? 1 : -1)]
          if (nextTop === undefined) break
          let best = Infinity
          rects.forEach((r, k) => {
            if (Math.abs(r.top - nextTop) > ROW_TOLERANCE) return
            const d = Math.abs(r.left + r.width / 2 - cx)
            if (d < best) {
              best = d
              target = els[k]
            }
          })
          break
        }
        default:
          return
      }
      e.preventDefault()
      target?.focus()
    }
    root.addEventListener('keydown', onKeyDown)
    return () => root.removeEventListener('keydown', onKeyDown)
  }, [enabled, order, rootRef])

  return {
    tabStopValue,
    register,
    onItemFocus: setFocusedValue,
    items,
  }
}
