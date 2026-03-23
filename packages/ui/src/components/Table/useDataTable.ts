import {useState} from 'react'
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
  type TableOptions,
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
    pagination: paginationInit,
    enableSorting = false,
    enableFiltering = false,
    enableRowSelection = false,
    onRowSelectionChange: onSelectionChangeProp,
  } = options

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: paginationInit?.pageIndex ?? 0,
    pageSize: paginationInit?.pageSize ?? 10,
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const handleRowSelectionChange = (updater: any) => {
    setRowSelection(updater)
    if (onSelectionChangeProp) {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater
      onSelectionChangeProp(next)
    }
  }

  const tableOptions: TableOptions<TData> = {
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),

    // Sorting
    ...(enableSorting && {
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting,
      state: {sorting},
    }),

    // Filtering
    ...(enableFiltering && {
      getFilteredRowModel: getFilteredRowModel(),
      onColumnFiltersChange: setColumnFilters,
    }),

    // Pagination
    ...(paginationInit && {
      getPaginationRowModel: getPaginationRowModel(),
      onPaginationChange: setPagination,
    }),

    // Row selection
    ...(enableRowSelection && {
      enableRowSelection: typeof enableRowSelection === 'function' ? enableRowSelection : true,
      onRowSelectionChange: handleRowSelectionChange,
    }),

    // Merge all state
    state: {
      ...(enableSorting && {sorting}),
      ...(enableFiltering && {columnFilters}),
      ...(paginationInit && {pagination}),
      ...(enableRowSelection && {rowSelection}),
    },
  }

  return useReactTable(tableOptions)
}
