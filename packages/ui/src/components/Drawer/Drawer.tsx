import {createPortal} from 'react-dom'
import {
  type ReactNode,
  type RefObject,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useId,
  useRef,
} from 'react'
import {html} from 'react-strict-dom'
import type {DurationToken} from '@duro-app/tokens/keys'
import {styles} from './styles.css'
import {useOverlayOpenState} from '../../shared/useOverlayOpenState'
import {usePortalMount} from '../ThemeProvider/ThemeProvider'
import {ControlContextBoundary} from '../Toolbar/ControlContextBoundary'
import {ModalContext} from '../../shared/ModalContext'
import {useSwipeDismiss} from './useSwipeDismiss'

// --- Types ---

export type DrawerAnchor = 'right' | 'left' | 'bottom'
export type DrawerSize = 'sm' | 'md' | 'lg'

const closeDurationMap = {
  instant: styles.closeDurationInstant,
  minimal: styles.closeDurationMinimal,
  quick: styles.closeDurationQuick,
  fast: styles.closeDurationFast,
  brisk: styles.closeDurationBrisk,
  base: styles.closeDurationBase,
  slow: styles.closeDurationSlow,
} as const satisfies Record<DurationToken, unknown>

// --- Context ---

interface DrawerContextValue {
  open: boolean
  closing: boolean
  closeDuration: DurationToken
  anchor: DrawerAnchor
  dismissable: boolean
  swipeDismiss: boolean
  requestOpen: () => void
  requestClose: () => void
  /** Close immediately without CSS animation (used by swipe dismiss which handles its own exit animation) */
  requestCloseImmediate: () => void
  titleId: string
  descriptionId: string
  panelRef: RefObject<HTMLDivElement | null>
}

const DrawerContext = createContext<DrawerContextValue | null>(null)

function useDrawer() {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('Drawer compound components must be used within Drawer.Root')
  return ctx
}

// --- Root ---

interface RootProps {
  children: ReactNode
  /** Controlled open state */
  open?: boolean
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean
  /** Called when drawer open state changes */
  onOpenChange?: (open: boolean) => void
  /** Which edge the drawer slides from. Default: 'right' */
  anchor?: DrawerAnchor
  /** Whether clicking backdrop or pressing Escape closes the drawer. Default: true */
  dismissable?: boolean
  /** Whether swipe gesture dismisses the drawer. Default: true */
  swipeDismiss?: boolean
  /** Motion token for the close animation. Default: 'fast' (150ms) */
  closeAnimationDuration?: DurationToken
}

function Root({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  anchor = 'right',
  dismissable = true,
  swipeDismiss = true,
  closeAnimationDuration = 'fast',
}: RootProps) {
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
  const panelRef = useRef<HTMLDivElement>(null)

  const titleId = useId()
  const descriptionId = useId()

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

  return (
    <DrawerContext.Provider
      value={{
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
      }}
    >
      {children}
    </DrawerContext.Provider>
  )
}

// --- Trigger ---

function Trigger({children}: {children: ReactNode}) {
  const {requestOpen} = useDrawer()

  return (
    <html.div onClick={requestOpen} style={styles.inlineWrapper}>
      {children}
    </html.div>
  )
}

// --- Portal ---

interface PortalProps {
  children: ReactNode
  size?: DrawerSize
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

function Portal({children, size = 'md'}: PortalProps) {
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
  } = useDrawer()
  const mount = usePortalMount()
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
            anchor === 'left' && styles.panelLeftBorder,
            closing && slideOutMap[anchor],
            closing && closeDurationMap[closeDuration],
            !closing && slideInMap[anchor],
          ]}
        >
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

// --- Header ---

function Header({children}: {children: ReactNode}) {
  return <html.div style={styles.header}>{children}</html.div>
}

// --- Title ---

function Title({children}: {children: ReactNode}) {
  const {titleId} = useDrawer()
  return (
    <html.h2 id={titleId} style={styles.title}>
      {children}
    </html.h2>
  )
}

// --- Description ---

function Description({children}: {children: ReactNode}) {
  const {descriptionId} = useDrawer()
  return (
    <html.p id={descriptionId} style={styles.description}>
      {children}
    </html.p>
  )
}

// --- Body ---

function Body({children}: {children: ReactNode}) {
  return <html.div style={styles.body}>{children}</html.div>
}

// --- Footer ---

function Footer({children}: {children: ReactNode}) {
  return <html.div style={styles.footer}>{children}</html.div>
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
      <html.div onClick={requestClose} style={styles.inlineWrapper}>
        {children}
      </html.div>
    )
  }

  return (
    <html.button onClick={requestClose} aria-label={ariaLabel} style={styles.closeButton}>
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
