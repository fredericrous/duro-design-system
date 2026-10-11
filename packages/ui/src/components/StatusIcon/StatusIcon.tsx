import {html} from 'react-strict-dom'
import {Icon} from '../Icon'
import type {IconName, IconSize} from '../Icon'
import type {ColorToken} from '@duro-app/tokens/keys'
import {isNative} from '../../platform'
import {styles} from './styles.css'

export type StatusIconName = Extract<
  IconName,
  'x-circle' | 'check-circle' | 'check-done' | 'clock' | 'forbidden'
>
export type StatusIconVariant = 'error' | 'success' | 'warning' | 'info' | 'muted'

// On native an Icon cannot inherit the variant's colour, so it is passed.
const iconColor = {
  error: 'error',
  success: 'success',
  warning: 'warning',
  info: 'info',
  muted: 'textMuted',
} as const satisfies Record<StatusIconVariant, ColorToken>

interface StatusIconProps {
  name: StatusIconName
  size?: IconSize
  variant?: StatusIconVariant
}

export function StatusIcon({name, size = 'xxl', variant = 'muted'}: StatusIconProps) {
  return (
    <html.div style={[styles.root, styles[variant]]}>
      <Icon name={name} size={size} color={isNative ? iconColor[variant] : undefined} />
    </html.div>
  )
}
