import {useRef, useCallback, useEffect} from 'react'
import type {DrawerAnchor} from './Drawer'

/** Threshold: fraction of panel size the user must drag to dismiss */
const DISMISS_THRESHOLD = 0.3

/** Minimum velocity (px/ms) to dismiss even below threshold */
const VELOCITY_THRESHOLD = 0.5

/** Duration for the dismiss slide-out animation (ms) */
const DISMISS_DURATION = 160

/**
 * Max pixels the panel visually "grows" when dragged in the opposite direction.
 * iOS-style: panel stays anchored to its edge, doesn't translate.
 * Instead we show a subtle shadow/scale hint capped at this value.
 */
const OPPOSITE_MAX_OVERSCROLL = 12

interface UseSwipeDismissOptions {
  anchor: DrawerAnchor
  enabled: boolean
  onDismiss: () => void
  panelRef: React.RefObject<HTMLDivElement | null>
}

interface SwipeState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  startTime: number
  swiping: boolean
  panelSize: number
}

/**
 * Hook that adds swipe-to-dismiss gesture to a drawer panel.
 *
 * Dismiss direction: panel follows finger 1:1, backdrop fades.
 * Opposite direction: iOS-style — panel stays anchored, shows subtle
 * overscroll feedback (box-shadow intensifies), then snaps back.
 */
export function useSwipeDismiss({anchor, enabled, onDismiss, panelRef}: UseSwipeDismissOptions) {
  const stateRef = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    swiping: false,
    panelSize: 0,
  })

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
          shadowSpread > 0
            ? `0 0 ${shadowSpread * 2}px ${shadowSpread}px rgba(0, 0, 0, 0.15)`
            : ''
      }
    },
    [anchor, isHorizontal],
  )

  /** Reset all inline styles (snap back) */
  const resetStyles = useCallback((panelEl: HTMLDivElement) => {
    panelEl.style.transform = ''
    panelEl.style.boxShadow = ''

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

  useEffect(() => {
    if (!enabled) return
    const panel = panelRef.current
    if (!panel) return

    function handlePointerDown(e: PointerEvent) {
      if (e.button !== 0) return
      const target = e.target as HTMLElement
      if (target.closest('button, a, input, textarea, select, [role="button"]')) {
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

      panel!.dataset.panelSize = String(state.panelSize)
      panel!.setPointerCapture(e.pointerId)

      // Freeze CSS animation — we take over positioning.
      // Never restore it; the panel is already at its final resting position.
      panel!.style.animation = 'none'
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
        if (totalMovement < 8) return

        if (isHorizontal && dx > dy) {
          state.swiping = true
        } else if (!isHorizontal && dy > dx) {
          state.swiping = true
        } else {
          // Wrong axis — abort gesture
          state.startTime = 0
          return
        }
      }

      if (state.swiping) {
        e.preventDefault()
        const movement = getMovement(state)
        applyTransform(movement, panel!)
      }
    }

    function handlePointerUp(_e: PointerEvent) {
      const state = stateRef.current
      if (state.startTime === 0) return

      const movement = getMovement(state)
      const elapsed = Date.now() - state.startTime
      const velocity = movement / elapsed

      state.startTime = 0

      if (!state.swiping) {
        return
      }

      state.swiping = false

      if (movement <= 0) {
        // Was dragging in opposite direction — just reset (no translate was applied)
        resetStyles(panel!)
        return
      }

      const fraction = movement / state.panelSize
      const shouldDismiss =
        fraction > DISMISS_THRESHOLD || velocity > VELOCITY_THRESHOLD

      if (shouldDismiss) {
        animateDismiss(panel!)
      } else {
        animateSnapBack(panel!)
      }
    }

    function handlePointerCancel() {
      const state = stateRef.current
      state.startTime = 0
      state.swiping = false
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
  }, [enabled, panelRef, anchor, isHorizontal, getMovement, applyTransform, resetStyles, animateSnapBack, animateDismiss])
}
