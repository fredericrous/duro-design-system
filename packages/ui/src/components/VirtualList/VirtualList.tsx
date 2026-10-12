import {type ReactNode, useEffect, useLayoutEffect, useRef} from 'react'
import {html} from 'react-strict-dom'
import {useVirtualizer} from '@tanstack/react-virtual'
import {SIZES_PX, type SizeToken} from '@duro-app/tokens/keys'
import {resolveLength, type Length} from '../../shared/length'
import {styles} from './styles.css'

export interface VirtualListProps<T> {
  items: readonly T[]
  /** Each row's starting height estimate, a size token; rows are then measured. */
  estimateSize: SizeToken
  renderItem: (item: T, index: number) => ReactNode
  /** A stable key per item (an id), so rows keep their measurement as items change. */
  getKey: (item: T, index: number) => string | number
  /** Rows rendered beyond each edge of the view. Default 5 */
  overscan?: number
  /**
   * `end` starts at the last item and stays pinned to the bottom while new
   * items arrive, as long as the reader is at the bottom (a transcript, a log).
   * Default `start`.
   */
  anchor?: 'start' | 'end'
  /** Cap the list's height; without it, it fills its parent. */
  maxHeight?: Length
  /** The list's accessible name. */
  'aria-label': string
}

/** Within this many px of the end counts as "at the bottom" for `anchor="end"`. */
const BOTTOM_SLOP = SIZES_PX.touchTarget

/**
 * A windowed list: only the rows in view (plus `overscan`) are mounted, so a
 * list of tens of thousands stays fast. Rows are measured as they render, so
 * they may differ in height. It is a `role="list"`; each row is a listitem
 * with `aria-setsize` and `aria-posinset`, so assistive tech knows the full
 * length while most rows are not in the DOM. Web only: on native, host
 * FlashList or Legend List behind your own `.native.tsx` leaf.
 */
export function VirtualList<T>({
  items,
  estimateSize,
  renderItem,
  getKey,
  overscan = 5,
  anchor = 'start',
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
  const atBottom = useRef(true)
  useEffect(() => {
    const el = scrollRef.current
    if (!el || anchor !== 'end') return
    const onScroll = () => {
      atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_SLOP
    }
    el.addEventListener('scroll', onScroll, {passive: true})
    return () => el.removeEventListener('scroll', onScroll)
  }, [anchor])
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
