import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'

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
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color, color, opacity, transform',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    // Tactile press feedback. The scale is suppressed under reduced motion (and
    // duration.fast collapses to 0ms there too), so it's inert for those users.
    transform: {
      default: 'scale(1)',
      ':active': {
        default: 'scale(0.97)',
        '@media (prefers-reduced-motion: reduce)': 'scale(1)',
      },
    },
    outlineWidth: {
      default: 0,
      ':focus-visible': borders.focusRing,
    },
    outlineStyle: {
      default: 'none',
      ':focus-visible': 'solid',
    },
    outlineColor: {
      default: 'transparent',
      ':focus-visible': colors.accent,
    },
    outlineOffset: {
      default: 0,
      ':focus-visible': borders.focusOffset,
    },
  },
  sizeDefault: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  },
  sizeSmall: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    fontSize: typography.fontSizeXs,
    // Every small control is at least controlSm tall, whatever it holds (5.5).
    minHeight: sizes.controlSm,
  },
  primary: {
    backgroundColor: {
      default: colors.accent,
      ':hover': colors.accentHover,
      ':active': colors.accentHover,
    },
    borderColor: {
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
    borderColor: colors.border,
    color: colors.textMuted,
  },
  link: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    color: {
      default: colors.accent,
      ':hover': colors.accentHover,
    },
    textDecoration: {
      default: 'none',
      ':hover': 'underline',
    },
    paddingLeft: 0,
    paddingRight: 0,
  },
  inverseSecondary: {
    backgroundColor: {
      default: colors.inverseFill,
      ':hover': colors.inverseFillHover,
    },
    borderColor: {
      default: colors.inverseBorder,
      ':hover': colors.inverseBorderHover,
    },
    color: colors.accentContrast,
  },
  danger: {
    backgroundColor: {
      default: colors.error,
      ':hover': colors.errorHover,
      ':active': colors.errorHover,
    },
    borderColor: {
      default: colors.error,
      ':hover': colors.errorHover,
    },
    color: colors.errorContrast,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  // RSD-native only honors display:'flex' (not 'inline-flex'). Layered on
  // native via `isNative` so the flex container applies; web keeps inline-flex.
  nativeFlex: {
    display: 'flex',
  },
})
