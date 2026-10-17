import type {ReactNode} from 'react'
import type {Length} from '../../shared/length'
import type {TreeRowModel} from './TreeRows'

/* Native renders every row (windowing is the host app's, plan N0): the web
 * window and its @tanstack/react-virtual stay out of the native graph. */
export const CAN_WINDOW = false

interface TreeWindowProps {
  rows: readonly TreeRowModel[]
  maxHeight?: Length
  'aria-label'?: string
  'aria-labelledby'?: string
  scrollRef: unknown
}

export function TreeWindow(_props: TreeWindowProps): ReactNode {
  return null
}
