import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

/**
 * Native Dialog surfaces. RSD has no CSS animations on native, so enter and
 * exit are transitions between a hidden and a shown state (polyfilled with
 * Animated).
 */
export const nativeStyles = css.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdrop: {
    backgroundColor: colors.scrim,
    transitionProperty: 'opacity',
    transitionDuration: duration.base,
    transitionTimingFunction: easing.easeOut,
  },
  // Padding around the panel inside the RN viewport view.
  inset: {
    display: 'flex',
    padding: spacing.lg,
    width: '100%',
    // Native has no border-box reset (the web's global-reset.css); declare it.
    boxSizing: 'border-box',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    boxShadow: shadows.lg,
    width: '100%',
    // Native has no border-box reset (the web's global-reset.css); declare it.
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    transitionProperty: 'opacity, transform',
    transitionDuration: duration.base,
    transitionTimingFunction: easing.easeOut,
  },
  // The Body's padding inside its ScrollView (no flex: it sizes to content).
  bodyContent: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.lg,
  },
  // 85% of the window, as the web caps the panel at 85vh: a percentage
  // max-height has no definite parent to resolve against here. The Body
  // (a ScrollView) yields.
  maxHeight: (height: number) => ({maxHeight: height}),
  shown: {
    opacity: 1,
    transform: 'scale(1)',
  },
  hidden: {
    opacity: 0,
    transform: 'scale(0.97)',
  },
  exitInstant: {transitionDuration: duration.instant},
  exitMinimal: {transitionDuration: duration.minimal},
  exitQuick: {transitionDuration: duration.quick},
  exitFast: {transitionDuration: duration.fast},
  exitBrisk: {transitionDuration: duration.brisk},
  exitBase: {transitionDuration: duration.base},
  exitSlow: {transitionDuration: duration.slow},
})
