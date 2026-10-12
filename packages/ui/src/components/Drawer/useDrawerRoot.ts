import {type ReactNode, useEffect, useId, useMemo, useRef, useState} from 'react'
import type {DurationToken} from '@duro-app/tokens/keys'
import {useOverlayOpenState} from '../../shared/useOverlayOpenState'
import type {DrawerAnchor, DrawerContextValue} from './parts'
import {sortSnapPoints, type SnapPoint} from './sheetPhysics'

export interface DrawerRootProps {
  children: ReactNode
  /** Controlled open state */
  open?: boolean
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean
  /** Called when drawer open state changes */
  onOpenChange?: (open: boolean) => void
  /** Which edge the drawer slides from. Default: 'right' */
  anchor?: DrawerAnchor
  /** Whether clicking backdrop or pressing Escape (Android's back button on native) closes the drawer. Default: true */
  dismissable?: boolean
  /** Whether swipe gesture dismisses the drawer. Default: true */
  swipeDismiss?: boolean
  /** Motion token for the close animation. Default: 'fast' (150ms) */
  closeAnimationDuration?: DurationToken
  /**
   * Bottom anchor only: the heights the sheet rests at. 'medium' is half the
   * window, 'large' the window less its top safe-area inset. A drag moves
   * between them and dismisses below the lowest; the grabber steps through
   * them on a tap. Without it, a bottom drawer is as tall as its content.
   */
  snapPoints?: readonly SnapPoint[]
  /** The detent the sheet opens at. Default: the lowest of snapPoints */
  defaultSnapPoint?: SnapPoint
}

/** The state both platforms' Drawer.Root share: open and closing, ids, and the detent. */
export function useDrawerRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  anchor = 'right',
  dismissable = true,
  swipeDismiss = true,
  closeAnimationDuration = 'fast',
  snapPoints: snapPointsProp,
  defaultSnapPoint,
}: Omit<DrawerRootProps, 'children'>): DrawerContextValue {
  const {
    present,
    closing,
    requestOpen,
    requestClose,
    closeNow: requestCloseImmediate,
  } = useOverlayOpenState({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    exitDuration: closeAnimationDuration,
    closeNotice: 'after-exit',
  })
  const panelRef = useRef<unknown>(null)
  const titleId = useId()
  const descriptionId = useId()

  // Keyed by content: a new array literal each render is the same detents.
  const snapKey = anchor === 'bottom' && snapPointsProp ? sortSnapPoints(snapPointsProp).join() : ''
  const snapPoints = useMemo(() => (snapKey ? (snapKey.split(',') as SnapPoint[]) : []), [snapKey])
  const openIndex = Math.max(0, defaultSnapPoint ? snapPoints.indexOf(defaultSnapPoint) : 0)
  const [snapIndex, setSnapIndex] = useState(openIndex)
  // Each opening starts at the default detent.
  useEffect(() => {
    if (!present) setSnapIndex(openIndex)
  }, [present, openIndex])

  return {
    open: present,
    closing,
    closeDuration: closeAnimationDuration,
    anchor,
    dismissable,
    swipeDismiss,
    requestOpen,
    requestClose,
    requestCloseImmediate,
    titleId,
    descriptionId,
    panelRef,
    snapPoints,
    snapIndex,
    setSnapIndex,
  }
}
