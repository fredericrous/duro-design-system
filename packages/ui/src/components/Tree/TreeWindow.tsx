import {defaultRangeExtractor, useVirtualizer, type Range} from '@tanstack/react-virtual'
import {type RefObject, useEffect} from 'react'
import {html} from 'react-strict-dom'
import {SIZES_PX} from '@duro-app/tokens/keys'
import {resolveLength, type Length} from '../../shared/length'
import {useTree} from './TreeContext'
import {useTreePendingFocus} from './TreeFocusStore'
import {TreeItemRow} from './TreeItemRow'
import type {TreeRowModel} from './TreeRows'
import {styles} from './styles.css'

export const CAN_WINDOW = true

/** Rows rendered beyond each edge of the view. */
const OVERSCAN = 8
/** A row's height before it is measured: the touch target, as VirtualList. */
const ESTIMATED_ROW_PX = SIZES_PX.controlMd

interface TreeWindowProps {
  rows: readonly TreeRowModel[]
  maxHeight?: Length
  'aria-label'?: string
  'aria-labelledby'?: string
  scrollRef: RefObject<HTMLDivElement | null>
}

/**
 * The windowed tree (web): a scroll container `role="tree"` that mounts only
 * the rows in view, plus the tab stop, as flat treeitems carrying their level,
 * set size and position. The keyboard runs in useTreeKeyboard on the row
 * model; a move to a row that is not mounted asks the focus store, and this
 * window scrolls to it and focuses it once it mounts.
 */
export function TreeWindow({
  rows,
  maxHeight,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  scrollRef,
}: TreeWindowProps) {
  const {focus} = useTree()
  const pending = useTreePendingFocus(focus)
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW_PX,
    getItemKey: (index) => rows[index]?.value ?? index,
    overscan: OVERSCAN,
    // the tab stop stays mounted wherever the view is, so Tab can always enter
    rangeExtractor: (range: Range) => {
      const indexes = defaultRangeExtractor(range)
      const stop = rows.findIndex((row) => row.value === focus.getValue())
      if (stop < 0 || indexes.includes(stop)) return indexes
      return [...indexes, stop].sort((a, b) => a - b)
    },
  })

  const target = pending === null ? -1 : rows.findIndex((row) => row.value === pending)
  useEffect(() => {
    if (target >= 0) virtualizer.scrollToIndex(target)
  }, [target, virtualizer])
  // after the scroll the row is mounted (the extractor keeps the tab stop in
  // the window): focus it and answer the request
  useEffect(() => {
    if (pending === null) return
    if (target < 0) {
      focus.clearPending()
      return
    }
    const el = scrollRef.current?.querySelector<HTMLElement>(`[data-index="${target}"]`)
    if (!el) return
    el.focus({preventScroll: true})
    focus.clearPending()
  })

  const virtualRows = virtualizer.getVirtualItems()
  return (
    <html.div
      ref={scrollRef}
      role="tree"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      style={[
        styles.windowScroller,
        maxHeight !== undefined && styles.windowScrollerMax(resolveLength(maxHeight)),
      ]}
    >
      <html.div role="none" style={styles.windowTotal(virtualizer.getTotalSize())}>
        {virtualRows.map((virtualRow) => {
          const row = rows[virtualRow.index]
          if (!row) return null
          return (
            <TreeItemRow
              key={row.value}
              value={row.value}
              level={row.level}
              label={row.label}
              meta={row.meta}
              text={row.text}
              href={row.href}
              onNavigate={row.onNavigate}
              hasChildren={row.hasChildren}
              open={row.open}
              branch={null}
              windowed={{
                index: virtualRow.index,
                setSize: row.setSize,
                posInSet: row.posInSet,
                top: virtualRow.start,
                measureRef: virtualizer.measureElement,
              }}
            />
          )
        })}
      </html.div>
    </html.div>
  )
}
