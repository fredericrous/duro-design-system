import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'

/** Apple-standard ease: aggressive deceleration, feels like "arriving" */
const APPLE_EASE_OUT = 'cubic-bezier(0.32, 0.72, 0, 1)'
const APPLE_EASE_IN = 'cubic-bezier(0.72, 0, 0.68, 0.28)'

const OPEN_DURATION = '280ms'
const CLOSE_DURATION = '220ms'

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
    animationDuration: OPEN_DURATION,
    animationTimingFunction: APPLE_EASE_OUT,
    animationFillMode: 'both',
  },
  wrapperCloseSm: {
    animationName: css.keyframes({
      from: {width: 360},
      to: {width: 0},
    }),
    animationDuration: CLOSE_DURATION,
    animationTimingFunction: APPLE_EASE_IN,
    animationFillMode: 'both',
  },

  // --- Wrapper open/close: MD (480px) ---
  wrapperOpenMd: {
    animationName: css.keyframes({
      from: {width: 0},
      to: {width: 480},
    }),
    animationDuration: OPEN_DURATION,
    animationTimingFunction: APPLE_EASE_OUT,
    animationFillMode: 'both',
  },
  wrapperCloseMd: {
    animationName: css.keyframes({
      from: {width: 480},
      to: {width: 0},
    }),
    animationDuration: CLOSE_DURATION,
    animationTimingFunction: APPLE_EASE_IN,
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
    animationDuration: OPEN_DURATION,
    animationTimingFunction: APPLE_EASE_OUT,
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
    animationDuration: CLOSE_DURATION,
    animationTimingFunction: APPLE_EASE_IN,
    animationFillMode: 'both',
  },

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
    transitionDuration: '150ms',
  },

  inlineWrapper: {
    display: 'inline-flex',
  },
})
