import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'interactive'
/** `flush`: no padding, the content reaching the card's rounded edge (a List of rows). */
export type CardSize = 'default' | 'compact' | 'full' | 'flush'

interface CardProps {
  variant?: CardVariant
  size?: CardSize
  header?: string
  onClick?: () => void
  children: ReactNode
}

const sizeMap = {
  default: styles.sizeDefault,
  compact: styles.sizeCompact,
  full: styles.sizeFull,
  flush: styles.sizeFlush,
} as const

export function Card({
  variant = 'outlined',
  size = 'default',
  header,
  onClick,
  children,
}: CardProps) {
  return (
    <html.div onClick={onClick} style={[styles.base, styles[variant], sizeMap[size]]}>
      {header && <html.div style={styles.header}>{header}</html.div>}
      {children}
    </html.div>
  )
}
