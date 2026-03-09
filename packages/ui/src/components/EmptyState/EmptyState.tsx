import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

interface EmptyStateProps {
  message: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({message, icon, action}: EmptyStateProps) {
  return (
    <html.div style={styles.root}>
      {icon}
      <html.p style={styles.message}>{message}</html.p>
      {action && <html.div style={styles.action}>{action}</html.div>}
    </html.div>
  )
}
