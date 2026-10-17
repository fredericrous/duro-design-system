import type {ReactNode} from 'react'
import type {OnNavigate} from '../../shared/navigate'

/** What `Tree.Item` hands its row: state is decided there, markup here. */
export interface TreeRowProps {
  value: string
  level: number
  label: ReactNode
  meta?: ReactNode
  /** plain text of the item (typeahead, native names) */
  text: string
  href?: string
  onNavigate?: OnNavigate
  hasChildren: boolean
  open: boolean
  selected: boolean
  /** the item holds the tree's tab stop */
  tabStop: boolean
  /** draw the keyboard focus ring on the row */
  ringed: boolean
  labelId: string
  metaId: string
  onSelect: () => void
  onToggle: () => void
  /** the chevron control's accessible name (native) */
  expandLabel?: (label: string) => string
  /** the open branch's children, already inside their level context */
  branch: ReactNode
  /** web, windowed tree: the row is flat, placed by the window, and sets its own set size */
  windowed?: WindowedRow
}

/** What a row of a windowed tree adds: the window places and measures it. */
export interface WindowedRow {
  /** the row's index among the visible rows (the virtualizer's `data-index`) */
  index: number
  setSize: number
  posInSet: number
  /** distance from the top of the scrolled content, in px */
  top: number
  measureRef: (el: HTMLElement | null) => void
}
