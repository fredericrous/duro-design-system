import {Children, type ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {isNative} from '../../platform'
import {cellBasis, cellPosition, columnWeights, gridTemplate, type GridColumns} from './columns'
import type {SpacingToken} from '@duro-app/tokens/keys'

export type GridLayout = 'split' | 'split-wide'

interface GridProps {
  gap?: SpacingToken
  /** A column count (equal columns) or weights: `[1, 2]` gives a one-third /
   *  two-thirds split. Weights are the portable form of a track list — a CSS
   *  template string would be silently ignored on native. */
  columns?: GridColumns
  /** Responsive auto-fit: as many columns of at least this width as fit.
   *  Wins over `columns` when both are set. On native this approximates to
   *  cells of that minimum width that grow and wrap. */
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

// Fixed counts keep their static classes so existing web consumers emit the
// exact CSS they did before; only weight lists go through the dynamic style.
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

// On native the named layouts are their weights; there is no media query to
// collapse them, so a split stays a split on a phone (see NativeGrid).
const layoutWeights = {
  split: [1, 2],
  'split-wide': [1, 3],
} as const satisfies Record<GridLayout, readonly number[]>

const cellGapLeftMap = {
  xs: styles.cellGapLeftXs,
  sm: styles.cellGapLeftSm,
  ms: styles.cellGapLeftMs,
  md: styles.cellGapLeftMd,
  lg: styles.cellGapLeftLg,
  xl: styles.cellGapLeftXl,
  xxl: styles.cellGapLeftXxl,
  xxxl: styles.cellGapLeftXxxl,
} as const satisfies Record<SpacingToken, unknown>

const cellGapTopMap = {
  xs: styles.cellGapTopXs,
  sm: styles.cellGapTopSm,
  ms: styles.cellGapTopMs,
  md: styles.cellGapTopMd,
  lg: styles.cellGapTopLg,
  xl: styles.cellGapTopXl,
  xxl: styles.cellGapTopXxl,
  xxxl: styles.cellGapTopXxxl,
} as const satisfies Record<SpacingToken, unknown>

export function Grid({gap = 'md', columns, minColumnWidth, layout, children}: GridProps) {
  if (isNative) {
    return (
      <NativeGrid
        gap={gap}
        columns={layout ? layoutWeights[layout] : columns}
        minColumnWidth={layout ? undefined : minColumnWidth}
      >
        {children}
      </NativeGrid>
    )
  }

  const columnStyle = layout
    ? layoutMap[layout]
    : minColumnWidth
      ? styles.autoFit(minColumnWidth)
      : typeof columns === 'number'
        ? columnsMap[columns]
        : columns
          ? styles.template(gridTemplate(columnWeights(columns) ?? [1]))
          : undefined

  return <html.div style={[styles.base, gapMap[gap], columnStyle]}>{children}</html.div>
}

/**
 * React Native has no grid, so the native Grid is a wrapping flex row with
 * each child in a cell:
 *
 * - Weighted / counted columns: the cell's `flexBasis` is its column's share
 *   of the row. Percentages plus a real `gap` would overflow and wrap early,
 *   so the gap is padding on the cell instead — left on every cell that does
 *   not open a row, top on every row after the first. RN is border-box, so
 *   the bases still sum to exactly 100%, and the gap stays a token.
 * - `minColumnWidth`: cells start at that width and grow, and the row uses a
 *   real `gap`, since here wrapping is width-driven and row membership is
 *   not known from the index.
 *
 * Only this branch wraps children; on web grid children stay direct, so
 * existing DOM trees are untouched.
 */
function NativeGrid({gap = 'md', columns, minColumnWidth, children}: GridProps) {
  const items = Children.toArray(children)
  if (minColumnWidth) {
    return (
      <html.div style={[styles.nativeRow, gapMap[gap]]}>
        {items.map((child, index) => (
          <html.div key={index} style={styles.nativeMinCell(minColumnWidth)}>
            {child}
          </html.div>
        ))}
      </html.div>
    )
  }
  const weights = columnWeights(columns) ?? [1]
  return (
    <html.div style={styles.nativeRow}>
      {items.map((child, index) => {
        const {opensRow, firstRow} = cellPosition(index, weights.length)
        return (
          <html.div
            key={index}
            style={[
              styles.nativeCell(cellBasis(weights, index)),
              !opensRow && cellGapLeftMap[gap],
              !firstRow && cellGapTopMap[gap],
            ]}
          >
            {child}
          </html.div>
        )
      })}
    </html.div>
  )
}
