import {type ReactNode} from 'react'
import {type Row, type Table as TanstackTable, flexRender} from '@tanstack/react-table'
import {
  Body,
  Cell,
  Header,
  HeaderCell,
  Root,
  Row as TableRow,
  type TableSize,
  type TableVariant,
} from './Table'
import {Pagination} from './Pagination'
import {SortChip, type SortValue} from './SortChip'

// ColumnMeta is augmented in `./tanstack-augmentation` so the types
// register independently of whether the consumer imports FromTanstack.

// Base props shared by both clickable and non-clickable variants.
interface FromTanstackBaseProps<TData> {
  readonly table: TanstackTable<TData>
  readonly variant?: TableVariant
  readonly size?: TableSize
  readonly responsive?: boolean
  /** Render a SortChip above the grid (stack-mode only). Options derive from
   *  columns where `column.getCanSort()` returns true. Wires value/onChange
   *  through the TanStack sorting state automatically. */
  readonly sortChip?: boolean
  /** Render Pagination below the grid. */
  readonly pagination?: boolean
  /** Key extractor; defaults to TanStack's row.id. */
  readonly rowKey?: (row: Row<TData>) => string
}

// Discriminated union: rowAriaLabel is required when onRowClick is set so
// keyboard / screen-reader users always get an accessible name for the
// interactive row.
export type FromTanstackProps<TData> = FromTanstackBaseProps<TData> &
  (
    | {
        readonly onRowClick: (row: Row<TData>) => void
        /** Accessible name for each clickable row. Required because the row's
         *  visible cell content alone is rarely a useful accessible name. */
        readonly rowAriaLabel: (row: Row<TData>) => string
      }
    | {
        readonly onRowClick?: undefined
        readonly rowAriaLabel?: undefined
      }
  )

/**
 * Renders a styled Table directly from a TanStack table instance.
 *
 * Labels for stack mode are derived in this order:
 *   1. `column.columnDef.meta?.stackLabel` (explicit override)
 *   2. `column.columnDef.header` when it's a string
 *   3. Empty (use only for the actions column or when meta.stackLabel is set)
 *
 * Mark the actions column with `meta: { isActions: true }` to apply the
 * stack-mode footer styling to its body cells.
 *
 * @example
 * <Table.FromTanstack table={tanstackTable} sortChip pagination onRowClick={(r) => nav(r)} />
 */
export function FromTanstack<TData>({
  table,
  variant = 'default',
  size = 'md',
  responsive = true,
  sortChip,
  pagination,
  rowKey,
  onRowClick,
  rowAriaLabel,
}: FromTanstackProps<TData>) {
  const sortChipNode: ReactNode = sortChip ? buildSortChip(table) : undefined
  const paginationNode: ReactNode = pagination ? <Pagination table={table} /> : undefined

  return (
    <Root
      variant={variant}
      size={size}
      responsive={responsive}
      sortChip={sortChipNode}
      pagination={paginationNode}
    >
      <Header>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => {
              const def = header.column.columnDef
              const meta = def.meta
              const labelFromHeader = typeof def.header === 'string' ? def.header : undefined
              const label = meta?.stackLabel ?? labelFromHeader ?? ''
              return (
                <HeaderCell
                  key={header.id}
                  label={label}
                  aria-label={meta?.isActions ? label || 'Actions' : undefined}
                >
                  {header.isPlaceholder ? null : flexRender(def.header, header.getContext())}
                </HeaderCell>
              )
            })}
          </TableRow>
        ))}
      </Header>
      <Body>
        {table.getRowModel().rows.map((row) => {
          const key = rowKey?.(row) ?? row.id
          // Row handles its own click/keyboard/focus affordance — no outer
          // wrapper, so the role="rowgroup" → role="row" ARIA hierarchy
          // stays intact, and clicks inside interactive cell content (e.g.
          // an action button) are correctly attributed to the inner widget.
          return (
            <TableRow
              key={key}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              aria-label={rowAriaLabel?.(row)}
            >
              {row.getVisibleCells().map((cell) => (
                <Cell key={cell.id} isActions={cell.column.columnDef.meta?.isActions === true}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Cell>
              ))}
            </TableRow>
          )
        })}
      </Body>
    </Root>
  )
}
FromTanstack.displayName = 'FromTanstack'

// --- helpers ---

function buildSortChip<TData>(table: TanstackTable<TData>): ReactNode {
  const options = table
    .getAllColumns()
    .filter((c) => c.getCanSort())
    .map((c) => {
      const fromHeader = typeof c.columnDef.header === 'string' ? c.columnDef.header : c.id
      return {id: c.id, label: c.columnDef.meta?.stackLabel ?? fromHeader}
    })

  if (options.length === 0) return null

  const current = table.getState().sorting[0]
  const value: SortValue | null = current ? {id: current.id, desc: current.desc} : null

  return (
    <SortChip
      options={options}
      value={value}
      onChange={(next) => table.setSorting(next ? [{id: next.id, desc: next.desc}] : [])}
    />
  )
}
