import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'

/** Native Menu additions to the shared styles. */
export const nativeStyles = css.create({
  // The AnchoredOverlay's view places the popup; it flows inside it.
  // RSD on native lays out only display: flex, not the web's inline-flex.
  nativeFlex: {
    display: 'flex',
  },
  popupInPlace: {
    position: 'relative',
  },
  // A press shows the highlight that hover and the arrow keys show on the web.
  itemPressed: {
    backgroundColor: colors.bgCardHover,
  },
})
