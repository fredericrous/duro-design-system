import {css} from 'react-strict-dom'

export const styles = css.create({
  // The scroll container: it fills its parent (a pane, a flex column) by
  // default, or stops at `maxHeight`.
  scroller: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  },
  scrollMax: (maxHeight: number | string) => ({
    height: 'auto',
    maxHeight,
  }),
  // The full virtual height, so the scrollbar is the list's real length.
  total: (height: number) => ({
    position: 'relative',
    width: '100%',
    height,
  }),
  row: (y: number) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    transform: `translateY(${y}px)`,
  }),
})
