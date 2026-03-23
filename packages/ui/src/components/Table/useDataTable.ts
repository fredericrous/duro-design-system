import {useCallback, useState} from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type Table,
} from '@tanstack/react-table'

export interface UseDataTableOptions<TData> {
  /** Initial pagination state */
  pagination?: {pageSize?: number; pageIndex?: number}
  /** Enable sorting on columns that don't explicitly disable it */
  enableSorting?: boolean
  /** Enable column filtering */
  enableFiltering?: boolean
  /** Enable row selection (checkbox) */
  enableRowSelection?: boolean | ((row: any) => boolean)
  /** Callback when row selection changes */
  onRowSelectionChange?: (selection: RowSelectionState) => void
}

/**
 * Thin wrapper around TanStack's useReactTable.
 * Pre-configures row models for pagination, sorting, and filtering.
 * Returns the full TanStack table instance.
 *
 * @example
 * ```tsx
 * const table = useDataTable(users, columns, {
 *   pagination: { pageSize: 20 },
 *   enableSorting: true,
 *   enableFiltering: true,
 * })
 * ```
 */
export function useDataTable<TData>(
  data: TData[],
  columns: ColumnDef<TData, any>[],
  options: UseDataTableOptions<TData> = {},
): Table<TData> {
  const {
    enableSorting = false,
    enableFiltering = false,
    enableRowSelection = false,
    onRowSelectionChange: onSelectionChangeProp,
  } = options

  const enablePagination = options.pagination != null

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: options.pagination?.pageIndex ?? 0,
    pageSize: options.pagination?.pageSize ?? 10,
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const handleRowSelectionChange = useCallback(
    (updater: any) => {
      setRowSelection((prev: RowSelectionState) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        onSelectionChangeProp?.(next)
        return next
      })
    },
    [onSelectionChangeProp],
  )

  // Follow TanStack's recommended pattern: always pass all row models
  // unconditionally and let the library handle unused ones. Conditional
  // spreads create unstable option shapes that can trigger infinite loops.
  return useReactTable({
    data,
    columns,
    state: {sorting, columnFilters, pagination, rowSelection},
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    enableSorting,
    enableRowSelection:
      typeof enableRowSelection === 'function' ? enableRowSelection : !!enableRowSelection,
    onRowSelectionChange: handleRowSelectionChange,
    // When pagination is disabled, set a very large page size to show all rows
    ...(!enablePagination && {
      autoResetPageIndex: false,
    }),
  })
}
