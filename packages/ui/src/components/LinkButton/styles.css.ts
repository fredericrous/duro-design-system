import {css} from 'react-strict-dom'
import {colors} from '@greenharness/greenrack-tokens/tokens/colors.css'
import {spacing, radii} from '@greenharness/greenrack-tokens/tokens/spacing.css'
import {typography} from '@greenharness/greenrack-tokens/tokens/typography.css'
import {duration, easing} from '@greenharness/greenrack-tokens/tokens/motion.css'
import {borders} from '@greenharness/greenrack-tokens/tokens/borders.css'
import {sizes} from '@greenharness/greenrack-tokens/tokens/sizes.css'

export const styles = css.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    lineHeight: typography.lineHeight,
    borderRadius: radii.sm,
    cursor: 'pointer',
    textDecoration: 'none',
    transitionProperty: 'background-color, border-color, color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
    // Matches Button: the 44px target under a coarse pointer (5.6).
    minWidth: {default: null, '@media (pointer: coarse)': sizes.touchTarget},
    // As Button: the min-width above would let a crowded row squeeze the label.
    flexShrink: 0,
  },
  sizeDefault: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    minHeight: {default: null, '@media (pointer: coarse)': sizes.touchTarget},
  },
  sizeSmall: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    fontSize: typography.fontSizeXs,

    // Matches Button: every small control is at least controlSm tall, and
    // the touch target under a coarse pointer (5.6).
    minHeight: {default: sizes.controlSm, '@media (pointer: coarse)': sizes.touchTarget},
  },
  primary: {
    backgroundColor: {
      default: colors.accent,
      ':hover': colors.accentHover,
    },
    color: colors.accentContrast,
  },
  secondary: {
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: colors.border,
    color: colors.textMuted,
  },
  fullWidth: {
    width: '100%',
    // Native has no border-box reset (the web's global-reset.css); declare it.
    boxSizing: 'border-box',
  },
})
