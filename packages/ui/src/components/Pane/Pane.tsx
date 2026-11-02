import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import {html} from 'react-strict-dom'
import {Drawer, type SideSnapPoint, type SnapPoint} from '../Drawer/Drawer'
import {useDrawer, type GrabberLabels} from '../Drawer/parts'
import {cycleDetent} from '../Drawer/sheetPhysics'
import {partStyles} from '../Drawer/parts.css'
import {Menu} from '../Menu/Menu'
import {styles} from './styles.css'
import {
  DRAG_HANDLE_ATTR,
  movePanelTo,
  moveWithKey,
  panelOf,
  usePaneDrag,
  type PanePlace,
} from './paneMove'
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

/** Whether the header holds a Pane.Move: then Move, not Expand, starts the header's end group. */
interface HeaderMove {
  hasMove: boolean
  /** Move reports itself, wherever it sits in the header (a Fragment, a wrapper component). */
  setHasMove: (hasMove: boolean) => void
}
const HeaderMoveContext = createContext<HeaderMove | null>(null)

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
  usePaneDrag({enabled: useContext(MovableContext)})
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
  const [hasMove, setHasMove] = useState(false)
  const header = (
    <HeaderMoveContext.Provider value={{hasMove: movable && hasMove, setHasMove}}>
      <Drawer.Header {...props} />
    </HeaderMoveContext.Provider>
  )
  if (!movable) return header
  return (
    <html.div {...{[DRAG_HANDLE_ATTR]: ''}} style={styles.handle}>
      {header}
    </html.div>
  )
}

export interface MoveLabels {
  /** The control's accessible name */
  move: string
  /** The menu items: send the pane to the window's left edge, its right edge, or back to its place */
  toLeft: string
  toRight: string
  toDefault: string
}

const DEFAULT_MOVE_LABELS: MoveLabels = {
  move: 'Move panel',
  toLeft: 'Move to the left edge',
  toRight: 'Move to the right edge',
  toDefault: 'Back to its place',
}

interface MoveProps {
  /** The control's accessible name and its menu items */
  labels?: MoveLabels
}

/**
 * A header control that moves a movable pane without dragging it. A press opens a menu of places
 * (either edge, or back to its place), the single-pointer way to move it; with focus on it the
 * arrow keys nudge the pane (Shift for a larger step) and Home puts it back.
 */
function Move({labels = DEFAULT_MOVE_LABELS}: MoveProps) {
  const movable = useContext(MovableContext)
  const headerMove = useContext(HeaderMoveContext)
  const box = useRef<HTMLDivElement>(null)
  const setHasMove = headerMove?.setHasMove
  // Tell the header it holds a Move, so Expand gives up its own auto margin.
  useLayoutEffect(() => {
    if (!movable || !setHasMove) return
    setHasMove(true)
    return () => setHasMove(false)
  }, [movable, setHasMove])
  // A native listener on the wrapper: the arrow keys need preventDefault, and a closed Menu trigger
  // lets them through (an open menu has focus in its own popup, outside this wrapper).
  useEffect(() => {
    const el = box.current
    if (!movable || !el) return
    function onKey(e: KeyboardEvent) {
      const panel = panelOf(el!)
      if (panel && moveWithKey(panel, e)) e.preventDefault()
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [movable])
  if (!movable) return null
  const send = (place: PanePlace) => () => {
    const panel = box.current && panelOf(box.current)
    if (panel) movePanelTo(panel, place)
  }
  return (
    <html.div ref={box} style={styles.move}>
      <Menu.Root>
        <Menu.Trigger variant="ghost" aria-label={labels.move}>
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 2v12M2 8h12M8 2 6 4M8 2l2 2M8 14l-2-2M8 14l2-2M2 8l2-2M2 8l2 2M14 8l-2-2M14 8l-2 2"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Menu.Trigger>
        <Menu.Popup align="end">
          <Menu.Item onClick={send('left')}>{labels.toLeft}</Menu.Item>
          <Menu.Item onClick={send('right')}>{labels.toRight}</Menu.Item>
          <Menu.Item onClick={send('default')}>{labels.toDefault}</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </html.div>
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
  // Move, when it is there, already pushes the end group to the end: one auto margin, not two.
  const afterMove = useContext(HeaderMoveContext)?.hasMove ?? false
  const count = sideSnapPoints.length || snapPoints.length
  if (count < 2) return null
  const expanded = snapIndex === count - 1
  return (
    <html.button
      type="button"
      aria-label={expanded ? labels.collapse : labels.expand}
      onClick={() => setSnapIndex(cycleDetent(snapIndex, count))}
      style={[partStyles.closeButton, !afterMove && styles.expand]}
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
