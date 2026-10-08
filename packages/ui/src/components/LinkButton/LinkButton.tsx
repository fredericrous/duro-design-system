import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {linkClickHandler, type OnNavigate} from '../../shared/navigate'

export type LinkButtonVariant = 'primary' | 'secondary'
export type LinkButtonSize = 'default' | 'small'

interface LinkButtonProps {
  href: string
  variant?: LinkButtonVariant
  size?: LinkButtonSize
  fullWidth?: boolean
  target?: '_blank' | '_self'
  rel?: string
  /**
   * Client-side navigation: called for a plain primary click (no modifier
   * key, no `target`); the browser default runs for every other click. Call
   * `event.preventDefault()`, then your router's navigate.
   */
  onNavigate?: OnNavigate
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
  onNavigate,
  children,
}: LinkButtonProps) {
  return (
    <html.a
      href={href}
      target={target}
      rel={rel}
      onClick={linkClickHandler(href, onNavigate, target)}
      style={[styles.base, sizeMap[size], styles[variant], fullWidth && styles.fullWidth]}
    >
      {children}
    </html.a>
  )
}
