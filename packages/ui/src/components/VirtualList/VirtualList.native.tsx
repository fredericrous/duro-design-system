import {useCallback, useRef} from 'react'
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

const BOTTOM_SLOP = SIZES_PX.touchTarget
const MAINTAIN_POSITION = {minIndexForVisible: 0}

export function VirtualList<T>({
  items,
  renderItem,
  getKey,
  anchor = 'start',
  onStartReached,
  maxHeight,
  'aria-label': ariaLabel,
}: VirtualListProps<T>) {
  const listRef = useRef<FlatList<T>>(null)
  const atBottom = useRef(true)

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = e.nativeEvent
    atBottom.current =
      contentSize.height - contentOffset.y - layoutMeasurement.height <= BOTTOM_SLOP
  }, [])

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
        style={layout.list}
        accessibilityLabel={ariaLabel}
        accessibilityRole="list"
        data={items as T[]}
        keyExtractor={(item, index) => String(getKey(item, index))}
        renderItem={({item, index}) => <>{renderItem(item, index)}</>}
        maintainVisibleContentPosition={MAINTAIN_POSITION}
        onStartReached={onStartReached ? () => onStartReached() : undefined}
        onStartReachedThreshold={0.1}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onContentSizeChange={followEnd}
      />
    </html.div>
  )
}

const layout = StyleSheet.create({list: {flexGrow: 0, flexShrink: 1}})
