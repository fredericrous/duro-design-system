import {useEffect, useState, type RefObject} from 'react'
import {breakpointsPx, type Breakpoint} from '@duro-app/tokens/tokens/breakpoints.css'

/**
 * Whether the element behind `ref` is narrower than a Duro breakpoint — its
 * own width, as a container query sees it, not the window's. For the choices
 * CSS cannot make (a table of contents as a list or a menu, a row of buttons
 * or an overflow `Menu`).
 *
 * `false` on the server and until the first measurement, so the server and
 * the first client render agree on the wide layout; a ResizeObserver then
 * follows the element. A width of 0 (the element is not laid out, e.g.
 * `display: none`) keeps the last answer.
 *
 * Narrower than means `width < breakpoint`: at exactly 768px an element is not
 * below `md`, the same line `Grid`'s named layouts collapse on.
 */
export function useContainerBelow(
  ref: RefObject<HTMLElement | null>,
  breakpoint: Breakpoint,
): boolean {
  const [below, setBelow] = useState(false)
  const limit = breakpointsPx[breakpoint]

  useEffect(() => {
    const element = ref.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width
      if (width > 0) setBelow(width < limit)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, limit])

  return below
}
