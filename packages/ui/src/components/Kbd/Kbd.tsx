import {html} from 'react-strict-dom'
import {styles} from './styles.css'

// ---------------------------------------------------------------------------
// Kbd — a key or chord hint ("J", "Cmd" + "K"): one inline <kbd> per key,
// spaced apart. A hint, not a control; it does not listen for the keys.
// ---------------------------------------------------------------------------

export interface KbdProps {
  /** One entry per key; a chord is several, e.g. ['Cmd', 'K']. */
  keys: string[]
}

export function Kbd({keys}: KbdProps) {
  return (
    <html.span style={styles.group}>
      {keys.map((key, index) => (
        <html.kbd key={`${index}-${key}`} style={styles.key}>
          {key}
        </html.kbd>
      ))}
    </html.span>
  )
}
