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

export type DetailPanelSize = 'sm' | 'md'

// --- Context ---

interface DetailPanelContextValue {
  present: boolean
  closing: boolean
  requestOpen: () => void
  requestClose: () => void
  titleId: string
  labelId: string | undefined
  registerTitle: (id: string) => void
  unregisterTitle: () => void
  panelRef: RefObject<HTMLDivElement | null>
}

const DetailPanelContext = createContext<DetailPanelContextValue | null>(null)

function useDetailPanel() {
  const ctx = useContext(DetailPanelContext)
  if (!ctx) throw new Error('DetailPanel compound components must be used within DetailPanel.Root')
  return ctx
}

// --- Root ---

interface RootProps {
  children: ReactNode
  /** Controlled open state */
  open?: boolean
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Duration of the close animation in ms. Default: 220 */
  closeAnimationDuration?: number
}

function Root({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  closeAnimationDuration = 220,
}: RootProps) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [present, setPresent] = useState(defaultOpen)
  const [closing, setClosing] = useState(false)
  const closingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<Element | null>(null)

  const titleId = useId()
  const [labelId, setLabelId] = useState<string | undefined>(undefined)

  const isOpen = isControlled ? controlledOpen : internalOpen

  // Sync presence with open state
  useEffect(() => {
    if (isOpen && !present) {
      setPresent(true)
      setClosing(false)
    } else if (!isOpen && present && !closing) {
      setClosing(true)
      closingTimerRef.current = setTimeout(() => {
        setClosing(false)
        setPresent(false)
        closingTimerRef.current = null
      }, closeAnimationDuration)
    }
  }, [isOpen, present, closing, closeAnimationDuration])

  // Focus management: move focus on open, restore on close
  useEffect(() => {
    if (present && !closing) {
      previousFocusRef.current = document.activeElement
      panelRef.current?.focus()
    }
  }, [present]) // eslint-disable-line react-hooks/exhaustive-deps -- only on present change

  useEffect(() => {
    if (!present && previousFocusRef.current) {
      const el = previousFocusRef.current as HTMLElement
      if (typeof el.focus === 'function') {
        el.focus()
      }
      previousFocusRef.current = null
    }
  }, [present])

  // ESC handler
  useEffect(() => {
    if (!present || closing) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        requestClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [present, closing]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current)
    }
  }, [])

  const requestOpen = useCallback(() => {
    if (closingTimerRef.current) {
      clearTimeout(closingTimerRef.current)
      closingTimerRef.current = null
      setClosing(false)
    }
    if (!isControlled) setInternalOpen(true)
    onOpenChange?.(true)
  }, [isControlled, onOpenChange])

  const requestClose = useCallback(() => {
    if (!isControlled) setInternalOpen(false)
    onOpenChange?.(false)
  }, [isControlled, onOpenChange])

  const registerTitle = useCallback((id: string) => {
    setLabelId(id)
  }, [])

  const unregisterTitle = useCallback(() => {
    setLabelId(undefined)
  }, [])

  return (
    <DetailPanelContext.Provider
      value={{
        present,
        closing,
        requestOpen,
        requestClose,
        titleId,
        labelId,
        registerTitle,
        unregisterTitle,
        panelRef,
      }}
    >
      {children}
    </DetailPanelContext.Provider>
  )
}

// --- Content ---

interface ContentProps {
  children: ReactNode
  /** Width of the panel. Default: 'sm' (360px) */
  size?: DetailPanelSize
  /** Accessible name for the complementary landmark */
  label: string
}

const wrapperOpenMap = {
  sm: styles.wrapperOpenSm,
  md: styles.wrapperOpenMd,
} as const

const wrapperCloseMap = {
  sm: styles.wrapperCloseSm,
  md: styles.wrapperCloseMd,
} as const

function Content({children, size = 'sm', label}: ContentProps) {
  const {present, closing, labelId, panelRef} = useDetailPanel()

  if (!present) return null

  return (
    <html.div
      style={[
        styles.wrapper,
        closing ? wrapperCloseMap[size] : wrapperOpenMap[size],
      ]}
    >
      <html.div
        ref={panelRef}
        role="complementary"
        aria-label={!labelId ? label : undefined}
        aria-labelledby={labelId || undefined}
        tabIndex={-1}
        style={[
          styles.content,
          size === 'sm' ? styles.contentSm : styles.contentMd,
          closing ? styles.slideOut : styles.slideIn,
        ]}
      >
        {children}
      </html.div>
    </html.div>
  )
}

// --- Header ---

function Header({children}: {children: ReactNode}) {
  return <html.div style={styles.header}>{children}</html.div>
}

// --- Title ---

function Title({children}: {children: ReactNode}) {
  const {titleId, registerTitle, unregisterTitle} = useDetailPanel()

  useEffect(() => {
    registerTitle(titleId)
    return () => unregisterTitle()
  }, [titleId, registerTitle, unregisterTitle])

  return (
    <html.h2 id={titleId} style={styles.title}>
      {children}
    </html.h2>
  )
}

// --- Body ---

interface BodyProps {
  children: ReactNode
  /** Adds inner padding. Default: true */
  padded?: boolean
}

function Body({children, padded = true}: BodyProps) {
  return (
    <html.div style={[styles.body, padded && styles.bodyPadded]}>
      {children}
    </html.div>
  )
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
  const {requestClose} = useDetailPanel()

  if (children) {
    return (
      <html.div onClick={requestClose} style={styles.inlineWrapper}>
        {children}
      </html.div>
    )
  }

  return (
    <html.button
      onClick={requestClose}
      aria-label={ariaLabel}
      style={styles.closeButton}
    >
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

export const DetailPanel = {
  Root,
  Content,
  Header,
  Title,
  Body,
  Footer,
  Close,
}
