import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

export type SpacingKey = 'xs' | 'sm' | 'ms' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl'

interface StackProps {
  gap?: SpacingKey
  align?: 'start' | 'center' | 'end' | 'stretch'
  children: ReactNode
}

const gapMap = {
  xs: styles.gapXs,
  sm: styles.gapSm,
  ms: styles.gapMs,
  md: styles.gapMd,
  lg: styles.gapLg,
  xl: styles.gapXl,
  xxl: styles.gapXxl,
  xxxl: styles.gapXxxl,
} as const

const alignMap = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  stretch: styles.alignStretch,
} as const

export function Stack({gap = 'md', align = 'stretch', children}: StackProps) {
  return (
    <html.div style={[styles.base, gapMap[gap], alignMap[align]]}>
      {children}
    </html.div>
  )
}
