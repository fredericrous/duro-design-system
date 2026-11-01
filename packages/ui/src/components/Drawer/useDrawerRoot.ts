import {type ReactNode, useEffect, useId, useMemo, useRef, useState} from 'react'
import type {DurationToken} from '@duro-app/tokens/keys'
import {useOverlayOpenState} from '../../shared/useOverlayOpenState'
import type {DrawerAnchor, DrawerContextValue} from './parts'
import {
  sortSideSnapPoints,
  sortSnapPoints,
  type SideSnapPoint,
  type SnapPoint,
} from './sheetPhysics'

interface DrawerRootBaseProps {
  children: ReactNode
  /** Controlled open state */
  open?: boolean
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean
  /** Called when drawer open state changes */
  onOpenChange?: (open: boolean) => void
  /** Whether clicking backdrop or pressing Escape (Android's back button on native) closes the drawer. Default: true */
  dismissable?: boolean
  /**
   * Modal (default) puts a backdrop behind the panel, marks it aria-modal, locks body scroll and
   * closes on Escape anywhere. Non-modal (false) has none of these: the page stays usable and
   * Escape closes only while focus is inside the panel.
   * A non-modal drawer sits at layers.floating, and a Popover inside it stacks above the panel at
   * layers.floatingRaised; a modal drawer keeps layers.modal. On React Native a non-modal drawer
   * draws in the base portal host (no Modal, no backdrop), below any Dialog opened later.
   */
  modal?: boolean
  /** Whether swipe gesture dismisses the drawer. Default: true */
  swipeDismiss?: boolean
  /** Motion token for the close animation. Default: 'fast' (150ms) */
  closeAnimationDuration?: DurationToken
}

export interface DrawerBottomRootProps extends DrawerRootBaseProps {
  /** Which edge the drawer slides from */
  anchor: 'bottom'
  /**
   * The heights the sheet rests at. 'medium' is half the
   * window, 'large' the window less its top safe-area inset. A drag moves
   * between them and dismisses below the lowest; the grabber steps through
   * them on a tap. Without it, a bottom drawer is as tall as its content.
   */
  snapPoints?: readonly SnapPoint[]
  /** The detent the sheet opens at. Default: the lowest of snapPoints */
  defaultSnapPoint?: SnapPoint
}

export interface DrawerSideRootProps extends DrawerRootBaseProps {
  /** Which edge the drawer slides from. Default: 'right' */
  anchor?: 'left' | 'right'
  /**
   * The widths the panel rests at. 'compact' is the panelSm width, 'expanded' the
   * panelLg width, each held to the window's width. A tap on the grabber steps through them and
   * a drag on it resizes the panel, settling on a detent; Portal's `size` is ignored. A swipe
   * elsewhere on the panel still dismisses it.
   */
  snapPoints?: readonly SideSnapPoint[]
  /** The detent the panel opens at. Default: the lowest of snapPoints */
  defaultSnapPoint?: SideSnapPoint
}

export type DrawerRootProps = DrawerBottomRootProps | DrawerSideRootProps

/** Omit applied to each member of a union; the built-in Omit collapses it. */
type DistributiveOmit<Props, Key extends PropertyKey> = Props extends unknown
  ? Omit<Props, Key>
  : never

/** The state both platforms' Drawer.Root share: open and closing, ids, and the detent. */
export function useDrawerRoot(
  props: DistributiveOmit<DrawerRootProps, 'children'>,
): DrawerContextValue {
  const {
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    dismissable = true,
    modal = true,
    swipeDismiss = true,
    closeAnimationDuration = 'fast',
  } = props
  const anchor: DrawerAnchor = props.anchor ?? 'right'
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
  const bottomKey =
    props.anchor === 'bottom' && props.snapPoints ? sortSnapPoints(props.snapPoints).join() : ''
  const sideKey =
    props.anchor !== 'bottom' && props.snapPoints ? sortSideSnapPoints(props.snapPoints).join() : ''
  const snapPoints = useMemo(
    () => (bottomKey ? (bottomKey.split(',') as SnapPoint[]) : []),
    [bottomKey],
  )
  const sideSnapPoints = useMemo(
    () => (sideKey ? (sideKey.split(',') as SideSnapPoint[]) : []),
    [sideKey],
  )
  const openIndex = Math.max(
    0,
    props.anchor === 'bottom'
      ? props.defaultSnapPoint
        ? snapPoints.indexOf(props.defaultSnapPoint)
        : 0
      : props.defaultSnapPoint
        ? sideSnapPoints.indexOf(props.defaultSnapPoint)
        : 0,
  )
  const [snapIndex, setSnapIndex] = useState(openIndex)
  const previousAnchor = useRef(anchor)
  // Each opening starts at the default detent, and so does a new anchor.
  useEffect(() => {
    const anchorChanged = previousAnchor.current !== anchor
    previousAnchor.current = anchor
    if (!present || anchorChanged) setSnapIndex(openIndex)
  }, [present, openIndex, anchor])

  return {
    open: present,
    closing,
    closeDuration: closeAnimationDuration,
    anchor,
    dismissable,
    modal,
    swipeDismiss,
    requestOpen,
    requestClose,
    requestCloseImmediate,
    titleId,
    descriptionId,
    panelRef,
    snapPoints,
    sideSnapPoints,
    snapIndex,
    setSnapIndex,
  }
}
