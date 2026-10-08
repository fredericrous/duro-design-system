import {html} from 'react-strict-dom'
import {styles} from './styles.css'

// ---------------------------------------------------------------------------
// Meter — a scalar inside a known range (WIP 2 of 3, 40% of a milestone's
// tasks done): role="meter" with a value text, drawn as a thin bar of the
// `meterH` token. Not a progress bar for a running task (use Spinner) and
// not an input (no thumb).
// ---------------------------------------------------------------------------

export type MeterTone = 'accent' | 'success' | 'warning' | 'error'

export interface MeterProps {
  value: number
  /** Defaults to 0. */
  min?: number
  /** Defaults to 1, so a fraction needs nothing else. */
  max?: number
  /** The accessible name, e.g. "In progress WIP". */
  label: string
  /** What screen readers read for the value, e.g. "4 of 3, over the limit".
   *  Defaults to the percentage. */
  valueText?: string
  /** The fill's colour; defaults to accent. */
  tone?: MeterTone
}

const toneStyle = {
  accent: styles.accent,
  success: styles.success,
  warning: styles.warning,
  error: styles.error,
} as const

export function Meter({value, min = 0, max = 1, label, valueText, tone = 'accent'}: MeterProps) {
  const span = max - min
  const fraction = span > 0 ? (value - min) / span : 0
  const clamped = Math.min(Math.max(fraction, 0), 1)
  // aria-valuenow must sit inside the range; the true value (over the
  // limit, say) is what valueText is for.
  const now = Math.min(Math.max(value, min), max)
  return (
    <html.div
      role="meter"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={now}
      aria-valuetext={valueText ?? `${Math.round(clamped * 100)}%`}
      style={styles.track}
    >
      <html.div style={[styles.fill, toneStyle[tone], styles.fillAt(clamped * 100)]} />
    </html.div>
  )
}
