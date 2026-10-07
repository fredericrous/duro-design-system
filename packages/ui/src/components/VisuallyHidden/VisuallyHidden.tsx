import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {visuallyHidden} from '../../styles/visually-hidden.css'

interface VisuallyHiddenProps {
  children: ReactNode
  /** For aria-describedby / aria-labelledby to point at. */
  id?: string
}

/**
 * Text for assistive tech only: in the accessibility tree, not on screen. Use
 * it to give an icon-only control or a visual-only cue words — a status a
 * colour shows, "(opens in a new tab)" after a link.
 */
export function VisuallyHidden({children, id}: VisuallyHiddenProps) {
  return (
    <html.span id={id} style={[visuallyHidden.base, visuallyHidden.text]}>
      {children}
    </html.span>
  )
}
