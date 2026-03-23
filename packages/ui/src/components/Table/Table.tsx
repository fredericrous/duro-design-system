import {type ReactNode, type MutableRefObject, createContext, useContext, useRef, Children, isValidElement} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {Pagination} from './Pagination'
import {SortIndicator} from './SortIndicator'
import {ColumnFilter} from './ColumnFilter'

// --- Types ---

export type TableVariant = 'default' | 'striped' | 'bordered'
export type TableSize = 'sm' | 'md'

// --- Context ---

interface TableContextValue {
  variant: TableVariant
  size: TableSize
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

// --- Template context: set after first render pass ---

const TemplateContext = createContext<string | null>(null)

// --- Root ---

interface RootProps {
  children: ReactNode
  variant?: TableVariant
  size?: TableSize
}

/**
 * Scans the React tree for HeaderCell elements to extract width props.
 * Returns a grid-template-columns string.
 */
function extractTemplate(children: ReactNode): string {
  const widths: string[] = []

  function walk(node: ReactNode) {
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) return
      const props = child.props as Record<string, any>
      // Check if this looks like a HeaderCell (has width prop or is inside Header)
      const displayName = (child.type as any)?.name || (child.type as any)?.displayName || ''
      if (displayName === 'HeaderCell' || child.type === HeaderCell) {
        widths.push(props.width || '1fr')
      } else if (props.children) {
        walk(props.children)
      }
    })
  }

  walk(children)
  return widths.length > 0 ? widths.join(' ') : ''
}

function Root({children, variant = 'default', size = 'md'}: RootProps) {
  const inferredTemplateRef = useRef<string | null>(null)

  // Extract template from HeaderCell children synchronously
  const template = extractTemplate(children)
  if (template) {
    inferredTemplateRef.current = template
  }

  return (
    <TableContext.Provider value={{variant, size, inferredTemplateRef}}>
      <html.div
        role="table"
        style={[
          styles.root,
          template ? styles.gridColumns(template) : undefined,
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
      {variant === 'bordered'
        ? childArray.map((child, index) => (
            <CellIndexContext.Provider key={index} value={{index, total: childArray.length}}>
              {child}
            </CellIndexContext.Provider>
          ))
        : children}
    </html.div>
  )
}

const CellIndexContext = createContext<{index: number; total: number}>({index: 0, total: 0})

// --- HeaderCell ---

function HeaderCell({
  children,
  width: _width,
  'aria-label': ariaLabel,
}: {
  children?: ReactNode
  /** Column width: CSS value like '40px', '2fr', 'max-content'. Defaults to '1fr'. */
  width?: string
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

// --- Cell ---

function Cell({children}: {children: ReactNode}) {
  const {size, variant} = useTable()
  const {index, total} = useContext(CellIndexContext)
  const isLast = variant === 'bordered' && index === total - 1

  return (
    <html.div
      role="cell"
      style={[
        styles.cell,
        size === 'sm' ? styles.cellSm : styles.cellMd,
        variant === 'bordered' && styles.borderedCell,
        isLast && styles.borderedCellLast,
      ]}
    >
      {children}
    </html.div>
  )
}

// --- Export ---

export const Table = {
  Root,
  Header,
  Body,
  Row,
  HeaderCell,
  Cell,
  Pagination,
  SortIndicator,
  ColumnFilter,
}
