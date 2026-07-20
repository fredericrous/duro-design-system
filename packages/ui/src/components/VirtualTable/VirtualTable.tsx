import {useEffect, useRef, useState, type ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type OnChangeFn,
  type Row,
} from '@tanstack/react-table'
import {useVirtualizer} from '@tanstack/react-virtual'
import {styles} from './styles.css'

export interface VirtualTableRange {
  /** 1-based index of the first visible row (0 when empty). */
  from: number
  /** 1-based index of the last visible row (0 when empty). */
  to: number
  total: number
  /** 1-based page the first visible row falls in. */
  page: number
  pages: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface VirtualTableProps<TData> {
  data: TData[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[]
  /** Controlled sorting (pairs with a SortChip in the caller). */
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  getRowId?: (row: TData, index: number) => string
  onRowClick?: (row: TData) => void
  rowLabel?: (row: TData) => string
  /**
   * 1-based page to restore the scroll position to on mount (read from the URL
   * by the caller). Only meaningful when the list virtualizes.
   */
  initialPage?: number
  /**
   * Fired (debounced) when the top-visible page changes — wire it to the URL.
   * Only fires in the virtualized branch; small lists render in one scroll and
   * have no page concept.
   */
  onVisiblePageChange?: (range: VirtualTableRange) => void
  /** Build the floating position-indicator label (i18n stays with the caller). */
  rangeLabel?: (range: VirtualTableRange) => string
  /** Rows per "page" for the URL/indicator math. Default 50. */
  pageSize?: number
  /** Estimated row height for the virtualizer. Default 44. */
  estimateRowHeight?: number
  /** Max height of the scroll viewport once virtualized. Default '70vh'. */
  maxHeight?: number | string
  /** Render every row (no windowing) at or below this count. Default 150. */
  virtualizeThreshold?: number
  emptyLabel?: ReactNode
}

/**
 * A sortable data table that windows its rows above a threshold (default 150)
 * via @tanstack/react-virtual, keeps a floating position indicator, and reports
 * the visible page so the caller can mirror it in the URL. Below the threshold
 * it renders every row in one scroll (find-in-page + a11y intact) — no
 * pagination, no windowing. Web-only (uses DOM scroll measurement).
 *
 * URL-decoupled by design: pass `initialPage` (restore) and `onVisiblePageChange`
 * (persist); the component never touches the router itself.
 */
export function VirtualTable<TData>({
  data,
  columns,
  sorting,
  onSortingChange,
  getRowId,
  onRowClick,
  rowLabel,
  initialPage,
  onVisiblePageChange,
  rangeLabel,
  pageSize = 50,
  estimateRowHeight = 44,
  maxHeight = '70vh',
  virtualizeThreshold = 150,
  emptyLabel,
}: VirtualTableProps<TData>) {
  // Support both controlled sorting (SortChip in the caller) and standalone use.
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const sortingState = sorting ?? internalSorting
  const handleSortingChange = onSortingChange ?? setInternalSorting

  const table = useReactTable({
    data,
    columns,
    state: {sorting: sortingState},
    onSortingChange: handleSortingChange,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const rows = table.getRowModel().rows
  const virtualize = rows.length > virtualizeThreshold

  const scrollRef = useRef<HTMLDivElement>(null)
  const rv = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 12,
  })

  // Restore the scroll position from `initialPage` on mount, and suppress the
  // page-change callback briefly so that restore scroll doesn't immediately
  // report (and overwrite) the URL.
  const suppressWrite = useRef(true)
  useEffect(() => {
    if (!virtualize) {
      suppressWrite.current = false
      return
    }
    if (initialPage && initialPage > 1) {
      rv.scrollToIndex((initialPage - 1) * pageSize, {align: 'start'})
    }
    const id = setTimeout(() => {
      suppressWrite.current = false
    }, 300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [virtualize])

  const vItems = rv.getVirtualItems()
  const firstIndex = vItems[0]?.index ?? 0
  const lastIndex = vItems.length ? vItems[vItems.length - 1].index : 0
  const pages = Math.max(1, Math.ceil(rows.length / pageSize))
  // page = which pageSize-sized block the top visible row is in, so it only
  // changes when you cross a boundary (no per-scroll-tick churn).
  const curPage = Math.floor(Math.max(0, firstIndex) / pageSize) + 1

  const range: VirtualTableRange = {
    from: rows.length ? firstIndex + 1 : 0,
    to: rows.length ? lastIndex + 1 : 0,
    total: rows.length,
    page: curPage,
    pages,
  }

  // Report the visible page so the caller can sync the URL. Fire once per
  // distinct page rather than debouncing a timer — `curPage` only changes at a
  // pageSize boundary (coarse), and react-virtual's frequent re-renders during
  // scroll/measurement would keep resetting a debounce timer so it never fires.
  // The `lastReported` guard prevents redundant calls; callers use replace, so
  // there's no history churn.
  const lastReported = useRef<number | null>(null)
  useEffect(() => {
    if (!virtualize || !onVisiblePageChange) return
    if (suppressWrite.current) {
      // Still in the mount-restore window — record the page so we don't emit a
      // spurious change once it clears, but don't call out.
      lastReported.current = curPage
      return
    }
    if (lastReported.current === curPage) return
    lastReported.current = curPage
    onVisiblePageChange({
      from: rows.length ? firstIndex + 1 : 0,
      to: rows.length ? lastIndex + 1 : 0,
      total: rows.length,
      page: curPage,
      pages,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curPage, virtualize])

  const renderRow = (
    row: Row<TData>,
    index: number,
    positioned?: ReturnType<typeof styles.rowAbsolute>,
    measureRef?: (node: Element | null) => void,
  ) => (
    <html.div
      key={row.id}
      ref={measureRef}
      data-index={index}
      role="row"
      aria-label={rowLabel?.(row.original)}
      onClick={onRowClick ? () => onRowClick(row.original) : undefined}
      style={[styles.row, Boolean(onRowClick) && styles.rowClickable, positioned]}
    >
      {row.getVisibleCells().map((cell) => (
        <html.div
          key={cell.id}
          role="cell"
          style={[styles.cell, styles.cellFlex(cell.column.getSize())]}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </html.div>
      ))}
    </html.div>
  )

  const label =
    rangeLabel?.(range) ?? (rows.length ? `${range.from}–${range.to} / ${range.total}` : '')

  return (
    <html.div style={styles.wrap}>
      <html.div
        ref={scrollRef}
        role="table"
        style={[styles.scroll, virtualize && styles.scrollMax(maxHeight)]}
      >
        <html.div role="rowgroup" style={styles.head}>
          {table.getHeaderGroups().map((headerGroup) => (
            <html.div key={headerGroup.id} role="row" style={styles.headRow}>
              {headerGroup.headers.map((header) => {
                const col = header.column
                const sorted = col.getIsSorted()
                return (
                  <html.div
                    key={header.id}
                    role="columnheader"
                    aria-sort={
                      sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                    }
                    onClick={col.getCanSort() ? col.getToggleSortingHandler() : undefined}
                    style={[
                      styles.headCell,
                      col.getCanSort() && styles.headCellSortable,
                      styles.cellFlex(header.getSize()),
                    ]}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(col.columnDef.header, header.getContext())}
                    {sorted ? (
                      <html.span style={styles.sortMark}>{sorted === 'asc' ? '↑' : '↓'}</html.span>
                    ) : null}
                  </html.div>
                )
              })}
            </html.div>
          ))}
        </html.div>

        {rows.length === 0 ? (
          <html.div style={styles.empty}>{emptyLabel}</html.div>
        ) : (
          <html.div
            role="rowgroup"
            style={virtualize ? styles.bodyTotal(rv.getTotalSize()) : undefined}
          >
            {virtualize
              ? vItems.map((vi) =>
                  renderRow(
                    rows[vi.index],
                    vi.index,
                    styles.rowAbsolute(vi.start),
                    rv.measureElement,
                  ),
                )
              : rows.map((row, i) => renderRow(row, i))}
          </html.div>
        )}
      </html.div>

      {virtualize && rows.length > 0 ? (
        <html.div aria-live="polite" style={styles.pos}>
          {label}
        </html.div>
      ) : null}
    </html.div>
  )
}
