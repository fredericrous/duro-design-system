import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import type {SpacingKey} from '../Stack/Stack'

interface ClusterProps {
  gap?: SpacingKey
  align?: 'start' | 'center' | 'end'
  justify?: 'start' | 'center' | 'end' | 'between'
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
} as const

const justifyMap = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  between: styles.justifyBetween,
} as const

export function Cluster({gap = 'sm', align = 'start', justify = 'start', children}: ClusterProps) {
  return (
    <html.div style={[styles.base, gapMap[gap], alignMap[align], justifyMap[justify]]}>
      {children}
    </html.div>
  )
}
