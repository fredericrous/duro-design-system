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
import {DURATION_MS, type DurationToken} from '@duro-app/tokens/keys'
import {styles} from './styles.css'
import {usePortalMount} from '../ThemeProvider/ThemeProvider'
import {ControlContextBoundary} from '../Toolbar/ControlContextBoundary'
import {ModalContext} from '../../shared/ModalContext'
import {devWarnOnce} from '../../shared/devWarnOnce'

// --- Types ---

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export type DialogSize = 'sm' | 'md' | 'lg'

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

interface DialogContextValue {
  open: boolean
  closing: boolean
  closeDuration: DurationToken
  dismissable: boolean
  requestOpen: () => void
  requestClose: () => void
  titleId: string
  descriptionId: string
  popupRef: RefObject<HTMLDivElement | null>
  /** Dialog.Close parts currently rendered (for the closeOnEscape dev warning). */
  registerClose: () => () => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('Dialog compound components must be used within Dialog.Root')
  return ctx
}

// --- Root ---

interface RootProps {
  children: ReactNode
  /** Controlled open state */
  open?: boolean
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean
  /** Called when dialog open state changes */
  onOpenChange?: (open: boolean) => void
  /** Whether clicking the backdrop closes the dialog. Default: true */
  dismissable?: boolean
  /**
   * Whether Escape closes the dialog. Default: true, also when `dismissable`
   * is false. Turning it off leaves the keyboard no way out but a
   * Dialog.Close, so render one.
   */
  closeOnEscape?: boolean
  /** Element to focus on open. Default: the first focusable element, else the dialog itself. */
  initialFocus?: RefObject<HTMLElement | null>
  /** Motion token for the close animation. Default: 'fast' (150ms) */
  closeAnimationDuration?: DurationToken
}

function Root({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  dismissable = true,
  closeOnEscape = true,
  initialFocus,
  closeAnimationDuration = 'fast',
}: RootProps) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [closing, setClosing] = useState(false)
  const closingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)

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
    }, DURATION_MS[closeAnimationDuration])
  }, [isControlled, onOpenChange, closeAnimationDuration])

  // If controlled open goes false externally, trigger close animation
  useEffect(() => {
    if (isControlled && !controlledOpen && !closing) {
      // Already closed, nothing to animate
    }
  }, [isControlled, controlledOpen, closing])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current)
    }
  }, [])

  // Handle Escape key. A layer inside the dialog (a Menu, a Select) that
  // already handled it marks the event, and the dialog stays open.
  useEffect(() => {
    if (!isOpen && !closing) return
    if (!closeOnEscape) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      e.stopPropagation()
      requestClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, closing, closeOnEscape, requestClose])

  // Focus: into the dialog on open (initialFocus, else the first focusable
  // element, else the dialog itself), back to what had it on close. The
  // Portal is a descendant, so its popup is mounted when this effect runs.
  const closeCountRef = useRef(0)
  const registerClose = useCallback(() => {
    closeCountRef.current += 1
    return () => {
      closeCountRef.current -= 1
    }
  }, [])
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      const popup = popupRef.current
      if (popup) {
        const target = initialFocus?.current ?? popup.querySelector<HTMLElement>(FOCUSABLE) ?? popup
        target.focus({preventScroll: true})
      }
      if (!closeOnEscape && closeCountRef.current === 0) {
        devWarnOnce(
          'Dialog',
          'no-escape-no-close',
          'Dialog.Root has closeOnEscape={false} and no Dialog.Close: a keyboard user cannot leave this dialog. Render a Dialog.Close, or keep Escape.',
        )
      }
    } else if (!isOpen && !closing && wasOpenRef.current) {
      const target = previousFocusRef.current
      previousFocusRef.current = null
      if (target?.isConnected) target.focus({preventScroll: true})
    }
    wasOpenRef.current = isOpen || closing
  }, [isOpen, closing, initialFocus, closeOnEscape])

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
    <DialogContext.Provider
      value={{
        open: isOpen || closing,
        closing,
        closeDuration: closeAnimationDuration,
        dismissable,
        requestOpen,
        requestClose,
        titleId,
        descriptionId,
        popupRef,
        registerClose,
      }}
    >
      {children}
    </DialogContext.Provider>
  )
}

// --- Trigger ---

interface TriggerProps {
  children: ReactNode
}

function Trigger({children}: TriggerProps) {
  const {requestOpen} = useDialog()

  return (
    <html.div onClick={requestOpen} style={styles.inlineWrapper}>
      {children}
    </html.div>
  )
}

// --- Portal (renders backdrop + viewport + popup) ---

interface PortalProps {
  children: ReactNode
  size?: DialogSize
}

function Portal({children, size = 'md'}: PortalProps) {
  const {
    open,
    closing,
    closeDuration,
    dismissable,
    requestClose,
    titleId,
    descriptionId,
    popupRef,
  } = useDialog()
  const mount = usePortalMount()

  const handleBackdropClick = useCallback(() => {
    if (dismissable) {
      requestClose()
    }
  }, [dismissable, requestClose])

  if (!open) return null

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

      {/* Viewport (centering container, pointer-events: none) */}
      <html.div style={styles.viewport}>
        <html.div
          ref={popupRef}
          role="dialog"
          aria-modal={true}
          tabIndex={-1}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          style={[
            styles.popup,
            styles[size],
            closing && styles.popupClosing,
            closing && closeDurationMap[closeDuration],
            !closing && styles.popupOpen,
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
  const {titleId} = useDialog()
  return (
    <html.h2 id={titleId} style={styles.title}>
      {children}
    </html.h2>
  )
}

// --- Description ---

function Description({children}: {children: ReactNode}) {
  const {descriptionId} = useDialog()
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
  const {requestClose, registerClose} = useDialog()
  useEffect(() => registerClose(), [registerClose])

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

export const Dialog = {
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
