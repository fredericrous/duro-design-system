import {useCallback, useEffect, useLayoutEffect, useRef} from 'react'
import {html} from 'react-strict-dom'
import {useVirtualizer} from '@tanstack/react-virtual'
import {SIZES_PX} from '@duro-app/tokens/keys'
import {resolveLength} from '../../shared/length'
import {styles} from './styles.css'
import type {VirtualListProps} from './props'

export type {VirtualListProps}

/** Within this many px of the end counts as "at the bottom" for `anchor="end"`. */
const BOTTOM_SLOP = SIZES_PX.touchTarget
/** Frames a prepend keeps re-pinning its anchor row while new rows are measured. */
const PIN_FRAMES = 6
/** Within this many px of the start counts as "reached" for `onStartReached`. */
const START_SLOP = SIZES_PX.touchTarget

/**
 * A windowed list: only the rows in view (plus `overscan`) are mounted, so a
 * list of tens of thousands stays fast. Rows are measured as they render, so
 * they may differ in height. It is a `role="list"`; each row is a listitem
 * with `aria-setsize` and `aria-posinset`, so assistive tech knows the full
 * length while most rows are not in the DOM. On native it is
 * a FlatList with the same props.
 */
export function VirtualList<T>({
  items,
  estimateSize,
  renderItem,
  getKey,
  overscan = 5,
  anchor = 'start',
  onStartReached,
  maxHeight,
  'aria-label': ariaLabel,
}: VirtualListProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => SIZES_PX[estimateSize],
    getItemKey: (index) => getKey(items[index], index),
    overscan,
  })

  // `end`: open at the last item, and follow new items while at the bottom.
  // `onStartReached`: fire once per approach to the start, re-arming when the
  // reader moves away (a prepend that moves the start away re-arms it too).
  const atBottom = useRef(true)
  const startArmed = useRef(true)
  const startCallback = useRef(onStartReached)
  startCallback.current = onStartReached
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_SLOP
      if (el.scrollTop > START_SLOP) {
        startArmed.current = true
      } else if (startArmed.current) {
        startArmed.current = false
        startCallback.current?.()
      }
    }
    el.addEventListener('scroll', onScroll, {passive: true})
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Prepend: the rows above are new and only estimated until measured, so
  // pin the first visible row (by key, read from the DOM while the list is
  // still as the reader last saw it) at its on-screen offset, and repeat for a
  // few frames while the new rows settle to their real heights.
  const firstKey = useRef<string | number | undefined>(undefined)
  const seenRow = useRef<{key: string | number; offset: number} | null>(null)
  const itemsRef = useRef(items)
  const readSeenRow = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const top = el.getBoundingClientRect().top
    for (const row of el.querySelectorAll<HTMLElement>('[role="listitem"]')) {
      const rect = row.getBoundingClientRect()
      const index = Number(row.dataset.index)
      const item = itemsRef.current[index]
      if (rect.bottom > top && item !== undefined) {
        seenRow.current = {key: getKey(item, index), offset: rect.top - top}
        return
      }
    }
  }, [getKey])
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', readSeenRow, {passive: true})
    return () => el.removeEventListener('scroll', readSeenRow)
  }, [readSeenRow])
  useLayoutEffect(() => {
    const el = scrollRef.current
    const previous = firstKey.current
    firstKey.current = items.length > 0 ? getKey(items[0], 0) : undefined
    itemsRef.current = items
    const kept = seenRow.current
    if (el && kept && previous !== undefined && previous !== firstKey.current) {
      const at = items.findIndex((item, i) => getKey(item, i) === kept.key)
      if (at >= 0) {
        const pin = () => {
          const start = virtualizer.measurementsCache[at]?.start
          if (start !== undefined) el.scrollTop = start - kept.offset
        }
        pin()
        if (el.scrollTop > START_SLOP) startArmed.current = true
        let frames = 0
        const settle = () => {
          pin()
          if (frames++ < PIN_FRAMES) requestAnimationFrame(settle)
          else readSeenRow()
        }
        requestAnimationFrame(settle)
        return
      }
    }
    readSeenRow()
  })

  useLayoutEffect(() => {
    if (anchor !== 'end' || items.length === 0 || !atBottom.current) return
    virtualizer.scrollToIndex(items.length - 1, {align: 'end'})
  }, [anchor, items.length, virtualizer])

  const rows = virtualizer.getVirtualItems()
  return (
    <html.div
      ref={scrollRef}
      role="list"
      aria-label={ariaLabel}
      style={[
        styles.scroller,
        maxHeight !== undefined && styles.scrollMax(resolveLength(maxHeight)),
      ]}
    >
      <html.div style={styles.total(virtualizer.getTotalSize())}>
        {rows.map((row) => (
          <html.div
            key={row.key}
            ref={virtualizer.measureElement}
            data-index={row.index}
            role="listitem"
            aria-setsize={items.length}
            aria-posinset={row.index + 1}
            style={styles.row(row.start)}
          >
            {renderItem(items[row.index], row.index)}
          </html.div>
        ))}
      </html.div>
    </html.div>
  )
}
