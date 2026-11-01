import {useEffect, useRef} from 'react'
import type {DrawerAnchor} from './parts'
import {DRAG_SLOP, SNAP_DURATION, settleWidth} from './sheetPhysics'

interface UseSideResizeOptions {
  anchor: DrawerAnchor
  /** The panel element itself, as in useSwipeDismiss: listeners follow the element that is shown. */
  panel: HTMLDivElement | null
  /** The widths the panel rests at, ascending; fewer than two means nothing to drag between. */
  widths: readonly number[]
  /** The detent the panel rests at */
  index: number
  /** A drag settled on another detent */
  onSnap: (index: number) => void
}

interface Drag {
  startX: number
  base: number
  moved: boolean
  growth: number
  time: number
  /** The previous move, so a release reads the speed at its end, as the native gesture does */
  previousGrowth: number
  previousTime: number
}

/**
 * Web: dragging a side drawer's grabber resizes the panel between its detents. The width follows
 * the pointer between the narrowest and the widest detent, and a release settles on one (a fling
 * moves one detent). A tap, under the slop, stays the grabber's click.
 */
export function useSideResize({anchor, panel, widths, index, onSnap}: UseSideResizeOptions) {
  // Read at event time, so a settle that re-renders mid-drag is never stale.
  const latest = useRef({widths, index, onSnap})
  latest.current = {widths, index, onSnap}
  const draggable = widths.length >= 2

  useEffect(() => {
    if (!panel || !draggable) return
    const grabber = panel.querySelector<HTMLElement>('[data-drawer-grabber]')
    if (!grabber) return
    let drag: Drag | null = null

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return
      drag = {
        startX: e.clientX,
        base: panel!.getBoundingClientRect().width,
        moved: false,
        growth: 0,
        time: Date.now(),
        previousGrowth: 0,
        previousTime: Date.now(),
      }
      try {
        grabber!.setPointerCapture(e.pointerId)
      } catch {
        // A synthetic pointer has nothing to capture; the drag then follows pointermove only while over the grabber.
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (!drag) return
      const dx = e.clientX - drag.startX
      if (!drag.moved) {
        if (Math.abs(dx) < DRAG_SLOP) return
        drag.moved = true
        panel!.style.transition = 'none'
      }
      e.preventDefault()
      // Dragging toward the page grows a right panel; away from the left edge grows a left one.
      drag.previousGrowth = drag.growth
      drag.previousTime = drag.time
      drag.growth = anchor === 'right' ? -dx : dx
      drag.time = Date.now()
      const {widths: sizes} = latest.current
      const width = Math.min(sizes[sizes.length - 1], Math.max(sizes[0], drag.base + drag.growth))
      panel!.style.width = `${width}px`
    }

    function onPointerUp() {
      const finished = drag
      drag = null
      if (!finished || !finished.moved) return
      // The drag is not a press: swallow the click that follows the release.
      const swallow = (event: Event) => event.stopPropagation()
      grabber!.addEventListener('click', swallow, {capture: true, once: true})
      setTimeout(() => grabber!.removeEventListener('click', swallow, true), 0)

      const {widths: sizes, index: from, onSnap: snap} = latest.current
      const elapsed = Math.max(1, finished.time - finished.previousTime)
      const target = settleWidth({
        widths: sizes,
        from,
        width: finished.base + finished.growth,
        velocity: (finished.growth - finished.previousGrowth) / elapsed,
      })
      const ease = `${SNAP_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`
      panel!.style.transition = `width ${ease}`
      panel!.style.width = `${sizes[target]}px`
      let settled = false
      const done = () => {
        if (settled) return
        settled = true
        snap(target)
        // React now sizes the panel at this detent: drop the inline copy.
        requestAnimationFrame(() => {
          panel!.style.transition = ''
          panel!.style.width = ''
        })
      }
      panel!.addEventListener('transitionend', done, {once: true})
      setTimeout(done, SNAP_DURATION + 50)
    }

    function onPointerCancel() {
      if (!drag) return
      drag = null
      panel!.style.transition = ''
      panel!.style.width = ''
    }

    grabber.addEventListener('pointerdown', onPointerDown)
    grabber.addEventListener('pointermove', onPointerMove)
    grabber.addEventListener('pointerup', onPointerUp)
    grabber.addEventListener('pointercancel', onPointerCancel)
    return () => {
      grabber.removeEventListener('pointerdown', onPointerDown)
      grabber.removeEventListener('pointermove', onPointerMove)
      grabber.removeEventListener('pointerup', onPointerUp)
      grabber.removeEventListener('pointercancel', onPointerCancel)
    }
  }, [panel, anchor, draggable])
}
