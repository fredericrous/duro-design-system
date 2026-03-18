import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

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
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color, color, opacity',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    outlineWidth: {
      default: 0,
      ':focus-visible': 2,
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
      ':focus-visible': 2,
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
      default: 'rgba(0, 0, 0, 0.10)',
      ':hover': 'rgba(0, 0, 0, 0.18)',
    },
    borderColor: {
      default: 'rgba(0, 0, 0, 0.55)',
      ':hover': 'rgba(0, 0, 0, 0.70)',
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
})
