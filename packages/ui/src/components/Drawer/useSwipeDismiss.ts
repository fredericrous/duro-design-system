import {useRef, useCallback, useEffect} from 'react'
import type {DrawerAnchor} from './parts'
import {
  DISMISS_DURATION,
  DRAG_SLOP,
  SNAP_DURATION,
  SNAP_MAX_OVERSHOOT,
  rubberBand,
  settleDetent,
  shouldDismissEdge,
} from './sheetPhysics'

/**
 * Max pixels the panel visually "grows" when dragged in the opposite direction.
 * iOS-style: panel stays anchored to its edge, doesn't translate.
 * Instead we show a subtle shadow/scale hint capped at this value.
 */
const OPPOSITE_MAX_OVERSCROLL = 12

/** A bottom sheet's detents: the drag moves between them before it dismisses. */
export interface SwipeSnap {
  /** Each detent's height in px, ascending */
  heights: readonly number[]
  /** The detent the sheet rests at */
  index: number
  /** A drag settled on another detent */
  onSnap: (index: number) => void
}

interface UseSwipeDismissOptions {
  anchor: DrawerAnchor
  enabled: boolean
  onDismiss: () => void
  /**
   * The panel element itself, not a ref: a Drawer open from its first render
   * draws the panel inline, then remounts it into the portal once the mount
   * exists, and listeners must follow the element that is actually shown.
   */
  panel: HTMLDivElement | null
  /** Bottom anchor with snapPoints: drag between detents, dismiss below the lowest */
  snap?: SwipeSnap | null
}

interface SwipeState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  startTime: number
  swiping: boolean
  panelSize: number
  /** Inner Duro scroll viewport the gesture started in; capture is deferred until the axis is decided */
  deferredScroll: HTMLElement | null
  /** Started on a snap sheet's grabber: a tap stays its click, a drag moves the sheet */
  fromGrabber: boolean
  pointerId: number
}

/**
 * Hook that adds swipe-to-dismiss gesture to a drawer panel.
 *
 * Dismiss direction: panel follows finger 1:1, backdrop fades.
 * Opposite direction: iOS-style — panel stays anchored, shows subtle
 * overscroll feedback (box-shadow intensifies), then snaps back.
 */
export function useSwipeDismiss({
  anchor,
  enabled,
  onDismiss,
  panel,
  snap = null,
}: UseSwipeDismissOptions) {
  const stateRef = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    swiping: false,
    panelSize: 0,
    deferredScroll: null,
    fromGrabber: false,
    pointerId: 0,
  })
  // Read at event time, so a settle that re-renders mid-gesture is never stale.
  const snapRef = useRef(snap)
  snapRef.current = snap
  const snapping = snap !== null

  const isHorizontal = anchor === 'left' || anchor === 'right'

  /** Returns positive = dismiss direction, negative = opposite */
  const getMovement = useCallback(
    (state: SwipeState) => {
      if (isHorizontal) {
        const dx = state.currentX - state.startX
        return anchor === 'right' ? dx : -dx
      }
      return state.currentY - state.startY
    },
    [anchor, isHorizontal],
  )

  const applyTransform = useCallback(
    (movement: number, panelEl: HTMLDivElement) => {
      const size = Number(panelEl.dataset.panelSize) || 1

      if (movement >= 0) {
        // Dismiss direction — 1:1 tracking
        const progress = movement / size

        if (isHorizontal) {
          const sign = anchor === 'right' ? 1 : -1
          panelEl.style.transform = `translateX(${sign * movement}px)`
        } else {
          panelEl.style.transform = `translateY(${movement}px)`
        }

        // Fade backdrop proportionally
        const backdrop = panelEl.closest('[data-drawer-viewport]')
          ?.previousElementSibling as HTMLElement | null
        if (backdrop) {
          backdrop.style.opacity = String(Math.max(0, 1 - progress))
        }
      } else {
        // Opposite direction — iOS behavior:
        // Panel stays anchored (no translate). Show subtle overscroll via box-shadow.
        // Diminishing resistance: asymptotically approaches OPPOSITE_MAX_OVERSCROLL.
        const absMovement = Math.abs(movement)
        const overscroll = (absMovement / (absMovement + size * 0.5)) * OPPOSITE_MAX_OVERSCROLL
        const shadowSpread = Math.round(overscroll)

        panelEl.style.transform = ''
        panelEl.style.boxShadow =
          shadowSpread > 0 ? `0 0 ${shadowSpread * 2}px ${shadowSpread}px rgba(0, 0, 0, 0.15)` : ''
      }
    },
    [anchor, isHorizontal],
  )

  /** Reset all inline styles (snap back) */
  const resetStyles = useCallback((panelEl: HTMLDivElement) => {
    panelEl.style.transform = ''
    panelEl.style.boxShadow = ''
    panelEl.style.height = ''
    panelEl.style.transition = ''

    const backdrop = panelEl.closest('[data-drawer-viewport]')
      ?.previousElementSibling as HTMLElement | null
    if (backdrop) {
      backdrop.style.opacity = ''
    }
  }, [])

  /** Animate to fully dismissed position, then call onDismiss */
  const animateDismiss = useCallback(
    (panelEl: HTMLDivElement) => {
      const dismissTransform = isHorizontal
        ? `translateX(${anchor === 'right' ? '100%' : '-100%'})`
        : 'translateY(100%)'

      panelEl.style.transition = `transform ${DISMISS_DURATION}ms ease-in`
      panelEl.style.transform = dismissTransform

      const backdrop = panelEl.closest('[data-drawer-viewport]')
        ?.previousElementSibling as HTMLElement | null
      if (backdrop) {
        backdrop.style.transition = `opacity ${DISMISS_DURATION}ms ease-in`
        backdrop.style.opacity = '0'
      }

      // When the slide-out transition finishes, just call onDismiss.
      // Do NOT reset inline styles before unmount — that causes a 1-frame flash
      // where the panel appears at its original position. React will unmount the
      // DOM node entirely, so the inline styles don't need cleanup.
      let dismissed = false
      const done = () => {
        if (dismissed) return
        dismissed = true
        onDismiss()
      }
      panelEl.addEventListener('transitionend', done, {once: true})
      setTimeout(done, DISMISS_DURATION + 50)
    },
    [anchor, isHorizontal, onDismiss],
  )

  /** Animate snap-back for dismiss-direction undershoot */
  const animateSnapBack = useCallback((panelEl: HTMLDivElement) => {
    panelEl.style.transition = 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)'
    panelEl.style.transform = ''

    const backdrop = panelEl.closest('[data-drawer-viewport]')
      ?.previousElementSibling as HTMLElement | null
    if (backdrop) {
      backdrop.style.transition = 'opacity 200ms cubic-bezier(0.25, 1, 0.5, 1)'
      backdrop.style.opacity = ''
    }

    const cleanup = () => {
      panelEl.style.transition = ''
      if (backdrop) backdrop.style.transition = ''
    }
    panelEl.addEventListener('transitionend', cleanup, {once: true})
    setTimeout(cleanup, 250)
  }, [])

  /**
   * Snap sheet drag: the visible height follows the finger. Between the lowest
   * and the largest detent the panel resizes; past the largest it resists;
   * below the lowest it slides down and the backdrop fades.
   */
  const applySnapDrag = useCallback((movement: number, panelEl: HTMLDivElement) => {
    const current = snapRef.current
    if (!current) return
    const {heights, index} = current
    const low = heights[0]
    const high = heights[heights.length - 1]
    const visible = heights[index] - movement
    const backdrop = backdropOf(panelEl)
    if (visible > high) {
      panelEl.style.height = `${high + rubberBand(visible - high, SNAP_MAX_OVERSHOOT)}px`
      panelEl.style.transform = ''
    } else if (visible >= low) {
      panelEl.style.height = `${visible}px`
      panelEl.style.transform = ''
    } else {
      panelEl.style.height = `${low}px`
      panelEl.style.transform = `translateY(${low - visible}px)`
    }
    if (backdrop) backdrop.style.opacity = String(Math.min(1, Math.max(0, visible / low)))
  }, [])

  /** Settle a snap sheet on a detent, then hand the height back to React */
  const animateToDetent = useCallback((panelEl: HTMLDivElement, target: number) => {
    const current = snapRef.current
    if (!current) return
    const ease = `${SNAP_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`
    panelEl.style.transition = `height ${ease}, transform ${ease}`
    panelEl.style.height = `${current.heights[target]}px`
    panelEl.style.transform = ''
    const backdrop = backdropOf(panelEl)
    if (backdrop) {
      backdrop.style.transition = `opacity ${ease}`
      backdrop.style.opacity = ''
    }
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      current.onSnap(target)
      // React now sizes the panel at this detent: drop the inline copy.
      requestAnimationFrame(() => {
        panelEl.style.transition = ''
        panelEl.style.height = ''
        if (backdrop) backdrop.style.transition = ''
      })
    }
    panelEl.addEventListener('transitionend', done, {once: true})
    setTimeout(done, SNAP_DURATION + 50)
  }, [])

  useEffect(() => {
    if (!enabled || !panel) return

    function handlePointerDown(e: PointerEvent) {
      if (e.button !== 0) return
      const target = e.target as HTMLElement
      const fromGrabber = snapping && target.closest('[data-drawer-grabber]') !== null
      const scrollEl = fromGrabber ? null : target.closest<HTMLElement>('[data-duro-scroll]')
      // Outside a ScrollArea a control keeps its press. Inside one the gesture
      // is decided on the first move even from a control: a list of toggles is
      // all buttons, and touch adjustment snaps a finger onto one. A tap
      // (under the 8px slop) still presses it; a drag never captures before
      // the decision, so the release lands on the panel, not the control.
      if (
        !fromGrabber &&
        !scrollEl &&
        target.closest('button, a, input, textarea, select, [role="button"]')
      ) {
        return
      }

      const rect = panel!.getBoundingClientRect()
      const state = stateRef.current
      state.startX = e.clientX
      state.startY = e.clientY
      state.currentX = e.clientX
      state.currentY = e.clientY
      state.startTime = Date.now()
      state.swiping = false
      state.panelSize = isHorizontal ? rect.width : rect.height

      state.pointerId = e.pointerId
      state.deferredScroll = scrollEl
      state.fromGrabber = fromGrabber

      panel!.dataset.panelSize = String(state.panelSize)

      // Inside a Duro ScrollArea the scroll may own the gesture, and a press on
      // the grabber may be a tap: wait for the first move.
      if (!state.deferredScroll && !fromGrabber) beginCapture(e.pointerId)
    }

    function beginCapture(pointerId: number) {
      panel!.setPointerCapture(pointerId)

      // Freeze CSS animation — we take over positioning.
      // Never restore it; the panel is already at its final resting position.
      panel!.style.animation = 'none'
      // A snap sheet animates its height between detents; the finger drives it now.
      if (snapping) panel!.style.transition = 'none'
    }

    /** A snap sheet below its largest detent grows when dragged up from its content */
    function canGrow() {
      const current = snapRef.current
      return current !== null && current.index < current.heights.length - 1
    }

    /** True when the viewport can't scroll further against the dismiss direction */
    function isAtDismissEdge(el: HTMLElement) {
      if (!isHorizontal) return el.scrollTop <= 0
      if (anchor === 'right') return el.scrollLeft <= 0
      return el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
    }

    function handlePointerMove(e: PointerEvent) {
      const state = stateRef.current
      if (state.startTime === 0) return

      state.currentX = e.clientX
      state.currentY = e.clientY

      const dx = Math.abs(state.currentX - state.startX)
      const dy = Math.abs(state.currentY - state.startY)

      if (!state.swiping) {
        const totalMovement = Math.sqrt(dx * dx + dy * dy)
        if (totalMovement < DRAG_SLOP) return

        if (isHorizontal && dx > dy) {
          state.swiping = true
        } else if (!isHorizontal && dy > dx) {
          state.swiping = true
        } else {
          // Wrong axis — abort gesture
          state.startTime = 0
          state.deferredScroll = null
          state.fromGrabber = false
          return
        }

        const scrollEl = state.deferredScroll
        if (state.fromGrabber) {
          beginCapture(state.pointerId)
        } else if (scrollEl) {
          state.deferredScroll = null
          const movement = getMovement(state)
          const sheetOwns =
            movement > 0 ? isAtDismissEdge(scrollEl) : snapping && movement < 0 && canGrow()
          if (!sheetOwns) {
            // The scroll owns this gesture: no swiping, no capture, no preventDefault
            state.swiping = false
            state.startTime = 0
            return
          }
          beginCapture(state.pointerId)
        }
      }

      if (state.swiping) {
        e.preventDefault()
        const movement = getMovement(state)
        if (snapping) applySnapDrag(movement, panel!)
        else applyTransform(movement, panel!)
      }
    }

    function handlePointerUp(_e: PointerEvent) {
      const state = stateRef.current
      if (state.startTime === 0) return

      const movement = getMovement(state)
      const elapsed = Date.now() - state.startTime
      const velocity = movement / elapsed

      state.startTime = 0
      state.deferredScroll = null
      state.fromGrabber = false

      if (!state.swiping) {
        return
      }

      state.swiping = false

      const current = snapRef.current
      if (current) {
        const settled = settleDetent({
          heights: current.heights,
          from: current.index,
          height: current.heights[current.index] - movement,
          velocity,
        })
        if (settled === 'dismiss') animateDismiss(panel!)
        else animateToDetent(panel!, settled)
        return
      }

      if (movement <= 0) {
        // Was dragging in opposite direction — just reset (no translate was applied)
        resetStyles(panel!)
        return
      }

      if (shouldDismissEdge(movement, state.panelSize, velocity)) {
        animateDismiss(panel!)
      } else {
        animateSnapBack(panel!)
      }
    }

    function handlePointerCancel() {
      const state = stateRef.current
      state.startTime = 0
      state.swiping = false
      state.deferredScroll = null
      state.fromGrabber = false
      resetStyles(panel!)
    }

    panel.addEventListener('pointerdown', handlePointerDown)
    panel.addEventListener('pointermove', handlePointerMove)
    panel.addEventListener('pointerup', handlePointerUp)
    panel.addEventListener('pointercancel', handlePointerCancel)

    function handleTouchMove(e: TouchEvent) {
      if (stateRef.current.swiping) {
        e.preventDefault()
      }
    }
    panel.addEventListener('touchmove', handleTouchMove, {passive: false})

    return () => {
      panel.removeEventListener('pointerdown', handlePointerDown)
      panel.removeEventListener('pointermove', handlePointerMove)
      panel.removeEventListener('pointerup', handlePointerUp)
      panel.removeEventListener('pointercancel', handlePointerCancel)
      panel.removeEventListener('touchmove', handleTouchMove)
    }
  }, [
    enabled,
    panel,
    anchor,
    isHorizontal,
    getMovement,
    applyTransform,
    applySnapDrag,
    animateToDetent,
    resetStyles,
    animateSnapBack,
    animateDismiss,
    snapping,
  ])
}

function backdropOf(panelEl: HTMLDivElement) {
  return panelEl.closest('[data-drawer-viewport]')?.previousElementSibling as HTMLElement | null
}
