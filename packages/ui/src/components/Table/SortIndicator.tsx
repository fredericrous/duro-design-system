import type {Column} from '@tanstack/react-table'
import {html} from 'react-strict-dom'
import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'

const styles = css.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: 4,
    fontSize: 10,
    userSelect: 'none',
    // Hidden by default, shown on hover or when active
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: '120ms',
  },
  active: {
    opacity: 1,
    color: colors.accent,
  },
  inactive: {
    color: colors.textMuted,
  },
})

interface SortIndicatorProps<TData> {
  column: Column<TData, unknown>
}

/**
 * Sort direction chevron for table column headers.
 *
 * - Shows \u25B2 (asc), \u25BC (desc), or \u21C5 (unsorted)
 * - Hidden by default, visible on header hover or when actively sorted
 * - Clicking the header cell should call column.getToggleSortingHandler()
 *
 * The parent HeaderCell applies a :hover rule that sets child opacity to 1.
 */
export function SortIndicator<TData>({column}: SortIndicatorProps<TData>) {
  if (!column.getCanSort()) return null

  const sorted = column.getIsSorted()

  return (
    <html.span
      style={[styles.root, sorted ? styles.active : styles.inactive]}
      data-sort-indicator=""
    >
      {sorted === 'asc' ? '\u25B2' : sorted === 'desc' ? '\u25BC' : '\u21C5'}
    </html.span>
  )
}
