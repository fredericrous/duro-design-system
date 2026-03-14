import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {Icon} from '../Icon'
import type {IconName} from '../Icon'
import {styles} from './styles.css'

export type AlertVariant = 'error' | 'success' | 'warning' | 'info'

const defaultIcons: Record<AlertVariant, IconName> = {
  info: 'info-circle-filled',
  warning: 'alert-triangle-filled',
  success: 'check-circle-filled',
  error: 'x-circle-filled',
}

interface AlertProps {
  variant?: AlertVariant
  /** Built-in icon name, custom ReactNode, or false to hide. Defaults to variant icon. */
  icon?: IconName | ReactNode | false
  children: ReactNode
}

function resolveIcon(
  icon: AlertProps['icon'],
  variant: AlertVariant,
): ReactNode | null {
  if (icon === false) return null
  if (icon === undefined) return <Icon name={defaultIcons[variant]} size={18} />
  if (typeof icon === 'string') return <Icon name={icon as IconName} size={18} />
  return icon
}

export function Alert({variant = 'info', icon, children}: AlertProps) {
  const resolvedIcon = resolveIcon(icon, variant)

  return (
    <html.div role="alert" style={[styles.base, styles[variant]]}>
      {resolvedIcon ? (
        <>
          <html.div style={styles.iconWrap}>{resolvedIcon}</html.div>
          <html.div style={styles.content}>{children}</html.div>
        </>
      ) : (
        children
      )}
    </html.div>
  )
}
