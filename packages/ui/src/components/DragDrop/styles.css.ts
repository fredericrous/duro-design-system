import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii} from '@duro-app/tokens/tokens/spacing.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'

export const styles = css.create({
  // The item is the drag handle: no browser panning starts on it, so a touch
  // hold becomes a drag instead of a scroll, and text inside never selects
  // mid-gesture.
  item: {
    touchAction: 'none',
    userSelect: 'none',
    cursor: 'grab',
    transitionProperty: 'opacity',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  itemDisabled: {
    cursor: 'default',
  },
  // The source stays in flow while its ghost travels, so nothing reflows.
  itemLifted: {
    opacity: 0.4,
    cursor: 'grabbing',
  },
  zone: {
    borderRadius: radii.sm,
    transitionProperty: 'box-shadow, background-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  // Every zone shows it can receive while something is in the air; the one
  // under the pointer lights up.
  zoneReady: {
    boxShadow: `inset 0 0 0 1px ${colors.border}`,
  },
  zoneOver: {
    boxShadow: `inset 0 0 0 2px ${colors.accent}`,
    backgroundColor: colors.infoBg,
  },
  ghost: {
    position: 'fixed',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: 1000,
    opacity: 0.9,
    cursor: 'grabbing',
  },
  ghostAt: (x: number, y: number, width: number, height: number) => ({
    width,
    height,
    transform: `translate3d(${x}px, ${y}px, 0)`,
  }),
  // Same visually-hidden recipe as TagGroup's live region.
  liveRegion: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
})
