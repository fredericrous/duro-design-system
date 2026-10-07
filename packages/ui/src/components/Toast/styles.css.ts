import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {microSpacing, radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {layers} from '@duro-app/tokens/tokens/layers.css'

const enter = css.keyframes({
  from: {opacity: 0, transform: 'translateY(10px)'},
  to: {opacity: 1, transform: 'translateY(0)'},
})

export const styles = css.create({
  // Fixed, viewport-anchored stack. Portaled into the ThemeProvider mount so it
  // layers above dialogs; the container itself is click-through, each toast
  // re-enables pointer events.
  region: {
    position: 'fixed',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    pointerEvents: 'none',
    // Above modals and popups: a toast fired while a Dialog is open shows.
    zIndex: layers.toast,
  },
  toast: {
    pointerEvents: 'auto',
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: sizes.toastMaxW,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderLeftWidth: borders.accent,
    backgroundColor: colors.bgCard,
    boxShadow: shadows.lg,
    color: colors.text,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
    animationName: {
      default: enter,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationDuration: duration.brisk,
    animationTimingFunction: easing.easeOut,
  },
  success: {borderLeftColor: colors.successBorder},
  error: {borderLeftColor: colors.errorBorder},
  info: {borderLeftColor: colors.infoBorder},

  iconWrap: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: microSpacing.px1,
  },
  iconSuccess: {color: colors.successText},
  iconError: {color: colors.errorText},
  iconInfo: {color: colors.infoText},

  content: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: microSpacing.px2,
  },
  message: {
    color: colors.text,
  },
  action: {
    alignSelf: 'flex-start',
    marginTop: microSpacing.px2,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: colors.accent,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    textDecorationLine: 'underline',
    cursor: 'pointer',
    outlineStyle: {default: 'none', ':focus-visible': 'solid'},
    outlineWidth: borders.focusRing,
    outlineColor: colors.accent,
    outlineOffset: borders.focusOffset,
    borderRadius: radii.sm,
  },
  closeBtn: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: microSpacing.px2,
    marginTop: -1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: {default: colors.textMuted, ':hover': colors.text},
    cursor: 'pointer',
    borderRadius: radii.sm,
    outlineStyle: {default: 'none', ':focus-visible': 'solid'},
    outlineWidth: borders.focusRing,
    outlineColor: colors.accent,
    outlineOffset: borders.focusOffsetSm,
  },
})
