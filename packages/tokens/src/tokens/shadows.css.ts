import {css} from 'react-strict-dom'

export const shadows = css.defineVars({
  sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
  md: '0 4px 12px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
  // DragDrop's drop-target rings: borders.hairline in colors.border on every
  // zone that can receive, borders.strong in colors.accent on the one under the
  // pointer. Literal per theme (StyleX needs inline literals); the drift check
  // rebuilds each from the palette. Not focus: focus stays on outlines.
  dropReady: 'inset 0 0 0 1px #333333',
  dropOver: 'inset 0 0 0 2px #6aaffc',
})
