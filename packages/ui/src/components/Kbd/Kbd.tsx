import {html} from 'react-strict-dom'
import {styles} from './styles.css'

// ---------------------------------------------------------------------------
// Kbd — a key or chord hint ("J", "Cmd" + "K"): one inline <kbd> per key,
// spaced apart. A hint, not a control; it does not listen for the keys.
// ---------------------------------------------------------------------------

export interface KbdProps {
  /** One entry per key; a chord is several, e.g. ['Cmd', 'K']. */
  keys: string[]
  /** Hide the hint from assistive tech when a labelled control beside it already says the key. */
  'aria-hidden'?: boolean
}

export function Kbd({keys, 'aria-hidden': ariaHidden}: KbdProps) {
  return (
    <html.span style={styles.group} aria-hidden={ariaHidden}>
      {keys.map((key, index) => (
        <html.kbd key={`${index}-${key}`} style={styles.key}>
          {key}
        </html.kbd>
      ))}
    </html.span>
  )
}
