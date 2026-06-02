import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {isNative} from '../../platform'
import {styles} from './styles.css'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  children: ReactNode
}

const sizeMap = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
} as const

export function Badge({variant = 'default', size = 'md', children}: BadgeProps) {
  return (
    <html.span style={[styles.base, isNative && styles.nativeFlex, sizeMap[size], styles[variant]]}>
      {children}
    </html.span>
  )
}
