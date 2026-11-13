import type {ReactNode} from 'react'

export interface SliderProps {
  /** Controlled value. */
  value?: number
  /** Initial value (uncontrolled). Default: `min`. */
  defaultValue?: number
  /** Called with the new value as it changes: on each key, and as a drag moves. */
  onValueChange?: (value: number) => void
  /** Lowest value. Default: 0 */
  min?: number
  /** Highest value. Default: 100 */
  max?: number
  /** The distance between values, counted from `min`. Default: 1 */
  step?: number
  /** Prevents user interaction. */
  disabled?: boolean
  /** A visible label; it names the slider. */
  children?: ReactNode
  /** Names the slider when it has no visible label (`children`). */
  'aria-label'?: string
  /** Shows the current value beside the label. */
  showValue?: boolean
  /** The value as text, for `aria-valuetext` and the visible value: `(v) => `${v}%``. Default: the number. */
  formatValue?: (value: number) => string
}
