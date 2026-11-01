import {createPortal} from 'react-dom'
import {type ReactNode, useState, useEffect, useCallback} from 'react'
import {html} from 'react-strict-dom'
import type {DurationToken} from '@duro-app/tokens/keys'
import {styles} from './styles.css'
import {devWarnOnce} from '../../shared/devWarnOnce'
import {usePortalMount} from '../ThemeProvider/ThemeProvider'
import {ControlContextBoundary} from '../Toolbar/ControlContextBoundary'
import {ModalContext} from '../../shared/ModalContext'
import {PopoverLayerContext} from '../Popover/PopoverLayerContext'
import {useSwipeDismiss} from './useSwipeDismiss'
import {useSheetHeights, useSheetWidths} from './useSheetHeights'
import {cycleDetent} from './sheetPhysics'
import {partStyles} from './parts.css'
import {
  DEFAULT_GRABBER_LABELS,
  DEFAULT_SIDE_GRABBER_LABELS,
  Description,
  DrawerContext,
  Footer,
  Header,
  Title,
  useDrawer,
  type DrawerSize,
  type GrabberLabels,
} from './parts'
import {useDrawerRoot, type DrawerRootProps} from './useDrawerRoot'

export type {DrawerAnchor, DrawerSize, SideSnapPoint, SnapPoint} from './parts'

const closeDurationMap = {
  instant: styles.closeDurationInstant,
  minimal: styles.closeDurationMinimal,
  quick: styles.closeDurationQuick,
  fast: styles.closeDurationFast,
  brisk: styles.closeDurationBrisk,
  base: styles.closeDurationBase,
  slow: styles.closeDurationSlow,
} as const satisfies Record<DurationToken, unknown>

// --- Root ---

function Root({children, ...props}: DrawerRootProps) {
  const ctx = useDrawerRoot(props)
  const {open: present, dismissable, modal, requestClose, panelRef} = ctx

  // Handle Escape key
  useEffect(() => {
    if (!present) return
    if (!dismissable) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      const panel = panelRef.current as HTMLElement | null
      const focusInsidePanel = panel?.contains(document.activeElement) ?? false
      if (modal || focusInsidePanel) {
        e.stopPropagation()
        requestClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [present, dismissable, modal, panelRef, requestClose])

  // Lock body scroll when open
  useEffect(() => {
    if (present && modal) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [present, modal])

  return <DrawerContext.Provider value={ctx}>{children}</DrawerContext.Provider>
}

// --- Trigger ---

function Trigger({children}: {children: ReactNode}) {
  const {requestOpen} = useDrawer()

  return (
    <html.div onClick={requestOpen} style={partStyles.inlineWrapper}>
      {children}
    </html.div>
  )
}

// --- Portal ---

interface PortalProps {
  children: ReactNode
  size?: DrawerSize
  /**
   * The grabber's accessible names, by what a press does next. Snap drawers only.
   * Ignored for a side drawer with snapPoints: `size` is ignored there too (the detent sets the width)
   */
  grabberLabels?: GrabberLabels
  /**
   * A floating panel: inset from the viewport edge by a spacing token, with rounded corners and a
   * border all round, instead of flush against the edge. For a non-modal drawer (Pane).
   */
  floating?: boolean
}

// Slide animation maps
const slideInMap = {
  right: styles.slideInRight,
  left: styles.slideInLeft,
  bottom: styles.slideInBottom,
} as const

const slideOutMap = {
  right: styles.slideOutRight,
  left: styles.slideOutLeft,
  bottom: styles.slideOutBottom,
} as const

// A non-modal drawer sits at layers.floating; a Popover inside it takes the
// raised floating layer so it stacks above the panel.
const raisedFloatingLayer = {register: () => () => undefined, raised: true}

const viewportAnchorMap = {
  right: styles.viewportRight,
  left: styles.viewportLeft,
  bottom: styles.viewportBottom,
} as const

function Portal({
  children,
  size: sizeProp,
  grabberLabels: grabberLabelsProp,
  floating = false,
}: PortalProps) {
  const {
    open,
    closing,
    closeDuration,
    anchor,
    dismissable,
    modal,
    swipeDismiss: swipeEnabled,
    requestClose,
    requestCloseImmediate,
    titleId,
    descriptionId,
    panelRef,
    snapPoints,
    sideSnapPoints,
    snapIndex,
    setSnapIndex,
  } = useDrawer()
  const mount = usePortalMount()
  const snapping = snapPoints.length > 0
  const heights = useSheetHeights(snapPoints, snapping && open)
  const sized = snapping && heights.length === snapPoints.length
  const sideSnapping = sideSnapPoints.length > 0
  const widths = useSheetWidths(sideSnapPoints, sideSnapping && open)
  const sideSized = sideSnapping && widths.length === sideSnapPoints.length
  const size = sizeProp ?? 'md'
  const grabberLabels =
    grabberLabelsProp ?? (sideSnapping ? DEFAULT_SIDE_GRABBER_LABELS : DEFAULT_GRABBER_LABELS)
  const detentCount = sideSnapping ? sideSnapPoints.length : snapPoints.length
  const nextIndex = cycleDetent(snapIndex, detentCount)
  const hasSizeProp = sizeProp !== undefined
  useEffect(() => {
    if (sideSnapping && hasSizeProp) {
      devWarnOnce(
        'Drawer',
        'side-snap-size',
        "Portal's size is ignored on a side drawer with snapPoints: the detent sets the width.",
      )
    }
  }, [sideSnapping, hasSizeProp])
  // The shown panel element, tracked as state so swipe listeners follow it
  // when the portal mount arrives and the panel is remounted into it.
  const [panel, setPanel] = useState<HTMLDivElement | null>(null)
  const attachPanel = useCallback(
    (el: HTMLDivElement | null) => {
      panelRef.current = el
      setPanel(el)
    },
    [panelRef],
  )

  const handleBackdropClick = useCallback(() => {
    if (dismissable) {
      requestClose()
    }
  }, [dismissable, requestClose])

  // Swipe-to-dismiss — uses immediate close since the hook handles its own exit animation
  useSwipeDismiss({
    anchor,
    enabled: swipeEnabled && open && !closing,
    onDismiss: requestCloseImmediate,
    panel,
    snap: sized ? {heights, index: snapIndex, onSnap: setSnapIndex} : null,
  })

  if (!open) return null

  const isHorizontal = anchor === 'left' || anchor === 'right'

  const node = (
    <>
      {/* Backdrop — click to dismiss */}
      {modal && (
        <html.div
          style={[
            styles.backdrop,
            closing && styles.backdropClosing,
            closing && closeDurationMap[closeDuration],
            !closing && styles.backdropOpen,
          ]}
          aria-hidden
          data-drawer-backdrop=""
          onClick={handleBackdropClick}
        />
      )}

      {/* Viewport */}
      <html.div
        style={[
          styles.viewport,
          !modal && styles.viewportNonModal,
          floating && styles.viewportFloating,
          viewportAnchorMap[anchor],
        ]}
        data-drawer-viewport=""
      >
        <html.div
          ref={attachPanel}
          role="dialog"
          aria-modal={modal ? true : undefined}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          style={[
            styles.panel,
            isHorizontal && styles.panelHorizontal,
            isHorizontal && !sideSnapping && styles[size],
            !isHorizontal && styles.panelVertical,
            sized && styles.panelSnap,
            sized && styles.sheetHeight(heights[snapIndex]),
            sideSnapping && styles.panelSideSnap,
            sideSized && styles.sheetWidth(widths[snapIndex]),
            anchor === 'left' && styles.panelLeftBorder,
            floating && styles.panelFloating,
            closing && slideOutMap[anchor],
            closing && closeDurationMap[closeDuration],
            !closing && slideInMap[anchor],
          ]}
        >
          {(snapping || sideSnapping) && (
            <html.button
              type="button"
              data-drawer-grabber=""
              aria-label={nextIndex > snapIndex ? grabberLabels.expand : grabberLabels.collapse}
              onClick={() => setSnapIndex(nextIndex)}
              style={
                sideSnapping
                  ? [
                      partStyles.grabberHit,
                      styles.grabberHitSide,
                      anchor === 'left' ? styles.grabberHitSideLeft : styles.grabberHitSideRight,
                    ]
                  : [partStyles.grabberHit, styles.grabberHitWeb]
              }
            >
              <html.span
                style={
                  sideSnapping ? [partStyles.grabber, styles.grabberVertical] : partStyles.grabber
                }
              />
            </html.button>
          )}
          {modal ? (
            <ModalContext.Provider value={true}>
              <ControlContextBoundary>{children}</ControlContextBoundary>
            </ModalContext.Provider>
          ) : (
            <PopoverLayerContext.Provider value={raisedFloatingLayer}>
              <ControlContextBoundary>{children}</ControlContextBoundary>
            </PopoverLayerContext.Provider>
          )}
        </html.div>
      </html.div>
    </>
  )

  // Out of the tree into the ThemeProvider mount (like Select and Combobox):
  // a fixed overlay inside an ancestor with transform / filter /
  // backdrop-filter is positioned against THAT ancestor, not the viewport —
  // a dialog opened from a sticky blurred top bar centred on the bar. Without
  // a mount (SSR, no ThemeProvider) it renders in place.
  return mount ? createPortal(node, mount) : node
}

// --- Body ---

export interface BodyProps {
  children: ReactNode
  /** No side padding: rows that run to the panel's edges, as a picker's list. */
  flush?: boolean
}

function Body({children, flush = false}: BodyProps) {
  const {snapPoints} = useDrawer()
  // A snap sheet's Body is its scroll viewport: a drag there scrolls it, and
  // moves the sheet only from the top edge (or upward, below the largest detent).
  return (
    <html.div
      style={[styles.body, flush && styles.bodyFlush]}
      data-duro-scroll={snapPoints.length > 0 ? '' : undefined}
    >
      {children}
    </html.div>
  )
}

// --- Close ---

export interface CloseProps {
  children?: ReactNode
  'aria-label'?: string
}

function Close({children, 'aria-label': ariaLabel = 'Close'}: CloseProps) {
  const {requestClose} = useDrawer()

  if (children) {
    return (
      <html.div onClick={requestClose} style={partStyles.inlineWrapper}>
        {children}
      </html.div>
    )
  }

  return (
    <html.button onClick={requestClose} aria-label={ariaLabel} style={partStyles.closeButton}>
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
        <path
          d="M4 4l8 8M12 4l-8 8"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </svg>
    </html.button>
  )
}

// --- Export ---

export const Drawer = {
  Root,
  Trigger,
  Portal,
  Header,
  Title,
  Description,
  Body,
  Footer,
  Close,
}
