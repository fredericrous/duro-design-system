import {css} from 'react-strict-dom'
import {colors} from '../../tokens/colors.css'
import {radii, spacing} from '../../tokens/spacing.css'
import {shadows} from '../../tokens/shadows.css'
import {typography} from '../../tokens/typography.css'

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
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    transform: {
      default: 'translateY(0)',
      ':hover': 'translateY(-2px)',
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
