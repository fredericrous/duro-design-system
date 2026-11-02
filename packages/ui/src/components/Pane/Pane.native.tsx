import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {Drawer, type SideSnapPoint, type SnapPoint} from '../Drawer/Drawer'
import {useDrawer, type GrabberLabels} from '../Drawer/parts'
import {cycleDetent} from '../Drawer/sheetPhysics'
import {partStyles} from '../Drawer/parts.css'
import {Text} from '../Text/Text'
import {styles} from './styles.css'
import type {DrawerBottomRootProps, DrawerSideRootProps} from '../Drawer/useDrawerRoot'

// The native Pane: the same non-modal, floating Drawer as on the web. It draws in the base portal
// host (no Modal, no backdrop), so the app behind stays touchable and a Dialog opened later covers it.

/** The two widths a side pane rests at */
const SIDE_DETENTS = ['compact', 'expanded'] as const satisfies readonly SideSnapPoint[]
/** The two heights a bottom pane rests at */
const BOTTOM_DETENTS = ['medium', 'large'] as const satisfies readonly SnapPoint[]

/** `modal` is the Pane's own decision: it is never modal. */
// `movable` is web-only (a drag on a header): on React Native it is accepted and does nothing.
export type PaneSideRootProps = Omit<DrawerSideRootProps, 'modal'> & {movable?: boolean}
export type PaneBottomRootProps = Omit<DrawerBottomRootProps, 'modal'> & {movable?: boolean}
export type PaneRootProps = PaneSideRootProps | PaneBottomRootProps

function Root({movable: _movable, ...props}: PaneRootProps) {
  if (props.anchor === 'bottom') {
    return <Drawer.Root {...props} modal={false} snapPoints={props.snapPoints ?? BOTTOM_DETENTS} />
  }
  return <Drawer.Root {...props} modal={false} snapPoints={props.snapPoints ?? SIDE_DETENTS} />
}

interface PortalProps {
  children: ReactNode
  /** The grabber's accessible names, by what a press does next */
  grabberLabels?: GrabberLabels
}

function Portal({children, grabberLabels}: PortalProps) {
  return (
    <Drawer.Portal placement="floating" grabberLabels={grabberLabels}>
      {children}
    </Drawer.Portal>
  )
}

/** The Move control's names: on React Native it renders nothing, the type keeps shared code typed. */
export interface MoveLabels {
  move: string
  toLeft: string
  toRight: string
  toDefault: string
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
      <Text color="muted" variant="label">
        {expanded ? '⤡' : '⤢'}
      </Text>
    </html.button>
  )
}

export const Pane = {
  Root,
  Trigger: Drawer.Trigger,
  Portal,
  Header: Drawer.Header,
  Title: Drawer.Title,
  Body: Drawer.Body,
  Footer: Drawer.Footer,
  Close: Drawer.Close,
  Expand,
  // Moving a pane is web only: on React Native the control renders nothing, so shared code still runs.
  Move: (_props: {labels?: MoveLabels}) => null,
}
