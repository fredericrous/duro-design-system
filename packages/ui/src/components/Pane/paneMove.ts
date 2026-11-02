import {useEffect} from 'react'
import {SPACING_PX} from '@duro-app/tokens/keys'

// A movable Pane is moved by its offset: `left` and `top` on the panel, which is position: relative,
// so the Drawer's slide animation (a transform) is left alone. No offset means the default place.

/** The panel element of a Pane, from a node inside it. */
export function panelOf(node: Element): HTMLElement | null {
  return node.closest<HTMLElement>('[role="dialog"]')
}

function offsetOf(panel: HTMLElement): {x: number; y: number} {
  return {x: parseFloat(panel.style.left) || 0, y: parseFloat(panel.style.top) || 0}
}

/**
 * Places the panel at offset (x, y), clamped so it stays inside the window. The default place is
 * found from the panel's current rectangle less its current offset, so this works on any place.
 */
export function placePanel(panel: HTMLElement, x: number, y: number) {
  const rect = panel.getBoundingClientRect()
  const current = offsetOf(panel)
  const baseLeft = rect.left - current.x
  const baseTop = rect.top - current.y
  const clampX = Math.min(Math.max(x, -baseLeft), window.innerWidth - baseLeft - rect.width)
  const clampY = Math.min(Math.max(y, -baseTop), window.innerHeight - baseTop - rect.height)
  panel.style.left = `${clampX}px`
  panel.style.top = `${clampY}px`
}

/** Back to the default place, the one the Drawer gave it. */
export function resetPanel(panel: HTMLElement) {
  panel.style.left = ''
  panel.style.top = ''
}

/** The arrow keys' step: the spacing token, so a nudge is the same on every screen. */
export const NUDGE_PX = SPACING_PX.md

const KEY_STEPS: Record<string, [number, number]> = {
  ArrowLeft: [-NUDGE_PX, 0],
  ArrowRight: [NUDGE_PX, 0],
  ArrowUp: [0, -NUDGE_PX],
  ArrowDown: [0, NUDGE_PX],
}

/** Keyboard moves for the Pane.Move control. Returns false for a key that does not move the panel. */
export function moveWithKey(panel: HTMLElement, key: string): boolean {
  if (key === 'Home') {
    resetPanel(panel)
    return true
  }
  const step = KEY_STEPS[key]
  if (!step) return false
  const current = offsetOf(panel)
  placePanel(panel, current.x + step[0], current.y + step[1])
  return true
}

/**
 * Pointer drags on a movable Pane's header move its panel. The listener is on the document, so it
 * follows the panel however often the Drawer remounts it. A press on a control in the header is the
 * control's, not a drag.
 */
export function usePaneDrag(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    let drag: {
      panel: HTMLElement
      startX: number
      startY: number
      from: {x: number; y: number}
    } | null = null

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return
      const target = e.target as Element
      const handle = target.closest('[data-pane-handle]')
      if (!handle || target.closest('button, a, input, textarea, select, [role="button"]')) return
      const panel = panelOf(handle)
      if (!panel) return
      drag = {panel, startX: e.clientX, startY: e.clientY, from: offsetOf(panel)}
    }

    function onPointerMove(e: PointerEvent) {
      if (!drag) return
      placePanel(
        drag.panel,
        drag.from.x + e.clientX - drag.startX,
        drag.from.y + e.clientY - drag.startY,
      )
    }

    function onPointerEnd() {
      drag = null
    }

    // A double-click on the header puts the pane back where the Drawer gave it.
    function onDoubleClick(e: MouseEvent) {
      const target = e.target as Element
      const handle = target.closest('[data-pane-handle]')
      if (!handle || target.closest('button, a, input, textarea, select, [role="button"]')) return
      const panel = panelOf(handle)
      if (panel) resetPanel(panel)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerEnd)
    document.addEventListener('pointercancel', onPointerEnd)
    document.addEventListener('dblclick', onDoubleClick)
    return () => {
      document.removeEventListener('dblclick', onDoubleClick)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerEnd)
      document.removeEventListener('pointercancel', onPointerEnd)
    }
  }, [enabled])
}
