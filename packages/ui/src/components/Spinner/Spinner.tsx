import {html} from 'react-strict-dom'
import {styles} from './styles.css'

export type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  label?: string
}

const sizeMap = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} as const

export function Spinner({size = 'md', label = 'Loading'}: SpinnerProps) {
  return (
    <html.div role="status" style={styles.root}>
      <html.div style={[styles.spinner, sizeMap[size]]} aria-hidden />
      <html.span style={styles.srOnly}>{label}</html.span>
    </html.div>
  )
}
