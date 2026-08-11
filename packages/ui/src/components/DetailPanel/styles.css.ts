import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'

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
    borderLeftWidth: 1,
    borderLeftStyle: 'solid',
    borderLeftColor: colors.border,
    boxShadow: shadows.sm,
    position: 'relative',
  },

  // Content must maintain its target width even while wrapper is narrower
  contentSm: {width: 360},
  contentMd: {width: 480},

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
  closeDurationFast: {animationDuration: duration.fast},
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
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },

  // --- Title ---
  title: {
    fontSize: 18,
    fontWeight: 600,
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
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },

  // --- Close button ---
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 8,
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
