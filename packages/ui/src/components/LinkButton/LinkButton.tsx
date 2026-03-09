import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

export type LinkButtonVariant = 'primary' | 'secondary'
export type LinkButtonSize = 'default' | 'small'

interface LinkButtonProps {
  href: string
  variant?: LinkButtonVariant
  size?: LinkButtonSize
  fullWidth?: boolean
  target?: '_blank' | '_self'
  rel?: string
  children: ReactNode
}

const sizeMap = {
  default: styles.sizeDefault,
  small: styles.sizeSmall,
} as const

export function LinkButton({
  href,
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  target,
  rel,
  children,
}: LinkButtonProps) {
  return (
    <html.a
      href={href}
      target={target}
      rel={rel}
      style={[styles.base, sizeMap[size], styles[variant], fullWidth && styles.fullWidth]}
    >
      {children}
    </html.a>
  )
}
