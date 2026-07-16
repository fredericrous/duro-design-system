import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'

export const styles = css.create({
  base: {
    backgroundColor: colors.bgCard,
    color: colors.text,
    fontFamily: typography.fontFamily,
  },
  // Variants
  elevated: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    boxShadow: shadows.md,
  },
  outlined: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  filled: {
    borderRadius: radii.md,
  },
  interactive: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: colors.border,
      ':hover': colors.accent,
    },
    backgroundColor: {
      default: colors.bgCard,
      ':hover': colors.bgCardHover,
    },
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color, transform',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
    // Lift on hover; suppressed under reduced motion so there's no positional
    // shift (the token duration also collapses to 0ms there).
    transform: {
      default: 'translateY(0)',
      ':hover': {
        default: 'translateY(-2px)',
        '@media (prefers-reduced-motion: reduce)': 'translateY(0)',
      },
    },
  },
  // Sizes (padding)
  sizeDefault: {
    padding: spacing.lg,
  },
  sizeCompact: {
    padding: spacing.md,
  },
  sizeFull: {
    padding: spacing.xl,
  },
  // Header
  header: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    marginBottom: spacing.md,
  },
})
