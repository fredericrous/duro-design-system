import {css} from 'react-strict-dom'

/** Native Popover additions to the shared styles. */
export const nativeStyles = css.create({
  // The AnchoredOverlay's view places the popup; it flows inside it.
  // RSD on native lays out only display: flex, not the web's inline-flex.
  nativeFlex: {
    display: 'flex',
  },
  popupInPlace: {
    position: 'relative',
  },
})
