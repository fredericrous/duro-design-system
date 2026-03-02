import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

export type ButtonVariant = 'primary' | 'secondary' | 'link' | 'danger'
export type ButtonSize = 'default' | 'small'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
  onClick?: () => void
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
  children,
}: ButtonProps) {
  return (
    <html.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={[
        styles.base,
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
