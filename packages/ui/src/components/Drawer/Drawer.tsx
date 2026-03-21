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
import {styles} from './styles.css'
import {useSwipeDismiss} from './useSwipeDismiss'

// --- Types ---

export type DrawerAnchor = 'right' | 'left' | 'bottom'
export type DrawerSize = 'sm' | 'md' | 'lg'

// --- Context ---

interface DrawerContextValue {
  open: boolean
  closing: boolean
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
  /** Duration of the close animation in ms. Default: 160 */
  closeAnimationDuration?: number
}

function Root({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  anchor = 'right',
  dismissable = true,
  swipeDismiss = true,
  closeAnimationDuration = 160,
}: RootProps) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [closing, setClosing] = useState(false)
  const closingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const isOpen = isControlled ? controlledOpen : internalOpen

  const titleId = useId()
  const descriptionId = useId()

  const requestOpen = useCallback(() => {
    if (closingTimerRef.current) {
      clearTimeout(closingTimerRef.current)
      closingTimerRef.current = null
    }
    setClosing(false)
    if (!isControlled) setInternalOpen(true)
    onOpenChange?.(true)
  }, [isControlled, onOpenChange])

  const requestClose = useCallback(() => {
    setClosing(true)
    closingTimerRef.current = setTimeout(() => {
      setClosing(false)
      closingTimerRef.current = null
      if (!isControlled) setInternalOpen(false)
      onOpenChange?.(false)
    }, closeAnimationDuration)
  }, [isControlled, onOpenChange, closeAnimationDuration])

  const requestCloseImmediate = useCallback(() => {
    if (closingTimerRef.current) {
      clearTimeout(closingTimerRef.current)
      closingTimerRef.current = null
    }
    setClosing(false)
    if (!isControlled) setInternalOpen(false)
    onOpenChange?.(false)
  }, [isControlled, onOpenChange])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current)
    }
  }, [])

  // Handle Escape key
  useEffect(() => {
    if (!isOpen && !closing) return
    if (!dismissable) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        requestClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, closing, dismissable, requestClose])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen || closing) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [isOpen, closing])

  return (
    <DrawerContext.Provider
      value={{
        open: isOpen || closing,
        closing,
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
    anchor,
    dismissable,
    swipeDismiss: swipeEnabled,
    requestClose,
    requestCloseImmediate,
    titleId,
    descriptionId,
    panelRef,
  } = useDrawer()

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
    panelRef,
  })

  if (!open) return null

  const isHorizontal = anchor === 'left' || anchor === 'right'

  return (
    <>
      {/* Backdrop — click to dismiss */}
      <html.div
        style={[
          styles.backdrop,
          closing && styles.backdropClosing,
          !closing && styles.backdropOpen,
        ]}
        aria-hidden
        onClick={handleBackdropClick}
      />

      {/* Viewport */}
      <html.div style={[styles.viewport, viewportAnchorMap[anchor]]} data-drawer-viewport="">
        <html.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          style={[
            styles.panel,
            isHorizontal && styles.panelHorizontal,
            isHorizontal && styles[size],
            !isHorizontal && styles.panelVertical,
            anchor === 'left' && styles.panelLeftBorder,
            closing && slideOutMap[anchor],
            !closing && slideInMap[anchor],
          ]}
        >
          {children}
        </html.div>
      </html.div>
    </>
  )
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
