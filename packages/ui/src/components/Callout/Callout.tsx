import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {Icon} from '../Icon'
import type {IconName} from '../Icon'
import type {ColorToken} from '@duro-app/tokens/keys'
import {isNative} from '../../platform'
import {styles} from './styles.css'

export type CalloutVariant = 'error' | 'success' | 'warning' | 'info'

const defaultIcons: Record<CalloutVariant, IconName> = {
  info: 'info-circle-filled',
  warning: 'alert-triangle-filled',
  success: 'check-circle-filled',
  error: 'x-circle-filled',
}

// On native an Icon cannot inherit the variant's text colour, so it is passed
// (the web keeps inheriting it).
const iconColor = {
  error: 'errorText',
  success: 'successText',
  warning: 'warningText',
  info: 'infoText',
} as const satisfies Record<CalloutVariant, ColorToken>

interface CalloutProps {
  variant?: CalloutVariant
  /** Built-in icon name, custom ReactNode, or false to hide. Defaults to variant icon. */
  icon?: IconName | ReactNode | false
  /**
   * Vertical alignment of the icon against the message. `center` (default)
   * suits short single/two-line messages; `start` aligns the icon to the first
   * line for long multi-paragraph content.
   */
  align?: 'center' | 'start'
  children: ReactNode
}

function resolveIcon(icon: CalloutProps['icon'], variant: CalloutVariant): ReactNode | null {
  if (icon === false) return null
  const color = isNative ? iconColor[variant] : undefined
  if (icon === undefined) return <Icon name={defaultIcons[variant]} size="xl" color={color} />
  if (typeof icon === 'string') return <Icon name={icon as IconName} size="xl" color={color} />
  return icon
}

export function Callout({variant = 'info', icon, align = 'center', children}: CalloutProps) {
  const resolvedIcon = resolveIcon(icon, variant)

  return (
    <html.div
      role="note"
      style={[
        styles.base,
        styles[variant],
        align === 'center' ? styles.alignCenter : styles.alignStart,
      ]}
    >
      {resolvedIcon && <html.span style={styles.icon}>{resolvedIcon}</html.span>}
      <html.div style={styles.content}>{children}</html.div>
    </html.div>
  )
}
