import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {easing} from '@duro-app/tokens/tokens/motion.css'

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
  },
  toast: {
    pointerEvents: 'auto',
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: 440,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderLeftWidth: 3,
    backgroundColor: colors.bgCard,
    boxShadow: shadows.lg,
    color: colors.text,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
    animationName: {
      default: enter,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationDuration: '160ms',
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
    paddingTop: 1,
  },
  iconSuccess: {color: colors.successText},
  iconError: {color: colors.errorText},
  iconInfo: {color: colors.infoText},

  content: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  message: {
    color: colors.text,
  },
  action: {
    alignSelf: 'flex-start',
    marginTop: 2,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: colors.accent,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    textDecorationLine: 'underline',
    cursor: 'pointer',
    outlineStyle: {default: 'none', ':focus-visible': 'solid'},
    outlineWidth: 2,
    outlineColor: colors.accent,
    outlineOffset: 2,
    borderRadius: radii.sm,
  },
  closeBtn: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    marginTop: -1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: {default: colors.textMuted, ':hover': colors.text},
    cursor: 'pointer',
    borderRadius: radii.sm,
    outlineStyle: {default: 'none', ':focus-visible': 'solid'},
    outlineWidth: 2,
    outlineColor: colors.accent,
    outlineOffset: 1,
  },
})
