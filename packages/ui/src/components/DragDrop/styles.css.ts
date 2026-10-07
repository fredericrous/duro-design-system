import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii} from '@duro-app/tokens/tokens/spacing.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {layers} from '@duro-app/tokens/tokens/layers.css'

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
  // under the pointer lights up. Drop-target rings, not focus: keyboard focus
  // stays on outlines, which survive forced-colors mode.
  // Forced-colors mode drops box-shadows and fills; the transparent outline
  // is what it paints instead (in a system colour), so the rings survive.
  zoneReady: {
    boxShadow: shadows.dropReady,
    outlineStyle: 'solid',
    outlineWidth: borders.hairline,
    outlineColor: 'transparent',
    outlineOffset: `calc(-1 * ${borders.hairline})`,
  },
  zoneOver: {
    boxShadow: shadows.dropOver,
    backgroundColor: colors.infoBg,
    outlineStyle: 'solid',
    outlineWidth: borders.strong,
    outlineColor: 'transparent',
    outlineOffset: `calc(-1 * ${borders.strong})`,
  },
  ghost: {
    position: 'fixed',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    // Portalled into the ThemeProvider mount, where it must clear a Dialog
    // or Drawer the drag happens in.
    zIndex: layers.popup,
    opacity: 0.9,
    cursor: 'grabbing',
  },
  ghostAt: (x: number, y: number, width: number, height: number) => ({
    width,
    height,
    transform: `translate3d(${x}px, ${y}px, 0)`,
  }),
})
