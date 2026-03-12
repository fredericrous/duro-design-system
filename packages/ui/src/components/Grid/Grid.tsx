import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import type {SpacingKey} from '../Stack/Stack'

interface GridProps {
  gap?: SpacingKey
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  minColumnWidth?: string
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

const columnsMap = {
  1: styles.col1,
  2: styles.col2,
  3: styles.col3,
  4: styles.col4,
  5: styles.col5,
  6: styles.col6,
} as const

export function Grid({gap = 'md', columns, minColumnWidth, children}: GridProps) {
  const columnStyle = minColumnWidth
    ? styles.autoFit(minColumnWidth)
    : columns
      ? columnsMap[columns]
      : undefined

  return (
    <html.div style={[styles.base, gapMap[gap], columnStyle]}>
      {children}
    </html.div>
  )
}
