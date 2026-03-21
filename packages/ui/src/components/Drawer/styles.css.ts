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
    animationName: css.keyframes({
      from: {opacity: 0},
      to: {opacity: 1},
    }),
    animationDuration: '200ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  },
  backdropClosing: {
    animationName: css.keyframes({
      from: {opacity: 1},
      to: {opacity: 0},
    }),
    animationDuration: '160ms',
    animationTimingFunction: 'ease-in',
    animationFillMode: 'both',
  },

  // --- Viewport (positioning container) ---
  viewport: {
    position: 'fixed',
    inset: 0,
    zIndex: 1001,
    display: 'flex',
    pointerEvents: 'none',
  },

  // Right anchor (desktop default)
  viewportRight: {
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  // Left anchor
  viewportLeft: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  // Bottom anchor (mobile default)
  viewportBottom: {
    justifyContent: 'stretch',
    alignItems: 'flex-end',
  },

  // --- Panel ---
  panel: {
    position: 'relative',
    backgroundColor: colors.bgCard,
    boxShadow: shadows.lg,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    pointerEvents: 'auto',
    borderWidth: 0,
    touchAction: 'none',
  },

  // Panel sizing per anchor
  panelHorizontal: {
    width: '100%',
    height: '100%',
    borderLeftWidth: 1,
    borderLeftStyle: 'solid',
    borderLeftColor: colors.border,
  },
  panelVertical: {
    width: '100%',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: '85vh',
  },
  panelLeftBorder: {
    borderLeftWidth: 0,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
  },

  // --- Panel widths (horizontal anchors) ---
  sm: {maxWidth: 360},
  md: {maxWidth: 480},
  lg: {maxWidth: 640},

  // --- Slide animations: Right ---
  slideInRight: {
    animationName: css.keyframes({
      from: {transform: 'translateX(100%)'},
      to: {transform: 'translateX(0)'},
    }),
    animationDuration: '200ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  },
  slideOutRight: {
    animationName: css.keyframes({
      from: {transform: 'translateX(0)'},
      to: {transform: 'translateX(100%)'},
    }),
    animationDuration: '160ms',
    animationTimingFunction: 'ease-in',
    animationFillMode: 'both',
  },

  // --- Slide animations: Left ---
  slideInLeft: {
    animationName: css.keyframes({
      from: {transform: 'translateX(-100%)'},
      to: {transform: 'translateX(0)'},
    }),
    animationDuration: '200ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  },
  slideOutLeft: {
    animationName: css.keyframes({
      from: {transform: 'translateX(0)'},
      to: {transform: 'translateX(-100%)'},
    }),
    animationDuration: '160ms',
    animationTimingFunction: 'ease-in',
    animationFillMode: 'both',
  },

  // --- Slide animations: Bottom ---
  slideInBottom: {
    animationName: css.keyframes({
      from: {transform: 'translateY(100%)'},
      to: {transform: 'translateY(0)'},
    }),
    animationDuration: '200ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  },
  slideOutBottom: {
    animationName: css.keyframes({
      from: {transform: 'translateY(0)'},
      to: {transform: 'translateY(100%)'},
    }),
    animationDuration: '160ms',
    animationTimingFunction: 'ease-in',
    animationFillMode: 'both',
  },

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

  // --- Inline wrapper ---
  inlineWrapper: {
    display: 'inline-flex',
  },
})
