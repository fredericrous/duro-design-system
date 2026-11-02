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

function isMoved(panel: HTMLElement): boolean {
  return panel.style.left !== '' || panel.style.top !== ''
}

/** The inset a moved pane keeps from the window edge: the same gap a floating pane rests at. */
const EDGE_GAP_PX = SPACING_PX.md

/**
 * Places the panel at offset (x, y), clamped so it stays inside the window less the edge gap. The
 * default place is found from the panel's rectangle less its current offset, so this works from
 * any place. The window is the layout viewport (clientWidth), so a classic scrollbar is not covered.
 */
export function placePanel(panel: HTMLElement, x: number, y: number) {
  const rect = panel.getBoundingClientRect()
  const current = offsetOf(panel)
  const baseLeft = rect.left - current.x
  const baseTop = rect.top - current.y
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight
  const minX = EDGE_GAP_PX - baseLeft
  const maxX = width - EDGE_GAP_PX - baseLeft - rect.width
  const minY = EDGE_GAP_PX - baseTop
  const maxY = height - EDGE_GAP_PX - baseTop - rect.height
  // A pane wider than the room left keeps its start edge in view.
  const clampX = Math.max(minX, Math.min(x, maxX))
  const clampY = Math.max(minY, Math.min(y, maxY))
  panel.style.left = `${clampX}px`
  panel.style.top = `${clampY}px`
  watchSize(panel)
}

/** Back to the default place, the one the Drawer gave it. */
export function resetPanel(panel: HTMLElement) {
  panel.style.left = ''
  panel.style.top = ''
}

/** Where the Move menu can send the pane: to either edge of the window, or back to its default place. */
export type PanePlace = 'start' | 'end' | 'default'

export function movePanelTo(panel: HTMLElement, place: PanePlace) {
  if (place === 'default') {
    resetPanel(panel)
    return
  }
  // A far offset is clamped to the edge: the start edge on the left, the end edge on the right.
  const far = place === 'start' ? -Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER
  placePanel(panel, far, offsetOf(panel).y)
}

// A moved pane that grows (Expand, a detent) could push itself off screen: each moved panel is
// placed again at its own offset when its size changes.
const watched = new WeakSet<HTMLElement>()
let sizeObserver: ResizeObserver | null = null

function watchSize(panel: HTMLElement) {
  if (watched.has(panel) || typeof ResizeObserver === 'undefined') return
  sizeObserver ??= new ResizeObserver((entries) => {
    for (const entry of entries) {
      const moved = entry.target as HTMLElement
      if (isMoved(moved)) {
        const offset = offsetOf(moved)
        placePanel(moved, offset.x, offset.y)
      }
    }
  })
  watched.add(panel)
  sizeObserver.observe(panel)
}

/** The arrow keys' step, and Shift's larger one: spacing tokens, so a nudge is the same on every screen. */
export const NUDGE_PX = SPACING_PX.md
export const LARGE_NUDGE_PX = SPACING_PX.xxxl

const KEY_DIRECTIONS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

/** The part of a key press a move reads. */
interface MoveKey {
  key: string
  shiftKey: boolean
}

/** Keyboard moves for the Pane.Move control. Returns false for a key that does not move the panel. */
export function moveWithKey(panel: HTMLElement, {key, shiftKey}: MoveKey): boolean {
  if (key === 'Home') {
    resetPanel(panel)
    return true
  }
  const direction = KEY_DIRECTIONS[key]
  if (!direction) return false
  const step = shiftKey ? LARGE_NUDGE_PX : NUDGE_PX
  const current = offsetOf(panel)
  placePanel(panel, current.x + direction[0] * step, current.y + direction[1] * step)
  return true
}

const CONTROL = 'button, a, input, textarea, select, [role="button"]'

/** The header a pointer event started on, unless it started on a control in that header. */
function handleOf(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null
  const handle = target.closest<HTMLElement>('[data-pane-handle]')
  if (!handle || target.closest(CONTROL)) return null
  return handle
}

interface PaneDragOptions {
  /** Whether a header drag moves the pane: a movable side pane only. */
  enabled: boolean
}

/**
 * Pointer drags on a movable Pane's header move its panel. The listeners are on the document, so
 * they follow the panel however often the Drawer remounts it. A press on a control in the header is
 * the control's, not a drag; a double-click on the header puts the pane back.
 */
export function usePaneDrag({enabled}: PaneDragOptions) {
  useEffect(() => {
    if (!enabled) return
    let drag: {
      panel: HTMLElement
      handle: HTMLElement
      startX: number
      startY: number
      from: {x: number; y: number}
    } | null = null

    function end() {
      if (!drag) return
      drag.handle.style.cursor = ''
      drag = null
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return
      const handle = handleOf(e.target)
      const panel = handle && panelOf(handle)
      if (!handle || !panel) return
      drag = {panel, handle, startX: e.clientX, startY: e.clientY, from: offsetOf(panel)}
      handle.style.cursor = 'grabbing'
    }

    function onPointerMove(e: PointerEvent) {
      if (!drag) return
      // A release outside the window never reaches us: no primary button down means the drag is over.
      if ((e.buttons & 1) === 0) {
        end()
        return
      }
      placePanel(
        drag.panel,
        drag.from.x + e.clientX - drag.startX,
        drag.from.y + e.clientY - drag.startY,
      )
    }

    function onDoubleClick(e: MouseEvent) {
      const handle = handleOf(e.target)
      const panel = handle && panelOf(handle)
      if (panel) resetPanel(panel)
    }

    // The window shrinking can leave a moved pane outside it: place every moved pane again.
    function onResize() {
      document.querySelectorAll<HTMLElement>('[role="dialog"]').forEach((panel) => {
        if (isMoved(panel)) {
          const offset = offsetOf(panel)
          placePanel(panel, offset.x, offset.y)
        }
      })
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', end)
    document.addEventListener('pointercancel', end)
    document.addEventListener('dblclick', onDoubleClick)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', end)
      document.removeEventListener('pointercancel', end)
      document.removeEventListener('dblclick', onDoubleClick)
      window.removeEventListener('resize', onResize)
    }
  }, [enabled])
}
