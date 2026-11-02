import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
} from 'react'
import {html} from 'react-strict-dom'
import {Drawer, type SideSnapPoint, type SnapPoint} from '../Drawer/Drawer'
import {useDrawer, type GrabberLabels} from '../Drawer/parts'
import {cycleDetent} from '../Drawer/sheetPhysics'
import {partStyles} from '../Drawer/parts.css'
import {styles} from './styles.css'
import {moveWithKey, panelOf, usePaneDrag} from './paneMove'
import type {DrawerBottomRootProps, DrawerSideRootProps} from '../Drawer/useDrawerRoot'

// A Pane is a non-modal Drawer that floats: inset from the edge, rounded all round, and resting at
// two sizes. It is built from the Drawer's own parts, so open state, focus, Escape, detents and
// swipe are the Drawer's, not a second copy.

/** The two widths a side pane rests at */
const SIDE_DETENTS = ['compact', 'expanded'] as const satisfies readonly SideSnapPoint[]
/** The two heights a bottom pane rests at */
const BOTTOM_DETENTS = ['medium', 'large'] as const satisfies readonly SnapPoint[]

/** `modal` is the Pane's own decision: it is never modal. `movable` lets a side pane be dragged by its header. */
export type PaneSideRootProps = Omit<DrawerSideRootProps, 'modal'> & {movable?: boolean}
export type PaneBottomRootProps = Omit<DrawerBottomRootProps, 'modal'> & {movable?: boolean}
export type PaneRootProps = PaneSideRootProps | PaneBottomRootProps

/** Whether this Pane's header moves it. A bottom pane never moves: it rests on its edge. */
const MovableContext = createContext(false)

function Root({movable = false, ...props}: PaneRootProps) {
  const enabled = movable && props.anchor !== 'bottom'
  if (props.anchor === 'bottom') {
    return (
      <MovableContext.Provider value={enabled}>
        <Drawer.Root {...props} modal={false} snapPoints={props.snapPoints ?? BOTTOM_DETENTS} />
      </MovableContext.Provider>
    )
  }
  return (
    <MovableContext.Provider value={enabled}>
      <Drawer.Root {...props} modal={false} snapPoints={props.snapPoints ?? SIDE_DETENTS} />
    </MovableContext.Provider>
  )
}

interface PortalProps {
  children: ReactNode
  /** The grabber's accessible names, by what a press does next */
  grabberLabels?: GrabberLabels
}

function Portal({children, grabberLabels}: PortalProps) {
  usePaneDrag(useContext(MovableContext))
  return (
    <Drawer.Portal placement="floating" grabberLabels={grabberLabels}>
      {children}
    </Drawer.Portal>
  )
}

type HeaderProps = ComponentProps<typeof Drawer.Header>

/** The Drawer's header. On a movable pane it is the handle: a drag moves the pane, a double-click puts it back. */
function Header(props: HeaderProps) {
  const movable = useContext(MovableContext)
  if (!movable) return <Drawer.Header {...props} />
  return (
    <html.div data-pane-handle="" style={styles.handle}>
      <Drawer.Header {...props} />
    </html.div>
  )
}

/** A header control that moves a movable pane with the arrow keys (Home puts it back): the non-drag way to move it. */
function Move() {
  const movable = useContext(MovableContext)
  const button = useRef<HTMLButtonElement>(null)
  // A native listener: the arrow keys need preventDefault, which the styled button's event type does not carry.
  useEffect(() => {
    const el = button.current
    if (!movable || !el) return
    function onKey(e: KeyboardEvent) {
      const panel = panelOf(el!)
      if (panel && moveWithKey(panel, e.key)) e.preventDefault()
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [movable])
  if (!movable) return null
  return (
    <html.button
      ref={button}
      type="button"
      aria-label="Move panel"
      style={[partStyles.closeButton, styles.move]}
    >
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M8 2v12M2 8h12M8 2 6 4M8 2l2 2M8 14l-2-2M8 14l2-2M2 8l2-2M2 8l2 2M14 8l-2-2M14 8l-2 2"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </html.button>
  )
}

export interface ExpandLabels {
  expand: string
  collapse: string
}

const DEFAULT_EXPAND_LABELS: ExpandLabels = {expand: 'Expand', collapse: 'Collapse'}

interface ExpandProps {
  /** The button's accessible names, by what a press does next */
  labels?: ExpandLabels
}

/** A header button that steps the pane between its sizes. Renders nothing without two detents. */
function Expand({labels = DEFAULT_EXPAND_LABELS}: ExpandProps) {
  const {snapPoints, sideSnapPoints, snapIndex, setSnapIndex} = useDrawer()
  const count = sideSnapPoints.length || snapPoints.length
  if (count < 2) return null
  const expanded = snapIndex === count - 1
  return (
    <html.button
      type="button"
      aria-label={expanded ? labels.collapse : labels.expand}
      onClick={() => setSnapIndex(cycleDetent(snapIndex, count))}
      style={[partStyles.closeButton, styles.expand]}
    >
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d={
            expanded
              ? 'M2 6h4V2M14 10h-4v4M6 6 2 2M10 10l4 4'
              : 'M6 2H2v4M10 14h4v-4M2 2l4.5 4.5M14 14l-4.5-4.5'
          }
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </html.button>
  )
}

export const Pane = {
  Root,
  Trigger: Drawer.Trigger,
  Portal,
  Header,
  Title: Drawer.Title,
  Body: Drawer.Body,
  Footer: Drawer.Footer,
  Close: Drawer.Close,
  Expand,
  Move,
}
