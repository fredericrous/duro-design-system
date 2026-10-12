import {useCallback, useEffect, useRef, useState} from 'react'
import {DURATION_MS, type DurationToken} from '@duro-app/tokens/keys'

/**
 * When the owner hears that the overlay closed.
 * - `after-exit`: once the exit animation has played (Dialog, Drawer): the
 *   overlay stays logically open while it animates out.
 * - `at-once`: as soon as the close is asked for (DetailPanel); the panel
 *   still animates out while `present`.
 */
export type CloseNotice = 'after-exit' | 'at-once'

interface Options {
  /** Controlled open state. */
  open: boolean | undefined
  /** Initial open state when uncontrolled. */
  defaultOpen: boolean
  onOpenChange: ((open: boolean) => void) | undefined
  /** Motion token the exit animation lasts. */
  exitDuration: DurationToken
  closeNotice: CloseNotice
}

export interface OverlayOpenState {
  /** Logically open (what `open` / the uncontrolled state says). */
  open: boolean
  /** Rendered: open, or animating out. */
  present: boolean
  /** Playing the exit animation. */
  closing: boolean
  requestOpen: () => void
  /** Animated close. Does nothing while a close is already playing. */
  requestClose: () => void
  /** Close without the exit animation (a swipe that already moved the panel out). */
  closeNow: () => void
}

/**
 * Open, presence and exit-animation state shared by Dialog, Drawer and
 * DetailPanel on both platforms. A controlled `open` that turns false from
 * outside plays the exit animation too.
 */
export function useOverlayOpenState({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  exitDuration,
  closeNotice,
}: Options): OverlayOpenState {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = isControlled ? controlledOpen : internalOpen
  const [present, setPresent] = useState(open)
  const [closing, setClosing] = useState(false)
  const closingRef = useRef(false)
  // The playing exit was started by the owner's `open` turning false (not by
  // requestClose), so an `open` turning true again cancels it.
  const outsideExitRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelExit = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    closingRef.current = false
    outsideExitRef.current = false
    setClosing(false)
  }, [])

  const playExit = useCallback(
    (afterExit?: () => void) => {
      closingRef.current = true
      outsideExitRef.current = afterExit === undefined
      setClosing(true)
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        closingRef.current = false
        outsideExitRef.current = false
        setClosing(false)
        setPresent(false)
        afterExit?.()
      }, DURATION_MS[exitDuration])
    },
    [exitDuration],
  )

  const notifyClosed = useCallback(() => {
    if (!isControlled) setInternalOpen(false)
    onOpenChange?.(false)
  }, [isControlled, onOpenChange])

  const requestOpen = useCallback(() => {
    cancelExit()
    setPresent(true)
    if (!isControlled) setInternalOpen(true)
    onOpenChange?.(true)
  }, [cancelExit, isControlled, onOpenChange])

  const requestClose = useCallback(() => {
    if (closingRef.current) return
    if (closeNotice === 'after-exit') playExit(notifyClosed)
    else notifyClosed()
  }, [closeNotice, playExit, notifyClosed])

  const closeNow = useCallback(() => {
    cancelExit()
    setPresent(false)
    notifyClosed()
  }, [cancelExit, notifyClosed])

  // Presence follows the logical state: an open from outside shows the
  // overlay, a close from outside (or an `at-once` close) animates it out.
  useEffect(() => {
    if (open && outsideExitRef.current) cancelExit()
    else if (open && !present && !closingRef.current) setPresent(true)
    else if (!open && present && !closingRef.current) playExit()
  }, [open, present, playExit, cancelExit])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  // An open is rendered in the same commit (a consumer's effect on `open` can
  // already reach the overlay's content); the state catches up in the effect.
  return {open, present: open || present, closing, requestOpen, requestClose, closeNow}
}
