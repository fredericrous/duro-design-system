import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {LAYERS} from '@duro-app/tokens/keys'

/** Native Menu additions to the shared styles. */
export const nativeStyles = css.create({
  // The AnchoredOverlay's view places the popup; it flows inside it.
  // RSD on native lays out only display: flex, not the web's inline-flex.
  nativeFlex: {
    display: 'flex',
  },
  // The shared popup's `zIndex: layers.popup` is the CSS string '1050', which
  // Android's view manager refuses (iOS ignores it): React Native reads the
  // number from LAYERS.
  popupInPlace: {
    position: 'relative',
    zIndex: LAYERS.popup,
  },
  // A press shows the highlight that hover and the arrow keys show on the web.
  itemPressed: {
    backgroundColor: colors.bgCardHover,
  },
})
