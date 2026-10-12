import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import type {SizeToken} from '@duro-app/tokens/keys'
import type {Breakpoint} from '@duro-app/tokens/tokens/breakpoints.css'
import {styles} from './styles.css'

interface RootProps {
  children: ReactNode
  /** Web only: on a phone the panes stack. */
  defaultSize?: SizeToken
  /** Web only. */
  size?: number
  /** Web only. */
  onSizeChange?: (px: number) => void
  /** Web only. */
  minSize?: SizeToken
  /** Web only. */
  maxSize?: SizeToken
  /** Web only: a phone is below every breakpoint, so native always stacks. */
  collapseBelow?: Breakpoint
  /** The handle's accessible name (web only: native has no handle). */
  'aria-label': string
}

/**
 * Native SplitPane (plan N0, Slice B): a phone shows one pane at a time's
 * worth of width, so the panes stack in one column and there is no handle —
 * the shape the web takes below `collapseBelow`.
 */
function Root({children}: RootProps) {
  return <html.div style={[styles.root, styles.rootStacked]}>{children}</html.div>
}

function Pane({children}: {children: ReactNode}) {
  return <html.div style={styles.stackedPane}>{children}</html.div>
}

/** No handle on native. */
function Handle() {
  return null
}

export const SplitPane = {
  Root,
  Pane,
  Handle,
}
