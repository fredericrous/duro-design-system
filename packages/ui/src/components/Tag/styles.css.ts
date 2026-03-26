import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeightNormal,
    lineHeight: 1,
    borderRadius: 4,
    whiteSpace: 'nowrap',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.ms,
    paddingRight: spacing.ms,
    fontSize: typography.fontSizeSm,
  },
  sizeSm: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    fontSize: typography.fontSizeXs,
  },
  // Reduce right padding when removable to keep visual balance with the button
  removableMd: {
    paddingRight: spacing.sm,
  },
  removableSm: {
    paddingRight: spacing.xs,
  },
  default: {
    backgroundColor: {
      default: colors.bg,
      ':hover': colors.bgCardHover,
    },
    color: colors.text,
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
