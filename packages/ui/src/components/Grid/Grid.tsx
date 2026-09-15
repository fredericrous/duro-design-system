import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import type {SpacingToken} from '@duro-app/tokens/keys'

export type GridLayout = 'split' | 'split-wide'

interface GridProps {
  gap?: SpacingToken
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  minColumnWidth?: string
  /**
   * A named responsive layout. `split` is list/detail (1:2, list ≥ 240px),
   * `split-wide` is nav/content (1:3, nav ≥ 280px); both collapse to one
   * column below the `md` breakpoint. Wins over `columns` / `minColumnWidth`.
   */
  layout?: GridLayout
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
} as const satisfies Record<SpacingToken, unknown>

const columnsMap = {
  1: styles.col1,
  2: styles.col2,
  3: styles.col3,
  4: styles.col4,
  5: styles.col5,
  6: styles.col6,
} as const

const layoutMap = {
  split: styles.split,
  'split-wide': styles.splitWide,
} as const satisfies Record<GridLayout, unknown>

export function Grid({gap = 'md', columns, minColumnWidth, layout, children}: GridProps) {
  const columnStyle = layout
    ? layoutMap[layout]
    : minColumnWidth
      ? styles.autoFit(minColumnWidth)
      : columns
        ? columnsMap[columns]
        : undefined

  return <html.div style={[styles.base, gapMap[gap], columnStyle]}>{children}</html.div>
}
