import {css} from 'react-strict-dom'
import {LAYERS} from '@duro-app/tokens/keys'

/** Native Popover additions to the shared styles. */
export const nativeStyles = css.create({
  // The AnchoredOverlay's view places the popup; it flows inside it.
  // RSD on native lays out only display: flex, not the web's inline-flex.
  nativeFlex: {
    display: 'flex',
  },
  // The shared popup's `zIndex: layers.floating` is the CSS string '50',
  // which Android's view manager refuses (iOS ignores it): React Native reads
  // the number from LAYERS.
  popupInPlace: {
    position: 'relative',
    zIndex: LAYERS.floating,
  },
})
