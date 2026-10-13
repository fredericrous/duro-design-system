import {createPortal} from 'react-dom'
import {type ReactNode, useState, useEffect, useCallback} from 'react'
import {html} from 'react-strict-dom'
import type {DurationToken} from '@duro-app/tokens/keys'
import {styles} from './styles.css'
import {usePortalMount} from '../ThemeProvider/ThemeProvider'
import {ControlContextBoundary} from '../Toolbar/ControlContextBoundary'
import {ModalContext} from '../../shared/ModalContext'
import {useSwipeDismiss} from './useSwipeDismiss'
import {useSheetHeights} from './useSheetHeights'
import {cycleDetent} from './sheetPhysics'
import {partStyles} from './parts.css'
import {
  DEFAULT_GRABBER_LABELS,
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

export type {DrawerAnchor, DrawerSize, SnapPoint} from './parts'

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
  const {open: present, dismissable, requestClose} = ctx

  // Handle Escape key
  useEffect(() => {
    if (!present) return
    if (!dismissable) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        requestClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [present, dismissable, requestClose])

  // Lock body scroll when open
  useEffect(() => {
    if (present) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [present])

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
  /** The grabber's accessible names, by what a press does next. Snap sheets only */
  grabberLabels?: GrabberLabels
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

const viewportAnchorMap = {
  right: styles.viewportRight,
  left: styles.viewportLeft,
  bottom: styles.viewportBottom,
} as const

function Portal({children, size = 'md', grabberLabels = DEFAULT_GRABBER_LABELS}: PortalProps) {
  const {
    open,
    closing,
    closeDuration,
    anchor,
    dismissable,
    swipeDismiss: swipeEnabled,
    requestClose,
    requestCloseImmediate,
    titleId,
    descriptionId,
    panelRef,
    snapPoints,
    snapIndex,
    setSnapIndex,
  } = useDrawer()
  const mount = usePortalMount()
  const snapping = snapPoints.length > 0
  const heights = useSheetHeights(snapPoints, snapping && open)
  const sized = snapping && heights.length === snapPoints.length
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
      <html.div
        style={[
          styles.backdrop,
          closing && styles.backdropClosing,
          closing && closeDurationMap[closeDuration],
          !closing && styles.backdropOpen,
        ]}
        aria-hidden
        onClick={handleBackdropClick}
      />

      {/* Viewport */}
      <html.div style={[styles.viewport, viewportAnchorMap[anchor]]} data-drawer-viewport="">
        <html.div
          ref={attachPanel}
          role="dialog"
          aria-modal={true}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          style={[
            styles.panel,
            isHorizontal && styles.panelHorizontal,
            isHorizontal && styles[size],
            !isHorizontal && styles.panelVertical,
            sized && styles.panelSnap,
            sized && styles.sheetHeight(heights[snapIndex]),
            anchor === 'left' && styles.panelLeftBorder,
            closing && slideOutMap[anchor],
            closing && closeDurationMap[closeDuration],
            !closing && slideInMap[anchor],
          ]}
        >
          {snapping && (
            <html.button
              type="button"
              data-drawer-grabber=""
              aria-label={
                cycleDetent(snapIndex, snapPoints.length) > snapIndex
                  ? grabberLabels.expand
                  : grabberLabels.collapse
              }
              onClick={() => setSnapIndex(cycleDetent(snapIndex, snapPoints.length))}
              style={[partStyles.grabberHit, styles.grabberHitWeb]}
            >
              <html.span style={partStyles.grabber} />
            </html.button>
          )}
          <ModalContext.Provider value={true}>
            <ControlContextBoundary>{children}</ControlContextBoundary>
          </ModalContext.Provider>
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

interface BodyProps {
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

interface CloseProps {
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
