import type {Table} from '@tanstack/react-table'
import {html} from 'react-strict-dom'
import {css} from 'react-strict-dom'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

const styles = css.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    color: colors.text,
    fontSize: typography.fontSizeSm,
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
  },
  buttonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    backgroundColor: 'transparent',
  },
  pageInfo: {
    fontSize: typography.fontSizeSm,
    color: colors.textMuted,
  },
})

interface PaginationProps<TData> {
  table: Table<TData>
}

export function Pagination<TData>({table}: PaginationProps<TData>) {
  const {pageIndex, pageSize} = table.getState().pagination
  const pageCount = table.getPageCount()
  const totalRows = table.getFilteredRowModel().rows.length

  if (totalRows <= pageSize) return null

  return (
    <html.div style={styles.root}>
      <html.button
        style={[styles.button, !table.getCanPreviousPage() && styles.buttonDisabled]}
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </html.button>
      <html.span style={styles.pageInfo}>
        {pageIndex + 1} / {pageCount}
      </html.span>
      <html.button
        style={[styles.button, !table.getCanNextPage() && styles.buttonDisabled]}
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </html.button>
    </html.div>
  )
}
