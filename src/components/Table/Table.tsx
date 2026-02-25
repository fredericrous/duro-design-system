import { type ReactNode, createContext, useContext, Children } from "react"
import { html } from "react-strict-dom"
import { styles } from "./styles.css"

// --- Types ---

export type TableVariant = "default" | "striped" | "bordered"
export type TableSize = "sm" | "md"

// --- Context ---

interface TableContextValue {
  variant: TableVariant
  size: TableSize
  columns: number
  isHeader: boolean
}

const TableContext = createContext<TableContextValue | null>(null)

function useTable() {
  const ctx = useContext(TableContext)
  if (!ctx) throw new Error("Table compound components must be used within Table.Root")
  return ctx
}

// --- HeaderContext (to distinguish header vs body rowgroup) ---

const HeaderContext = createContext(false)

// --- Root ---

interface RootProps {
  children: ReactNode
  variant?: TableVariant
  size?: TableSize
  columns: number
}

function Root({ children, variant = "default", size = "md", columns }: RootProps) {
  return (
    <TableContext.Provider value={{ variant, size, columns, isHeader: false }}>
      <html.div role="table" style={styles.root}>
        {children}
      </html.div>
    </TableContext.Provider>
  )
}

// --- Header ---

function Header({ children }: { children: ReactNode }) {
  return (
    <HeaderContext.Provider value={true}>
      <html.div role="rowgroup" style={styles.header}>
        {children}
      </html.div>
    </HeaderContext.Provider>
  )
}

// --- Body ---

function Body({ children }: { children: ReactNode }) {
  const { variant } = useTable()
  const childArray = Children.toArray(children)

  return (
    <HeaderContext.Provider value={false}>
      <html.div role="rowgroup">
        {childArray.map((child, index) => {
          if (variant === "striped") {
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

// Row index context for striped variant
const RowIndexContext = createContext<number>(-1)

// --- Row ---

function Row({ children }: { children: ReactNode }) {
  const { variant, columns } = useTable()
  const isHeader = useContext(HeaderContext)
  const rowIndex = useContext(RowIndexContext)
  const isEvenRow = rowIndex >= 0 && rowIndex % 2 === 1
  const childArray = Children.toArray(children)
  const isLastRow = false // handled by CSS or parent

  return (
    <html.div
      role="row"
      style={[
        styles.row,
        styles.gridColumns(columns),
        !isHeader && styles.bodyRow,
        !isHeader && variant === "striped" && isEvenRow && styles.stripedEven,
      ]}
    >
      {variant === "bordered"
        ? childArray.map((child, index) => (
            <CellIndexContext.Provider
              key={index}
              value={{ index, total: childArray.length }}
            >
              {child}
            </CellIndexContext.Provider>
          ))
        : children}
    </html.div>
  )
}

// Cell index context for bordered variant
const CellIndexContext = createContext<{ index: number; total: number }>({
  index: 0,
  total: 0,
})

// --- HeaderCell ---

function HeaderCell({ children }: { children: ReactNode }) {
  const { size, variant } = useTable()
  const { index, total } = useContext(CellIndexContext)
  const isLast = variant === "bordered" && index === total - 1

  return (
    <html.div
      role="columnheader"
      style={[
        styles.headerCell,
        size === "sm" ? styles.cellSm : styles.cellMd,
        variant === "bordered" && styles.borderedCell,
        isLast && styles.borderedCellLast,
      ]}
    >
      {children}
    </html.div>
  )
}

// --- Cell ---

function Cell({ children }: { children: ReactNode }) {
  const { size, variant } = useTable()
  const { index, total } = useContext(CellIndexContext)
  const isLast = variant === "bordered" && index === total - 1

  return (
    <html.div
      role="cell"
      style={[
        styles.cell,
        size === "sm" ? styles.cellSm : styles.cellMd,
        variant === "bordered" && styles.borderedCell,
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
}
