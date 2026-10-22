import {useCallback, useEffect, useRef} from 'react'
import {FlatList, type NativeScrollEvent, type NativeSyntheticEvent, StyleSheet} from 'react-native'
import {html} from 'react-strict-dom'
import {SIZES_PX} from '@duro-app/tokens/keys'
import {resolveLength} from '../../shared/length'
import type {VirtualListProps} from './props'
import {nativeStyles} from './native.css'

/**
 * Native VirtualList: a FlatList with the web component's props. Prepending
 * keeps the first visible row in place (`maintainVisibleContentPosition`),
 * `onStartReached` is FlatList's own, and `anchor="end"` follows new items
 * while the reader is at the bottom. FlatList measures rows itself, so
 * `estimateSize` and `overscan` are accepted for one API and not needed.
 */

export type {VirtualListProps}

// React Native has no listitem accessibility role, so rows are not announced as
// list items (the list itself is role list).
// holds-until: the device checkpoint. Native prepend (maintainVisibleContentPosition)
// and onStartReached are verified only on a device, not in CI; FlatList may fire
// onStartReached on mount for a list shorter than the view.

const BOTTOM_SLOP = SIZES_PX.touchTarget
const MAINTAIN_POSITION = {minIndexForVisible: 0}

export function VirtualList<T>({
  items,
  renderItem,
  getKey,
  anchor = 'start',
  onStartReached,
  onEndReached,
  scrollToKey,
  onAtEndChange,
  scrollToEndKey,
  maxHeight,
  'aria-label': ariaLabel,
}: VirtualListProps<T>) {
  const listRef = useRef<FlatList<T>>(null)
  const atBottom = useRef(true)

  // The last state `onAtEndChange` was told, so it only hears a change.
  const reportedAtEnd = useRef(true)
  const atEndCallback = useRef(onAtEndChange)
  atEndCallback.current = onAtEndChange

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = e.nativeEvent
    atBottom.current =
      contentSize.height - contentOffset.y - layoutMeasurement.height <= BOTTOM_SLOP
    if (reportedAtEnd.current !== atBottom.current) {
      reportedAtEnd.current = atBottom.current
      atEndCallback.current?.(atBottom.current)
    }
  }, [])

  // `scrollToEndKey`: a new non-null key scrolls to the end and resumes following.
  const endKey = useRef(scrollToEndKey)
  useEffect(() => {
    if (endKey.current === scrollToEndKey) return
    endKey.current = scrollToEndKey
    if (scrollToEndKey === null || scrollToEndKey === undefined) return
    atBottom.current = true
    listRef.current?.scrollToEnd({animated: false})
  }, [scrollToEndKey])

  // `scrollToKey`: centre that item once per key, as soon as the items hold it.
  const scrolledTo = useRef<string | number | null | undefined>(undefined)
  useEffect(() => {
    if (scrollToKey === null || scrollToKey === undefined || scrolledTo.current === scrollToKey)
      return
    const at = items.findIndex((item, i) => getKey(item, i) === scrollToKey)
    if (at < 0) return
    scrolledTo.current = scrollToKey
    atBottom.current = false
    listRef.current?.scrollToIndex({index: at, viewPosition: 0.5, animated: false})
  }, [getKey, items, scrollToKey])

  const followEnd = useCallback(() => {
    if (anchor === 'end' && atBottom.current) listRef.current?.scrollToEnd({animated: false})
  }, [anchor])

  return (
    <html.div
      style={[
        nativeStyles.root,
        maxHeight !== undefined && nativeStyles.rootMax(resolveLength(maxHeight)),
      ]}
    >
      <FlatList
        ref={listRef}
        style={maxHeight === undefined ? layout.fill : layout.capped}
        accessibilityLabel={ariaLabel}
        accessibilityRole="list"
        data={items as T[]}
        keyExtractor={(item, index) => String(getKey(item, index))}
        renderItem={({item, index}) => <>{renderItem(item, index)}</>}
        maintainVisibleContentPosition={MAINTAIN_POSITION}
        onStartReached={onStartReached ? () => onStartReached() : undefined}
        onStartReachedThreshold={0.1}
        onEndReached={onEndReached ? () => onEndReached() : undefined}
        onEndReachedThreshold={0.1}
        // A row not measured yet: jump near it by estimate, then centre it once laid out.
        onScrollToIndexFailed={({index, averageItemLength}) => {
          listRef.current?.scrollToOffset({offset: index * averageItemLength, animated: false})
          requestAnimationFrame(() =>
            listRef.current?.scrollToIndex({index, viewPosition: 0.5, animated: false}),
          )
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onContentSizeChange={followEnd}
      />
    </html.div>
  )
}

// Fill the parent unless capped; with a cap the list shrinks to its content.
const layout = StyleSheet.create({
  fill: {flexGrow: 1, flexShrink: 1},
  capped: {flexGrow: 0, flexShrink: 1},
})
