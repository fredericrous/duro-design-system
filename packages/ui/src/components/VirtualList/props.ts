import type {ReactNode} from 'react'
import type {SizeToken} from '@duro-app/tokens/keys'
import type {Length} from '../../shared/length'

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
  /**
   * Called once each time the reader scrolls to within 44px (touchTarget) of the
   * start (load older history). It fires again only after they move away.
   * A list too short to scroll calls it once for each new first item or length, until it fills.
   * Prepending items keeps the first visible row where it was on screen.
   */
  onStartReached?: () => void
  /**
   * Called once each time the reader scrolls to within 44px (touchTarget) of the
   * end (load newer items, as in a window opened on an older point). It fires
   * again only after they move away.
   */
  onEndReached?: () => void
  /**
   * Called once each time the reader comes within 44px (touchTarget) of the end
   * or leaves it, with `true` at the end and `false` away from it, so a host can
   * record whether the reader follows the live tail. It never repeats a value.
   */
  onAtEndChange?: (atEnd: boolean) => void
  /**
   * Scroll to the end, and resume `anchor="end"` following, each time the key
   * changes to a new non-null value (a host's own send), even when the reader
   * had scrolled up. The key present at the first render does nothing; `null`
   * does nothing.
   */
  scrollToEndKey?: string | number | null
  /**
   * Bring this item into view, centred, each time the key changes to an item in
   * the list (a link to one message). A key not in the list yet waits for the
   * items that hold it; `null` or `undefined` does nothing. While it applies,
   * `anchor="end"` stops following the end.
   */
  scrollToKey?: string | number | null
  /** Cap the list's height; without it, it fills its parent. */
  maxHeight?: Length
  /** The list's accessible name. */
  'aria-label': string
}
