import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {visuallyHidden} from '../../styles/visually-hidden.css'

interface VisuallyHiddenProps {
  children: ReactNode
  /** For aria-describedby / aria-labelledby to point at. */
  id?: string
}

/**
 * Text for assistive tech only. On native it is a 1x1 clipped Text that stays
 * in the accessibility tree (a screen reader reads it as part of the control
 * that holds it); `clip` is a web property, so only the box technique is used.
 */
export function VisuallyHidden({children, id}: VisuallyHiddenProps) {
  return (
    <html.span id={id} style={visuallyHidden.base}>
      {children}
    </html.span>
  )
}
