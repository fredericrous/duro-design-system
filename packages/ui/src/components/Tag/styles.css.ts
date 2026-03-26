import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeightMedium,
    lineHeight: 1,
    borderRadius: radii.full,
    whiteSpace: 'nowrap',
    borderWidth: 0,
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
      ':focus-visible': 1,
    },
  },
  sizeMd: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    fontSize: typography.fontSizeXs,
  },
  sizeSm: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    fontSize: '0.625rem',
  },
  // Reduce right padding when removable to keep visual balance with the button
  removableMd: {
    paddingRight: spacing.xs,
  },
  removableSm: {
    paddingRight: 2,
  },
  default: {
    backgroundColor: colors.bgCardHover,
    color: colors.textMuted,
  },
  success: {
    backgroundColor: colors.successBg,
    color: colors.successText,
  },
  warning: {
    backgroundColor: colors.warningBg,
    color: colors.warningText,
  },
  error: {
    backgroundColor: colors.errorBg,
    color: colors.errorText,
  },
  info: {
    backgroundColor: colors.infoBg,
    color: colors.infoText,
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  removeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    borderRadius: radii.full,
    opacity: {
      default: 0.6,
      ':hover': 1,
    },
    outlineWidth: 0,
  },
  removeButtonDisabled: {
    cursor: 'not-allowed',
    opacity: 0.4,
  },
})
