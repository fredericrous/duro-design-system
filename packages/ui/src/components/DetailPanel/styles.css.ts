import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

// The "Apple ease" curves and the 280ms open live in the shared motion tokens
// (easing.easeOut/easeIn, duration.slow). The close is duration.base, and the
// closeAnimationDuration prop can override it via the closeDuration* styles.

export const styles = css.create({
  // --- Outer wrapper: animates width from 0 → target ---
  wrapper: {
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
  },

  // --- Wrapper open/close: SM (360px) ---
  wrapperOpenSm: {
    animationName: css.keyframes({
      from: {width: 0},
      to: {width: 360},
    }),
    animationDuration: duration.slow,
    animationTimingFunction: easing.easeOut,
    animationFillMode: 'both',
  },
  wrapperCloseSm: {
    animationName: css.keyframes({
      from: {width: 360},
      to: {width: 0},
    }),
    animationDuration: duration.base,
    animationTimingFunction: easing.easeIn,
    animationFillMode: 'both',
  },

  // --- Wrapper open/close: MD (480px) ---
  wrapperOpenMd: {
    animationName: css.keyframes({
      from: {width: 0},
      to: {width: 480},
    }),
    animationDuration: duration.slow,
    animationTimingFunction: easing.easeOut,
    animationFillMode: 'both',
  },
  wrapperCloseMd: {
    animationName: css.keyframes({
      from: {width: 480},
      to: {width: 0},
    }),
    animationDuration: duration.base,
    animationTimingFunction: easing.easeIn,
    animationFillMode: 'both',
  },

  // --- Content panel ---
  content: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.bgCard,
    borderLeftWidth: borders.hairline,
    borderLeftStyle: 'solid',
    borderLeftColor: colors.border,
    boxShadow: shadows.sm,
    position: 'relative',
  },

  // Content must maintain its target width even while wrapper is narrower
  contentSm: {width: sizes.panelSm},
  contentMd: {width: sizes.panelMd},

  // --- Content slide + fade animations ---
  slideIn: {
    animationName: css.keyframes({
      from: {
        transform: 'translateX(40px)',
        opacity: 0,
      },
      to: {
        transform: 'translateX(0)',
        opacity: 1,
      },
    }),
    animationDuration: duration.slow,
    animationTimingFunction: easing.easeOut,
    animationFillMode: 'both',
  },
  slideOut: {
    animationName: css.keyframes({
      from: {
        transform: 'translateX(0)',
        opacity: 1,
      },
      to: {
        transform: 'translateX(40px)',
        opacity: 0,
      },
    }),
    animationDuration: duration.base,
    animationTimingFunction: easing.easeIn,
    animationFillMode: 'both',
  },

  // --- Close-duration overrides ---
  // The closeAnimationDuration prop token drives both these and the unmount
  // timeout, so the exit animation can never race the unmount.
  closeDurationInstant: {animationDuration: duration.instant},
  closeDurationMinimal: {animationDuration: duration.minimal},
  closeDurationQuick: {animationDuration: duration.quick},
  closeDurationFast: {animationDuration: duration.fast},
  closeDurationBrisk: {animationDuration: duration.brisk},
  closeDurationBase: {animationDuration: duration.base},
  closeDurationSlow: {animationDuration: duration.slow},

  // --- Header ---
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: borders.hairline,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },

  // --- Title ---
  title: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: 1.4,
    color: colors.text,
    margin: 0,
    flex: 1,
    minWidth: 0,
  },

  // --- Body ---
  body: {
    flex: 1,
    overflowY: 'auto',
    // Minimal inset prevents child borders from touching panel structural borders
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
  },
  bodyPadded: {
    paddingTop: spacing.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.lg,
  },

  // --- Footer ---
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    borderTopWidth: borders.hairline,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },

  // --- Close button ---
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizes.iconButton,
    height: sizes.iconButton,
    borderRadius: radii.sm,
    borderWidth: 0,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    color: colors.textMuted,
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
    transitionProperty: 'background-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },

  inlineWrapper: {
    display: 'inline-flex',
  },
})
