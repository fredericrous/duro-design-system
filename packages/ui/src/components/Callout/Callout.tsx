import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {Icon} from '../Icon'
import type {IconName} from '../Icon'
import {styles} from './styles.css'

export type CalloutVariant = 'error' | 'success' | 'warning' | 'info'

const defaultIcons: Record<CalloutVariant, IconName> = {
  info: 'info-circle-filled',
  warning: 'alert-triangle-filled',
  success: 'check-circle-filled',
  error: 'x-circle-filled',
}

interface CalloutProps {
  variant?: CalloutVariant
  /** Built-in icon name, custom ReactNode, or false to hide. Defaults to variant icon. */
  icon?: IconName | ReactNode | false
  children: ReactNode
}

function resolveIcon(icon: CalloutProps['icon'], variant: CalloutVariant): ReactNode | null {
  if (icon === false) return null
  if (icon === undefined) return <Icon name={defaultIcons[variant]} size={36} />
  if (typeof icon === 'string') return <Icon name={icon as IconName} size={36} />
  return icon
}

export function Callout({variant = 'info', icon, children}: CalloutProps) {
  const resolvedIcon = resolveIcon(icon, variant)

  return (
    <html.div role="note" style={[styles.base, styles[variant]]}>
      {resolvedIcon && <html.span style={styles.icon}>{resolvedIcon}</html.span>}
      {children}
    </html.div>
  )
}
