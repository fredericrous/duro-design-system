import {
  type ReactElement,
  type ReactNode,
  type MutableRefObject,
  createContext,
  cloneElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
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
  /** JS-measured force-stack flag. True when Root's ResizeObserver finds the
   *  container too narrow for its column count (cells would be crushed), so
   *  every cell/row/header also applies its `*Stacked` variant. Independent
   *  of the @container base, which still handles genuinely narrow widths. */
  stacked: boolean
}

// useLayoutEffect measures + commits the stack decision before the browser
// paints, so a client-rendered narrow table shows cards on first frame
// rather than flashing tabular. On the server it would warn (no layout), so
// fall back to useEffect there — SSR always emits the non-stacked markup and
// the @container CSS covers true mobile without JS.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// Does any column's content no longer fit its box? We sample the header row
// plus the first body row (bounded cost). Free text wraps rather than
// overflowing (min-width:0 + overflow-wrap), so this only trips on content
// that genuinely can't shrink — action buttons, badges, or nowrap header
// labels — i.e. the real "columns won't fit" signal, independent of how many
// columns there are. Structural overflow is consistent down a column, so the
// first body row is a faithful sample.
function gridOverflows(grid: HTMLDivElement | null): boolean {
  if (!grid) return false
  const TOL = 2 // sub-pixel layout rounding slack
  const over = (el: Element) => el.scrollWidth - el.clientWidth > TOL
  for (const h of grid.querySelectorAll('[role="columnheader"]')) {
    if (over(h)) return true
  }
  const rowgroups = grid.querySelectorAll('[role="rowgroup"]')
  const body = rowgroups[rowgroups.length - 1] // header is first, body last
  const firstRow = body?.querySelector('[role="row"]')
  if (firstRow) {
    for (const c of firstRow.querySelectorAll('[role="cell"]')) {
      if (over(c)) return true
    }
  }
  return false
}

const TableContext = createContext<TableContextValue | null>(null)

function useTable() {
  const ctx = useContext(TableContext)
  if (!ctx) throw new Error('Table compound components must be used within Table.Root')
  return ctx
}

// --- HeaderContext ---

const HeaderContext = createContext(false)

// --- Dev-only warn registry ---
//
// One-shot per warning code per process: long-running dev sessions
// shouldn't drown the console on every re-render of a misconfigured table.
const _IS_PROD = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'
const _devWarned = new Set<string>()
function devWarnOnce(code: string, message: string) {
  if (_IS_PROD || _devWarned.has(code)) return
  _devWarned.add(code)
  // eslint-disable-next-line no-console
  console.warn(`[duro-app/ui Table] ${message}`)
}

// --- Container — owns the @container query target ---
//
// @deprecated Root sets up its own container query and accepts `sortChip`
// / `pagination` as slot props. Container is kept exported as a passthrough
// so existing call sites continue to work; new code should use Root alone.

export function Container({children}: {children: ReactNode}) {
  return <html.div style={styles.container}>{children}</html.div>
}

// --- Synchronous tree walk: widths + labels in document order ---
//
// Mirrors the pattern that was previously called extractTemplate(). Walks
// the JSX tree, finds HeaderCell elements, captures their `width` and
// `label` props (or extractText(children) fallback). Runs on every Root
// render — cheap (small N, no DOM) — but worth memoising on `children`
// reference if profiling flags it.

// Shallow string-children extraction. We deliberately do NOT recurse into
// child elements: an icon, tooltip trigger, or sort indicator nested inside
// a HeaderCell would otherwise pollute the stack-mode label with its own
// text content. JSX-only headers must set `label` explicitly.
function extractText(node: ReactNode): string {
  let out = ''
  Children.forEach(node, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      out += String(child)
    }
  })
  return out
}

// Unwrap memo(...) / forwardRef(...) wrappers so JSX like
// `<MemoizedHeaderCell ...>` still identifies as HeaderCell. Both wrappers
// expose the inner component via a `.type` (memo) or `.render` (forwardRef)
// property on the element-type descriptor. We walk both fields until we
// reach a leaf, which is the underlying function/class component.
function unwrapElementType(t: unknown): unknown {
  let current = t
  // Bounded loop — defensive cap against pathological infinite-nesting.
  for (let i = 0; i < 8 && current && typeof current === 'object'; i++) {
    const next =
      (current as {type?: unknown; render?: unknown}).type ?? (current as {render?: unknown}).render
    if (next == null) break
    current = next
  }
  return current
}

function extractColumnMeta(children: ReactNode): {
  template: string
  compactTemplate: string
  labels: string[]
} {
  const widths: string[] = []
  const compactWidths: string[] = []
  const labels: string[] = []

  function walk(node: ReactNode) {
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) return
      const props = child.props as Record<string, any>
      const unwrappedType = unwrapElementType(child.type)
      const displayName =
        (unwrappedType as {name?: string; displayName?: string} | null)?.displayName ||
        (unwrappedType as {name?: string} | null)?.name ||
        ''
      if (unwrappedType === HeaderCell || displayName === 'HeaderCell') {
        // Default to minmax(0, 1fr) instead of plain '1fr' so each column
        // can shrink below its content's min-content size. A plain '1fr'
        // track has an implicit min of `auto` (= min-content), which makes
        // the column refuse to shrink and the whole table overflow when a
        // cell's text is wider than 1/N of the container. With minmax(0,
        // 1fr), the cell's compact-mode `min-width: 0` + `overflow:
        // hidden` + `text-overflow: ellipsis` can actually truncate.
        const width = props.width || 'minmax(0, 1fr)'
        widths.push(width)
        // `compactWidth` lets the consumer switch to a content-aware
        // layout in the compact band while staying evenly distributed
        // at desktop. Falls back to `width` so columns that don't opt
        // in keep one template across both breakpoints.
        compactWidths.push(props.compactWidth || width)
        const explicit = typeof props.label === 'string' ? props.label : undefined
        const fallback = extractText(props.children).trim()
        const label = explicit ?? fallback
        if (!explicit && fallback === '' && props.children != null) {
          // Children are JSX with no string content — stack mode will render
          // an unlabeled cell. Tell the developer once.
          devWarnOnce(
            'headerCell-missing-label',
            'Table.HeaderCell with JSX children must set `label` for stack-mode rendering.',
          )
        }
        labels.push(label)
      } else if (props.children) {
        walk(props.children)
      }
    })
  }

  walk(children)
  return {
    template: widths.join(' '),
    compactTemplate: compactWidths.join(' '),
    labels,
  }
}

// --- Root ---

interface RootProps {
  children: ReactNode
  variant?: TableVariant
  size?: TableSize
  /** Opt out of responsive behavior (auto-stacking + container query). Default true. */
  responsive?: boolean
  /**
   * Optional sort UI rendered above the grid. Visible only in stack mode
   * (SortChip carries its own `display: none → inline-flex` rule). Typical
   * value: `<Table.SortChip options={...} value={...} onChange={...} />`.
   */
  sortChip?: ReactNode
  /**
   * Optional pagination UI rendered below the grid. Typical value:
   * `<Table.Pagination table={tanstackTable} />`.
   */
  pagination?: ReactNode
}

export function Root({
  children,
  variant = 'default',
  size = 'md',
  responsive = true,
  sortChip,
  pagination,
}: RootProps) {
  const inferredTemplateRef = useRef<string | null>(null)
  const {template, compactTemplate, labels} = extractColumnMeta(children)
  if (template) {
    inferredTemplateRef.current = template
  }

  // Content-aware stacking driven by ACTUAL overflow, not a width heuristic.
  // Column count alone is a poor proxy — a table with 8 short-text columns
  // fits fine on a laptop, while 4 columns of buttons + long emails can be
  // crushed. So instead of guessing, we render tabular and check whether any
  // cell's content actually overflows its box (scrollWidth > clientWidth);
  // when it does, the columns can't fit and we card up. The @container base
  // (styles.*: STACK_BP) still stacks true-mobile widths without JS.
  //
  // Oscillation guard: stacking changes the layout (cards never overflow), so
  // we can't re-measure overflow while stacked. We latch the container width
  // at the moment we stacked and only return to tabular once the container
  // has grown comfortably past it (hysteresis), then re-check overflow fresh.
  const containerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [stacked, setStacked] = useState(false)
  const stackedAtWidthRef = useRef(0)

  // Re-runs whenever `stacked` flips: after we drop back to tabular the
  // container width is unchanged, so the ResizeObserver won't fire — the
  // effect re-running is what re-checks overflow in the fresh tabular layout.
  useIsoLayoutEffect(() => {
    if (!responsive) {
      setStacked(false)
      return
    }
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    // Grows-back margin: only leave stack mode once we're well clear of the
    // width that triggered it, so a 1px jiggle at the boundary can't flip-flop.
    const HYSTERESIS = 48

    const measure = (width: number) => {
      if (width <= 0) return
      if (!stacked) {
        if (gridOverflows(gridRef.current)) {
          stackedAtWidthRef.current = width
          setStacked(true)
        }
      } else if (width > stackedAtWidthRef.current + HYSTERESIS) {
        // Drop back to tabular; this effect re-runs and re-checks overflow.
        setStacked(false)
      }
    }

    measure(el.getBoundingClientRect().width)
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const box = entry.contentBoxSize?.[0]
      measure(box ? box.inlineSize : entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
    // labels.length re-runs detection when the column set changes.
  }, [responsive, labels.length, stacked])

  const grid = (
    <html.div
      role="table"
      ref={gridRef}
      style={[
        styles.root,
        // When responsive, use gridColumnsResponsive so the explicit column
        // template and the stack-mode @container override live in one StyleX
        // style object. Splitting them across two styles (gridColumns +
        // rootResponsive) causes StyleX conflict resolution to drop the
        // column template because rootResponsive's gridTemplateColumns key
        // always wins as the later entry in the array.
        template
          ? responsive
            ? styles.gridColumnsResponsive(template, compactTemplate)
            : styles.gridColumns(template)
          : undefined,
        responsive && styles.rootResponsive,
        // Force-stack override — collapses the grid to one column. Applied
        // last so its gridTemplateColumns wins over gridColumnsResponsive.
        responsive && stacked && styles.rootStacked,
      ]}
    >
      {children}
    </html.div>
  )

  // The sort chip is normally revealed only by the @container query. When
  // JS force-stacks (headers hidden, but container wider than STACK_BP) the
  // chip's own query hasn't fired, so inject forceShow to reveal it.
  const sortChipEl =
    stacked && isValidElement(sortChip)
      ? cloneElement(sortChip as ReactElement<{forceShow?: boolean}>, {forceShow: true})
      : sortChip

  // Slots render unconditionally — `responsive=false` still wants its sort/
  // pagination chrome. Only the containerType:inline-size wrapper is
  // conditional, since it only matters when @container queries fire.
  const body = (
    <>
      {sortChipEl}
      {grid}
      {pagination}
    </>
  )

  return (
    <TableContext.Provider
      value={{variant, size, responsive, labels, inferredTemplateRef, stacked}}
    >
      {responsive ? (
        <html.div ref={containerRef} style={styles.rootContainer}>
          {body}
        </html.div>
      ) : (
        body
      )}
    </TableContext.Provider>
  )
}

// --- Header ---

export function Header({children}: {children: ReactNode}) {
  const {stacked} = useTable()
  return (
    <HeaderContext.Provider value={true}>
      <html.div role="rowgroup" style={[styles.header, stacked && styles.headerStacked]}>
        {children}
      </html.div>
    </HeaderContext.Provider>
  )
}

// --- Body ---

export function Body({children}: {children: ReactNode}) {
  const {variant} = useTable()
  const childArray = Children.toArray(children) as ReactElement[]

  return (
    <HeaderContext.Provider value={false}>
      <html.div role="rowgroup" style={styles.body}>
        {childArray.map((child, index) => {
          if (variant !== 'striped') return child
          // Key the provider by the child's React key (Children.toArray
          // guarantees one) so reordered rows carry their providers along
          // with them. Position is passed as the value because striping is
          // a positional concern even when row identity is stable.
          return (
            <RowIndexContext.Provider key={child.key ?? index} value={index}>
              {child}
            </RowIndexContext.Provider>
          )
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
//
// Interactive rows: pass `onClick` to make the row a navigation target.
// The role stays `row` (per ARIA grid pattern) — we don't wrap in an outer
// element with role=button, which would break the rowgroup → row hierarchy.
// A click that originates inside an interactive descendant (button, link,
// input, etc.) is treated as that descendant's click and does not fire
// onClick — prevents double-fire when a row contains action buttons.

interface RowProps {
  children: ReactNode
  /** When set, the row becomes focusable + clickable. */
  onClick?: () => void
  /** Per-row accessible name — required when onClick is set, recommended otherwise. */
  'aria-label'?: string
}

// Heuristic for "clicking a descendant means the descendant, not the row".
// Matches the elements the WAI-ARIA grid pattern lists as "widgets" plus the
// usual native focus-stealers.
const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="menuitem"], [role="switch"], [role="tab"], [contenteditable="true"]'

export function Row({children, onClick, 'aria-label': ariaLabel}: RowProps) {
  const {variant, stacked} = useTable()
  const isHeader = useContext(HeaderContext)
  const rowIndex = useContext(RowIndexContext)
  const isEvenRow = rowIndex >= 0 && rowIndex % 2 === 1
  const childArray = Children.toArray(children) as ReactElement[]
  const isClickable = onClick !== undefined && !isHeader

  return (
    <html.div
      role="row"
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? ariaLabel : undefined}
      onClick={
        isClickable
          ? (e) => {
              // react-strict-dom's typed click event omits `target`, but the
              // underlying SyntheticEvent still carries it. Cast through so
              // we can detect clicks that originate inside an interactive
              // descendant (action button, link, input) and let them be
              // attributed to that widget instead of the row.
              const target = (e as unknown as {target?: EventTarget | null}).target
              if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) {
                return
              }
              onClick()
            }
          : undefined
      }
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onClick()
              }
            }
          : undefined
      }
      style={[
        styles.row,
        !isHeader && styles.bodyRow,
        !isHeader && variant === 'striped' && isEvenRow && styles.stripedEven,
        isClickable && styles.clickableRow,
        stacked && styles.rowStacked,
        // bodyRowStacked last so its card background wins over stripedEven.
        !isHeader && stacked && styles.bodyRowStacked,
      ]}
    >
      {childArray.map((child, index) => (
        // Key by the child's React key (Children.toArray assigns one) so a
        // reordered column carries its CellIndexContext provider along.
        // The positional `index` lives in the provider's value, not its key.
        <CellIndexContext.Provider
          key={child.key ?? index}
          value={{index, total: childArray.length}}
        >
          {child}
        </CellIndexContext.Provider>
      ))}
    </html.div>
  )
}

const CellIndexContext = createContext<{index: number; total: number}>({index: 0, total: 0})

// --- HeaderCell ---

export function HeaderCell({
  children,
  width: _width,
  compactWidth: _compactWidth,
  label: _label,
  isActions,
  'aria-label': ariaLabel,
}: {
  children?: ReactNode
  /** Column width at default (wide) viewport. CSS grid-template-columns
   *  track value — e.g. '40px', '2fr', 'max-content'. Defaults to
   *  'minmax(0, 1fr)' so each column shares the row evenly and is free
   *  to shrink below its content's intrinsic size. */
  width?: string
  /** Column width when the table's container drops into compact mode
   *  (≤720px container). Use this to switch to a content-aware layout
   *  at narrow widths — e.g. give a status badge `max-content` and the
   *  action column `minmax(0, 2fr)` so it absorbs the slack — while
   *  keeping evenly-distributed columns on wide screens. Defaults to the
   *  same value as `width`. */
  compactWidth?: string
  /** Stack-mode label string. Optional when children is a plain string — the
   *  text content is used as the label automatically. Required when children
   *  contain JSX (icon + text, sort indicator, etc.). */
  label?: string
  /**
   * @deprecated Has no effect on HeaderCell. Pass `isActions` on the
   * matching `Table.Cell` instead — that's where the stack-mode footer
   * layout actually applies.
   */
  isActions?: boolean
  'aria-label'?: string
}) {
  if (isActions === true) {
    devWarnOnce(
      'headerCell-isActions',
      'HeaderCell `isActions` prop has no effect and is deprecated. Pass `isActions` on the matching Table.Cell instead.',
    )
  }
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

export function Cell({children, isActions}: {children: ReactNode; isActions?: boolean}) {
  const {size, variant, labels, responsive, stacked} = useTable()
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
        // Force-stack: cells become a label|value grid; the actions cell then
        // overrides its template to a single track and turns into the card's
        // right-aligned footer. Mirrors the @container (STACK_BP) branch, so
        // cellStacked applies for every cell and cellActionsStacked layers on
        // top for actions (its gridTemplateColumns wins as the later entry).
        stacked && styles.cellStacked,
        isActions && stacked && styles.cellActionsStacked,
        variant === 'bordered' && stacked && styles.borderedCellStacked,
      ]}
    >
      {responsive && !isActions && label !== '' ? (
        <html.span style={[styles.cellLabel, stacked && styles.cellLabelStacked]}>
          {label}
        </html.span>
      ) : null}
      {isActions ? children : <html.div style={styles.cellValue}>{children}</html.div>}
    </html.div>
  )
}

// --- Export ---

import {FromTanstack} from './FromTanstack'

export const Table = {
  /** @deprecated Wrap behaviour is built into Table.Root. Drop this wrapper from new code. */
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
  /** Renders a styled Table directly from a TanStack table instance. */
  FromTanstack,
}
