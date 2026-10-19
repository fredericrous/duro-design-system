import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

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
    // Focusable so the keyboard can scroll rows that hold no control (WCAG 2.1.1).
    outlineWidth: {default: 0, ':focus-visible': borders.focusRing},
    outlineStyle: {default: 'none', ':focus-visible': 'solid'},
    outlineColor: {default: 'transparent', ':focus-visible': colors.accent},
    outlineOffset: {default: 0, ':focus-visible': `calc(-1 * ${borders.focusRing})`},
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
