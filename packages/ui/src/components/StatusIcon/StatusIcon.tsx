import {html} from 'react-strict-dom'
import {Icon} from '../Icon'
import type {IconName, IconSize} from '../Icon'
import {styles} from './styles.css'

export type StatusIconName = Extract<
  IconName,
  'x-circle' | 'check-circle' | 'check-done' | 'clock' | 'forbidden'
>
export type StatusIconVariant = 'error' | 'success' | 'warning' | 'info' | 'muted'

interface StatusIconProps {
  name: StatusIconName
  size?: IconSize
  variant?: StatusIconVariant
}

export function StatusIcon({name, size = 'xxl', variant = 'muted'}: StatusIconProps) {
  return (
    <html.div style={[styles.root, styles[variant]]}>
      <Icon name={name} size={size} />
    </html.div>
  )
}
