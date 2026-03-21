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

// --- Types ---

export type DialogSize = 'sm' | 'md' | 'lg'

// --- Context ---

interface DialogContextValue {
  open: boolean
  closing: boolean
  dismissable: boolean
  requestOpen: () => void
  requestClose: () => void
  titleId: string
  descriptionId: string
  popupRef: RefObject<HTMLDivElement | null>
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
  /** Whether clicking backdrop closes the dialog. Default: true */
  dismissable?: boolean
  /** Duration of the close animation in ms. Default: 140 */
  closeAnimationDuration?: number
}

function Root({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  dismissable = true,
  closeAnimationDuration = 140,
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
    }, closeAnimationDuration)
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
    <DialogContext.Provider
      value={{
        open: isOpen || closing,
        closing,
        dismissable,
        requestOpen,
        requestClose,
        titleId,
        descriptionId,
        popupRef,
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
  const {open, closing, dismissable, requestClose, titleId, descriptionId, popupRef} = useDialog()

  const handleBackdropClick = useCallback(() => {
    if (dismissable) {
      requestClose()
    }
  }, [dismissable, requestClose])

  if (!open) return null

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

      {/* Viewport (centering container, pointer-events: none) */}
      <html.div style={styles.viewport}>
        <html.div
          ref={popupRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          style={[
            styles.popup,
            styles[size],
            closing && styles.popupClosing,
            !closing && styles.popupOpen,
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
  const {requestClose} = useDialog()

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
