import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import type {ToolbarProps} from './types'

export type {ToolbarProps} from './types'

/**
 * Native Toolbar: a row (or column) of controls with the web's props. The
 * roving tab stop and arrow keys are web only: a touch screen reaches every
 * control directly, so each control keeps its own press target.
 */
export function Toolbar({
  'aria-label': ariaLabel,
  orientation = 'horizontal',
  children,
}: ToolbarProps) {
  return (
    <html.div
      role="toolbar"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      style={[styles.root, orientation === 'vertical' && styles.vertical]}
    >
      {children}
    </html.div>
  )
}
