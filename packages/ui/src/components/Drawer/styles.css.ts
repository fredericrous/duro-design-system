import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {layers} from '@duro-app/tokens/tokens/layers.css'

export const styles = css.create({
  // --- Backdrop ---
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: colors.scrim,
    zIndex: layers.overlay,
    // Portaled into the ThemeProvider mount, which is pointer-events: none:
    // the backdrop must take clicks back (outside click dismisses).
    pointerEvents: 'auto',
  },
  backdropOpen: {
    animationName: css.keyframes({
      from: {opacity: 0},
      to: {opacity: 1},
    }),
    animationDuration: duration.base,
    animationTimingFunction: easing.easeOut,
    animationFillMode: 'both',
  },
  backdropClosing: {
    animationName: css.keyframes({
      from: {opacity: 1},
      to: {opacity: 0},
    }),
    animationDuration: duration.fast,
    animationTimingFunction: easing.easeIn,
    animationFillMode: 'both',
  },

  // --- Viewport (positioning container) ---
  viewport: {
    position: 'fixed',
    inset: 0,
    zIndex: layers.modal,
    display: 'flex',
    pointerEvents: 'none',
  },

  // Non-modal: a floating surface beside the page, not above it like a modal.
  viewportNonModal: {
    zIndex: layers.floating,
  },

  // A floating panel keeps clear of the viewport edge.
  viewportFloating: {
    padding: spacing.md,
    boxSizing: 'border-box',
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
    // Native has no border-box reset (the web's global-reset.css); declare it.
    boxSizing: 'border-box',
    height: '100%',
    borderLeftWidth: borders.hairline,
    borderLeftStyle: 'solid',
    borderLeftColor: colors.border,
  },
  panelVertical: {
    width: '100%',
    // Native has no border-box reset (the web's global-reset.css); declare it.
    boxSizing: 'border-box',
    borderTopWidth: borders.hairline,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: '85vh',
  },
  // A snap sheet: as tall as its detent, which replaces the 85vh cap.
  panelSnap: {
    maxHeight: 'none',
    transitionProperty: 'height',
    transitionDuration: duration.base,
    transitionTimingFunction: easing.easeOut,
  },
  sheetHeight: (height: number) => ({height}),

  // A side drawer with detents: as wide as its detent, which replaces the max-width cap.
  panelSideSnap: {
    transitionProperty: 'width',
    transitionDuration: duration.base,
    transitionTimingFunction: easing.easeOut,
  },
  sheetWidth: (width: number) => ({width}),

  // The side grabber: a vertical strip down the panel's inner edge.
  grabberHitSide: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: spacing.ms,
    paddingRight: spacing.ms,
    cursor: 'pointer',
    zIndex: layers.raised,
  },
  grabberHitSideRight: {left: 0},
  grabberHitSideLeft: {right: 0},
  grabberVertical: {
    width: sizes.sheetGrabberH,
    height: sizes.sheetGrabberW,
  },

  // The grabber's web-only additions: a grab cursor, and the browser leaves the drag to us.
  grabberHitWeb: {
    cursor: 'grab',
    touchAction: 'none',
  },

  // A floating panel: a border and rounded corners all round, and never wider or taller than its
  // inset viewport. Longhands, so they replace the one-sided borders of the flush panel.
  panelFloating: {
    maxWidth: '100%',
    boxShadow: shadows.md,
    borderTopWidth: borders.hairline,
    borderRightWidth: borders.hairline,
    borderBottomWidth: borders.hairline,
    borderLeftWidth: borders.hairline,
    borderTopStyle: 'solid',
    borderRightStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderTopColor: colors.borderStrong,
    borderRightColor: colors.borderStrong,
    borderBottomColor: colors.borderStrong,
    borderLeftColor: colors.borderStrong,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
  },

  panelLeftBorder: {
    borderLeftWidth: 0,
    borderRightWidth: borders.hairline,
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
  },

  // --- Panel widths (horizontal anchors) ---
  sm: {maxWidth: sizes.panelSm},
  md: {maxWidth: sizes.panelMd},
  lg: {maxWidth: sizes.panelLg},

  // --- Slide animations: Right ---
  slideInRight: {
    animationName: css.keyframes({
      from: {transform: 'translateX(100%)'},
      to: {transform: 'translateX(0)'},
    }),
    animationDuration: duration.base,
    animationTimingFunction: easing.easeOut,
    animationFillMode: 'both',
  },
  slideOutRight: {
    animationName: css.keyframes({
      from: {transform: 'translateX(0)'},
      to: {transform: 'translateX(100%)'},
    }),
    animationDuration: duration.fast,
    animationTimingFunction: easing.easeIn,
    animationFillMode: 'both',
  },

  // --- Slide animations: Left ---
  slideInLeft: {
    animationName: css.keyframes({
      from: {transform: 'translateX(-100%)'},
      to: {transform: 'translateX(0)'},
    }),
    animationDuration: duration.base,
    animationTimingFunction: easing.easeOut,
    animationFillMode: 'both',
  },
  slideOutLeft: {
    animationName: css.keyframes({
      from: {transform: 'translateX(0)'},
      to: {transform: 'translateX(-100%)'},
    }),
    animationDuration: duration.fast,
    animationTimingFunction: easing.easeIn,
    animationFillMode: 'both',
  },

  // --- Slide animations: Bottom ---
  slideInBottom: {
    animationName: css.keyframes({
      from: {transform: 'translateY(100%)'},
      to: {transform: 'translateY(0)'},
    }),
    animationDuration: duration.base,
    animationTimingFunction: easing.easeOut,
    animationFillMode: 'both',
  },
  slideOutBottom: {
    animationName: css.keyframes({
      from: {transform: 'translateY(0)'},
      to: {transform: 'translateY(100%)'},
    }),
    animationDuration: duration.fast,
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

  // --- Body ---
  body: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.lg,
    overflowY: 'auto',
    flex: 1,
  },
  bodyFlush: {
    paddingLeft: 0,
    paddingRight: 0,
  },
})
