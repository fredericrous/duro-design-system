import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {isNative} from '../../platform'
import {styles} from './styles.css'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'highlight'
export type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  /** A small dot before the text, in the variant's colour. Decorative: the text stays the name. */
  dot?: boolean
  children: ReactNode
}

const sizeMap = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
} as const

const dotMap = {
  default: styles.dotDefault,
  success: styles.dotSuccess,
  warning: styles.dotWarning,
  error: styles.dotError,
  info: styles.dotInfo,
  highlight: styles.dotHighlight,
} as const

export function Badge({variant = 'default', size = 'md', dot = false, children}: BadgeProps) {
  return (
    <html.span
      style={[
        styles.base,
        isNative && styles.nativeFlex,
        sizeMap[size],
        styles[variant],
        dot && styles.withDot,
      ]}
    >
      {dot ? (
        <html.span aria-hidden data-duro-dot="" style={[styles.dot, dotMap[variant]]} />
      ) : null}
      {children}
    </html.span>
  )
}
