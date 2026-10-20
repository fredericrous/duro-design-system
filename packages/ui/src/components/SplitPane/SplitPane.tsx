import {
  Children,
  createContext,
  isValidElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import {html} from 'react-strict-dom'
import {SIZES_PX, SPACING_PX, type SizeToken} from '@duro-app/tokens/keys'
import type {Breakpoint} from '@duro-app/tokens/tokens/breakpoints.css'
import {useContainerBelow} from '../../hooks/useContainerBelow'
import {styles} from './styles.css'

interface SplitPaneContextValue {
  size: number
  min: number
  max: number
  setSize: (px: number) => void
  commitSize: (px: number) => void
  stacked: boolean
  collapsed: boolean
  collapsedContent: ReactNode
  primaryId: string
  label: string
}

const SplitPaneContext = createContext<SplitPaneContextValue | null>(null)

function useSplitPane(part: string) {
  const ctx = useContext(SplitPaneContext)
  if (!ctx) throw new Error(`SplitPane.${part} must be used within SplitPane.Root`)
  return ctx
}

/** Which Pane this is, in order: the first is the one the handle sizes. */
const PaneIndexContext = createContext(0)

/** One arrow press moves the handle this far; with Shift, `STEP_LARGE`. */
const STEP = SPACING_PX.md
const STEP_LARGE = SPACING_PX.xxl

const clamp = (px: number, min: number, max: number) => Math.min(max, Math.max(min, px))

interface RootProps {
  children: ReactNode
  /** The primary (first) pane's starting width, a size token. Default: `sidebarW` */
  defaultSize?: SizeToken
  /** Controlled width of the primary pane, in px (from `onSizeChange`) */
  size?: number
  /** Called with the primary pane's new width while the handle moves */
  onSizeChange?: (px: number) => void
  /**
   * Called once a resize ends, with the width it ended at: when a drag is
   * released (or cancelled) and after each keyboard step. Persist the width
   * here rather than on every `onSizeChange`.
   */
  onSizeCommit?: (px: number) => void
  /** The primary pane's narrowest width, a size token. Default: `sidebarW` */
  minSize?: SizeToken
  /** The primary pane's widest width, a size token. Default: `panelLg` */
  maxSize?: SizeToken
  /** Below this breakpoint, measured on the split's own width, the panes stack. Default: `sm` */
  collapseBelow?: Breakpoint
  /**
   * Controlled: shrink the primary pane to a strip (the `iconButton` size),
   * show `collapsedContent` in it and remove the handle. The pane's own
   * children stay mounted (their state is kept) but are inert and hidden. When
   * it turns false the pane returns to its prior width. Ignored when stacked.
   */
  collapsed?: boolean
  /** What the strip shows while `collapsed` (an expand button, icons). */
  collapsedContent?: ReactNode
  /** The handle's accessible name ("Resize list"). */
  'aria-label': string
}

/**
 * Two panes side by side with a resizable separator between them: a list
 * and its detail, an editor and its preview. The first Pane is sized by the
 * handle (pointer drag, arrow keys, Home and End); the second takes the rest.
 * Below `collapseBelow` the panes stack in one column and the handle goes.
 */
function Root({
  children,
  defaultSize = 'sidebarW',
  size: controlledSize,
  onSizeChange,
  onSizeCommit,
  minSize = 'sidebarW',
  maxSize = 'panelLg',
  collapseBelow = 'sm',
  collapsed = false,
  collapsedContent,
  'aria-label': label,
}: RootProps) {
  const min = SIZES_PX[minSize]
  const max = Math.max(min, SIZES_PX[maxSize])
  const [inner, setInner] = useState(() => clamp(SIZES_PX[defaultSize], min, max))
  const size = clamp(controlledSize ?? inner, min, max)
  const setSize = useCallback(
    (px: number) => {
      const next = clamp(Math.round(px), min, max)
      if (controlledSize === undefined) setInner(next)
      onSizeChange?.(next)
    },
    [controlledSize, onSizeChange, min, max],
  )
  const commitSize = useCallback(
    (px: number) => onSizeCommit?.(clamp(Math.round(px), min, max)),
    [onSizeCommit, min, max],
  )
  const rootRef = useRef<HTMLDivElement>(null)
  const stacked = useContainerBelow(rootRef, collapseBelow)
  const primaryId = useId()

  let paneIndex = 0
  const items = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === Pane) {
      const index = paneIndex++
      return <PaneIndexContext.Provider value={index}>{child}</PaneIndexContext.Provider>
    }
    return child
  })

  return (
    <SplitPaneContext.Provider
      value={{
        size,
        min,
        max,
        setSize,
        commitSize,
        stacked,
        collapsed,
        collapsedContent,
        primaryId,
        label,
      }}
    >
      <html.div ref={rootRef} style={[styles.root, stacked && styles.rootStacked]}>
        {items}
      </html.div>
    </SplitPaneContext.Provider>
  )
}

function Pane({children}: {children: ReactNode}) {
  const {size, stacked, collapsed, collapsedContent, primaryId} = useSplitPane('Pane')
  const primary = useContext(PaneIndexContext) === 0
  const strip = primary && collapsed && !stacked
  const bodyRef = useRef<HTMLDivElement>(null)

  // `inert` takes the stowed children out of the tab order and the accessibility
  // tree; set on the node because the strict-DOM element has no such prop.
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    if (strip) el.setAttribute('inert', '')
    else el.removeAttribute('inert')
  }, [strip])

  return (
    <html.div
      id={primary ? primaryId : undefined}
      style={[
        primary
          ? [
              styles.primary,
              !stacked && styles.primarySize(collapsed ? SIZES_PX.iconButton : size),
              !stacked && collapsed && styles.primaryStrip,
            ]
          : styles.secondary,
        stacked && styles.stackedPane,
      ]}
    >
      {strip ? collapsedContent : null}
      {primary ? (
        // The wrapper exists for the primary pane only, to stow its children
        // (inert) while collapsed; unstowed it fills the pane, so a child that
        // takes the pane's height keeps scrolling on its own.
        <html.div ref={bodyRef} style={strip ? styles.stowed : styles.fill}>
          {children}
        </html.div>
      ) : (
        children
      )}
    </html.div>
  )
}

function Handle() {
  const {size, min, max, setSize, commitSize, stacked, collapsed, primaryId, label} =
    useSplitPane('Handle')
  const [hovered, setHovered] = useState(false)
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{startX: number; startSize: number} | null>(null)
  const handleRef = useRef<HTMLDivElement>(null)

  // Arrow keys move the handle, Shift by larger steps; Home and End go to
  // the bounds. A DOM listener, for the full KeyboardEvent.
  useEffect(() => {
    const el = handleRef.current
    if (!el) return
    function onKeyDown(e: KeyboardEvent) {
      const step = e.shiftKey ? STEP_LARGE : STEP
      const next =
        e.key === 'ArrowLeft'
          ? size - step
          : e.key === 'ArrowRight'
            ? size + step
            : e.key === 'Home'
              ? min
              : e.key === 'End'
                ? max
                : null
      if (next === null) return
      e.preventDefault()
      setSize(next)
      commitSize(next)
    }
    el.addEventListener('keydown', onKeyDown)
    return () => el.removeEventListener('keydown', onKeyDown)
  }, [size, min, max, setSize, commitSize, stacked, collapsed])

  if (stacked || collapsed) return null
  const active = hovered || keyboardFocus || dragging

  return (
    <html.div
      ref={handleRef}
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation="vertical"
      aria-controls={primaryId}
      aria-valuenow={size}
      aria-valuemin={min}
      aria-valuemax={max}
      style={styles.handle}
      onFocus={(e: {currentTarget: HTMLElement}) =>
        setKeyboardFocus(e.currentTarget.matches(':focus-visible'))
      }
      onBlur={() => setKeyboardFocus(false)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={(e: {
        button: number
        clientX: number
        pointerId: number
        currentTarget: HTMLElement
      }) => {
        if (e.button !== 0) return
        e.currentTarget.setPointerCapture(e.pointerId)
        drag.current = {startX: e.clientX, startSize: size}
        setDragging(true)
      }}
      onPointerMove={(e: {clientX: number}) => {
        if (!drag.current) return
        setSize(drag.current.startSize + e.clientX - drag.current.startX)
      }}
      onPointerUp={() => {
        if (!drag.current) return
        drag.current = null
        setDragging(false)
        commitSize(size)
      }}
      onPointerCancel={() => {
        if (!drag.current) return
        drag.current = null
        setDragging(false)
        commitSize(size)
      }}
    >
      <html.span aria-hidden style={[styles.line, active && styles.lineActive]} />
      <html.span aria-hidden style={[styles.grip, active && styles.gripShown]} />
    </html.div>
  )
}

export const SplitPane = {
  Root,
  Pane,
  Handle,
}
