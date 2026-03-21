import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'

export const styles = css.create({
  // --- Backdrop ---
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  backdropOpen: {
    opacity: {
      default: 1,
    },
    animationName: css.keyframes({
      from: {opacity: 0},
      to: {opacity: 1},
    }),
    animationDuration: '180ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  },
  backdropClosing: {
    opacity: {
      default: 0,
    },
    animationName: css.keyframes({
      from: {opacity: 1},
      to: {opacity: 0},
    }),
    animationDuration: '140ms',
    animationTimingFunction: 'ease-in',
    animationFillMode: 'both',
  },

  // --- Viewport (centering container) ---
  viewport: {
    position: 'fixed',
    inset: 0,
    zIndex: 1001,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    // Allow clicking backdrop through viewport when clicking outside popup
    pointerEvents: 'none',
  },

  // --- Popup ---
  popup: {
    position: 'relative',
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    boxShadow: shadows.lg,
    width: '100%',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    pointerEvents: 'auto',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  popupOpen: {
    opacity: {
      default: 1,
    },
    animationName: css.keyframes({
      from: {
        opacity: 0,
        transform: 'scale(0.97) translateY(8px)',
      },
      to: {
        opacity: 1,
        transform: 'scale(1) translateY(0)',
      },
    }),
    animationDuration: '180ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  },
  popupClosing: {
    opacity: {
      default: 0,
    },
    animationName: css.keyframes({
      from: {
        opacity: 1,
        transform: 'scale(1) translateY(0)',
      },
      to: {
        opacity: 0,
        transform: 'scale(0.97) translateY(8px)',
      },
    }),
    animationDuration: '140ms',
    animationTimingFunction: 'ease-in',
    animationFillMode: 'both',
  },

  // --- Sizes ---
  sm: {maxWidth: 400},
  md: {maxWidth: 520},
  lg: {maxWidth: 680},

  // --- Header ---
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },

  // --- Title ---
  title: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeight,
    color: colors.text,
    margin: 0,
  },

  // --- Description ---
  description: {
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
    color: colors.textMuted,
    margin: 0,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.md,
  },

  // --- Body ---
  body: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.lg,
    overflowY: 'auto',
    flex: 1,
  },

  // --- Footer ---
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.lg,
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
    transitionDuration: '150ms',
  },

  // --- Inline wrapper (for Trigger / Close children) ---
  inlineWrapper: {
    display: 'inline-flex',
  },

  // --- Reduced motion ---
  reducedMotion: {
    animationDuration: '1ms',
  },
})
