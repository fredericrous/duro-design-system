import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useId,
} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

// --- Context ---

type Placement = 'top' | 'bottom' | 'left' | 'right'

interface TooltipContextValue {
  open: boolean
  show: () => void
  hide: () => void
  tooltipId: string
  placement: Placement
}

const TooltipContext = createContext<TooltipContextValue | null>(null)

function useTooltip() {
  const ctx = useContext(TooltipContext)
  if (!ctx) throw new Error('Tooltip compound components must be used within Tooltip.Root')
  return ctx
}

// --- Root ---

interface RootProps {
  children: ReactNode
  content: ReactNode
  placement?: Placement
  delay?: number
}

function Root({children, content, placement = 'top', delay = 300}: RootProps) {
  const [open, setOpen] = useState(false)
  const tooltipId = useId()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setOpen(true), delay)
  }, [delay])

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setOpen(false)
  }, [])

  return (
    <TooltipContext.Provider value={{open, show, hide, tooltipId, placement}}>
      <html.div style={styles.root}>
        {children}
        {open && (
          <html.div id={tooltipId} role="tooltip" style={[styles.popup, styles[placement]]}>
            {content}
          </html.div>
        )}
      </html.div>
    </TooltipContext.Provider>
  )
}

// --- Trigger ---

interface TriggerProps {
  children: ReactNode
}

function Trigger({children}: TriggerProps) {
  const {open, show, hide, tooltipId} = useTooltip()

  return (
    <html.div
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={open ? tooltipId : undefined}
    >
      {children}
    </html.div>
  )
}

export const Tooltip = {
  Root,
  Trigger,
}
