import type {ReactNode} from 'react'
import type {Orientation} from '../../shared/types'

export interface ToolbarProps {
  /** Names the toolbar ("Formatting"). Required: a toolbar is a landmark-like widget. */
  'aria-label': string
  /**
   * Arrow keys follow the orientation: Left/Right (default) or Up/Down. A
   * vertical toolbar cannot hold a Select, whose closed trigger opens on
   * ArrowDown/ArrowUp. A Menu can: its closed trigger handles no arrow key,
   * so Up/Down move past it and Enter or Space opens it.
   */
  orientation?: Orientation
  children: ReactNode
}
