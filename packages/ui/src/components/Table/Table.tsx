import {
  type ReactNode,
  type MutableRefObject,
  createContext,
  useContext,
  useRef,
  Children,
  isValidElement,
} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {Pagination} from './Pagination'
import {SortIndicator} from './SortIndicator'
import {ColumnFilter} from './ColumnFilter'
import {SortChip} from './SortChip'

// --- Types ---

export type TableVariant = 'default' | 'striped' | 'bordered'
export type TableSize = 'sm' | 'md'

// --- Context ---

interface TableContextValue {
  variant: TableVariant
  size: TableSize
  responsive: boolean
  /** Header labels indexed by column position. Populated synchronously by
   *  extractColumnMeta() during Root render so SSR HTML carries them. */
  labels: ReadonlyArray<string>
  /** Mutable ref: header Row writes inferred template, Root reads it */
  inferredTemplateRef: MutableRefObject<string | null>
}

const TableContext = createContext<TableContextValue | null>(null)

function useTable() {
  const ctx = useContext(TableContext)
  if (!ctx) throw new Error('Table compound components must be used within Table.Root')
  return ctx
}

// --- HeaderContext ---

const HeaderContext = createContext(false)

// --- Container — owns the @container query target ---
//
// Wraps SortChip + Root + Pagination so they all participate in the same
// container query. Setting `containerType: inline-size` on Root would not
// reach siblings that consumers render above the table.

function Container({children}: {children: ReactNode}) {
  return <html.div style={styles.container}>{children}</html.div>
}

// --- Synchronous tree walk: widths + labels in document order ---
//
// Mirrors the pattern that was previously called extractTemplate(). Walks
// the JSX tree, finds HeaderCell elements, captures their `width` and
// `label` props (or extractText(children) fallback). Runs on every Root
// render — cheap (small N, no DOM) — but worth memoising on `children`
// reference if profiling flags it.

function extractText(node: ReactNode): string {
  let out = ''
  Children.forEach(node, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      out += String(child)
    } else if (isValidElement(child)) {
      const props = child.props as {children?: ReactNode}
      if (props.children) out += extractText(props.children)
    }
  })
  return out
}

function extractColumnMeta(children: ReactNode): {template: string; labels: string[]} {
  const widths: string[] = []
  const labels: string[] = []

  function walk(node: ReactNode) {
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) return
      const props = child.props as Record<string, any>
      const displayName = (child.type as any)?.name || (child.type as any)?.displayName || ''
      if (displayName === 'HeaderCell' || child.type === HeaderCell) {
        widths.push(props.width || '1fr')
        const label = props.label ?? extractText(props.children).trim()
        labels.push(label)
      } else if (props.children) {
        walk(props.children)
      }
    })
  }

  walk(children)
  return {template: widths.join(' '), labels}
}

// --- Root ---

interface RootProps {
  children: ReactNode
  variant?: TableVariant
  size?: TableSize
  /** Opt out of responsive container-query behavior. Default true. */
  responsive?: boolean
}

function Root({children, variant = 'default', size = 'md', responsive = true}: RootProps) {
  const inferredTemplateRef = useRef<string | null>(null)
  const {template, labels} = extractColumnMeta(children)
  if (template) {
    inferredTemplateRef.current = template
  }

  return (
    <TableContext.Provider value={{variant, size, responsive, labels, inferredTemplateRef}}>
      <html.div
        role="table"
        style={[
          styles.root,
          template ? styles.gridColumns(template) : undefined,
          responsive && styles.rootResponsive,
        ]}
      >
        {children}
      </html.div>
    </TableContext.Provider>
  )
}

// --- Header ---

function Header({children}: {children: ReactNode}) {
  return (
    <HeaderContext.Provider value={true}>
      <html.div role="rowgroup" style={styles.header}>
        {children}
      </html.div>
    </HeaderContext.Provider>
  )
}

// --- Body ---

function Body({children}: {children: ReactNode}) {
  const {variant} = useTable()
  const childArray = Children.toArray(children)

  return (
    <HeaderContext.Provider value={false}>
      <html.div role="rowgroup" style={styles.body}>
        {childArray.map((child, index) => {
          if (variant === 'striped') {
            return (
              <RowIndexContext.Provider key={index} value={index}>
                {child}
              </RowIndexContext.Provider>
            )
          }
          return child
        })}
      </html.div>
    </HeaderContext.Provider>
  )
}

const RowIndexContext = createContext<number>(-1)

// --- Row ---
//
// Always provides CellIndexContext, regardless of variant. Previously this
// was only set up for `variant === 'bordered'`, which meant non-bordered
// tables had every cell reading {index: 0} from the default — fine until
// we needed to look up labels by column index.

function Row({children}: {children: ReactNode}) {
  const {variant} = useTable()
  const isHeader = useContext(HeaderContext)
  const rowIndex = useContext(RowIndexContext)
  const isEvenRow = rowIndex >= 0 && rowIndex % 2 === 1
  const childArray = Children.toArray(children)

  return (
    <html.div
      role="row"
      style={[
        styles.row,
        !isHeader && styles.bodyRow,
        !isHeader && variant === 'striped' && isEvenRow && styles.stripedEven,
      ]}
    >
      {childArray.map((child, index) => (
        <CellIndexContext.Provider key={index} value={{index, total: childArray.length}}>
          {child}
        </CellIndexContext.Provider>
      ))}
    </html.div>
  )
}

const CellIndexContext = createContext<{index: number; total: number}>({index: 0, total: 0})

// --- HeaderCell ---

function HeaderCell({
  children,
  width: _width,
  label: _label,
  isActions: _isActions,
  'aria-label': ariaLabel,
}: {
  children?: ReactNode
  /** Column width: CSS value like '40px', '2fr', 'max-content'. Defaults to '1fr'. */
  width?: string
  /** Stack-mode label string. Required when responsive=true; falls back to
   *  text-content of children with a dev-only console.warn. */
  label?: string
  /** Marks this column as the actions column — its body cells render as a
   *  full-width footer in stack mode. */
  isActions?: boolean
  'aria-label'?: string
}) {
  const {size, variant} = useTable()
  const {index, total} = useContext(CellIndexContext)
  const isLast = variant === 'bordered' && index === total - 1

  return (
    <html.div
      role="columnheader"
      aria-label={ariaLabel}
      style={[
        styles.headerCell,
        size === 'sm' ? styles.cellSm : styles.cellMd,
        variant === 'bordered' && styles.borderedCell,
        isLast && styles.borderedCellLast,
      ]}
    >
      {children}
    </html.div>
  )
}
HeaderCell.displayName = 'HeaderCell'

// --- Cell ---
//
// Renders the column-header label as a real <html.span>, hidden via
// container query in non-stack modes. The span is omitted entirely when
// isActions=true — actions footers don't show a label.

function Cell({children, isActions}: {children: ReactNode; isActions?: boolean}) {
  const {size, variant, labels, responsive} = useTable()
  const {index, total} = useContext(CellIndexContext)
  const isLast = variant === 'bordered' && index === total - 1
  const label = labels[index] ?? ''

  return (
    <html.div
      role="cell"
      style={[
        styles.cell,
        size === 'sm' ? styles.cellSm : styles.cellMd,
        variant === 'bordered' && styles.borderedCell,
        isLast && styles.borderedCellLast,
        isActions && styles.cellActions,
      ]}
    >
      {responsive && !isActions && label !== '' ? (
        <html.span style={styles.cellLabel}>{label}</html.span>
      ) : null}
      {children}
    </html.div>
  )
}

// --- Export ---

export const Table = {
  Container,
  Root,
  Header,
  Body,
  Row,
  HeaderCell,
  Cell,
  Pagination,
  SortIndicator,
  ColumnFilter,
  SortChip,
}
