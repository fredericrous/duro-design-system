import {html} from 'react-strict-dom'
import {ring} from './ring.css'
import {styles} from './styles.css'
import {visuallyHidden} from '../../styles/visually-hidden.css'
import type {SpinnerProps} from './Spinner.types'

export type {SpinnerProps, SpinnerSize} from './Spinner.types'

export function Spinner({size = 'md', label = 'Loading'}: SpinnerProps) {
  return (
    <html.div role="status" style={ring.root}>
      <html.div style={[ring.ring, ring[size], styles.spinning]} aria-hidden />
      <html.span style={[visuallyHidden.base, ring.srOnly]}>{label}</html.span>
    </html.div>
  )
}
