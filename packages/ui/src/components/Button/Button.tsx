import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {isNative} from '../../platform'
import {styles} from './styles.css'

export type ButtonVariant = 'primary' | 'secondary' | 'inverseSecondary' | 'link' | 'danger'
export type ButtonSize = 'default' | 'small'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
  onClick?: () => void
  /** Accessible name override — e.g. for buttons whose visible text isn't unique. */
  'aria-label'?: string
  children: ReactNode
}

const sizeMap = {
  default: styles.sizeDefault,
  small: styles.sizeSmall,
} as const

export function Button({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  'aria-label': ariaLabel,
  children,
}: ButtonProps) {
  return (
    <html.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      style={[
        styles.base,
        isNative && styles.nativeFlex,
        sizeMap[size],
        styles[variant],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
    >
      {children}
    </html.button>
  )
}
