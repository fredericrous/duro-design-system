import {type ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {html} from 'react-strict-dom'
import type {Orientation} from '../../shared/types'
import {useOrderedRegistry} from '../../shared/useOrderedRegistry'
import {ToolbarContext, type ToolbarContextValue} from './ToolbarContext'
import {styles} from './styles.css'

export interface ToolbarProps {
  /** Names the toolbar ("Formatting"). Required: a toolbar is a landmark-like widget. */
  'aria-label': string
  /**
   * Arrow keys follow the orientation: Left/Right (default) or Up/Down. A
   * vertical toolbar cannot hold a Select, whose closed trigger opens on
   * ArrowDown/ArrowUp.
   */
  orientation?: Orientation
  children: ReactNode
}

/**
 * A row of controls with one tab stop (the WAI-ARIA toolbar pattern). Every
 * Button, Toggle and Select/Menu/Popover trigger inside it, through any
 * ButtonGroup, joins one roving tabindex: Tab enters at the last focused
 * control, Left/Right (Up/Down when vertical) move, Home/End jump to the ends.
 */
export function Toolbar({
  'aria-label': ariaLabel,
  orientation = 'horizontal',
  children,
}: ToolbarProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const {elements, order, register} = useOrderedRegistry()
  const [focusedId, setFocusedId] = useState<string | null>(null)

  const enabled = order.filter((entry) => !entry.disabled)
  const tabStop =
    focusedId !== null && enabled.some((entry) => entry.id === focusedId)
      ? focusedId
      : (enabled[0]?.id ?? null)

  const tabIndexOf = useCallback<ToolbarContextValue['tabIndexOf']>(
    (id) => {
      if (!order.some((entry) => entry.id === id)) return undefined
      return id === tabStop ? 0 : -1
    },
    [order, tabStop],
  )

  // One listener on the document, in the bubble phase, so it runs after the
  // controls' own handlers (React dispatches from the app root, below the
  // document). It acts only on a key aimed at one of this toolbar's own
  // registered controls, so keys typed in a portalled popup (a Popover's
  // input) never move toolbar focus. A control whose popup is open
  // (aria-expanded="true") keeps its keys, and so does one that already
  // handled the key (defaultPrevented).
  useEffect(() => {
    const doc = rootRef.current?.ownerDocument
    if (!doc) return
    const [prev, next] =
      orientation === 'vertical' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      const els = order
        .filter((entry) => !entry.disabled)
        .map((entry) => elements.current.get(entry.id)?.el)
        .filter((el): el is HTMLElement => el !== undefined)
      const target = e.target as HTMLElement
      const i = els.indexOf(target)
      if (i < 0 || target.getAttribute('aria-expanded') === 'true') return
      let to: HTMLElement | undefined
      switch (e.key) {
        case next:
          to = els[Math.min(i + 1, els.length - 1)]
          break
        case prev:
          to = els[Math.max(i - 1, 0)]
          break
        case 'Home':
          to = els[0]
          break
        case 'End':
          to = els[els.length - 1]
          break
        default:
          return
      }
      e.preventDefault()
      to?.focus()
    }
    doc.addEventListener('keydown', onKeyDown)
    return () => doc.removeEventListener('keydown', onKeyDown)
  }, [order, orientation, elements])

  const ctx = useMemo<ToolbarContextValue>(
    () => ({register, tabIndexOf, onItemFocus: setFocusedId}),
    [register, tabIndexOf],
  )

  return (
    <ToolbarContext.Provider value={ctx}>
      <html.div
        ref={rootRef}
        role="toolbar"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        style={[styles.root, orientation === 'vertical' && styles.vertical]}
      >
        {children}
      </html.div>
    </ToolbarContext.Provider>
  )
}
