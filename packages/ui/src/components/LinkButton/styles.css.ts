import {css} from 'react-strict-dom'
import {colors, radii, spacing, typography} from '@duro-app/tokens'

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
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
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
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    color: colors.textMuted,
  },
  fullWidth: {
    width: '100%',
  },
})
