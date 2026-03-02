import {css} from 'react-strict-dom'
import {colors, radii, spacing, typography} from '@duro-app/tokens'

export const styles = css.create({
  base: {
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
  },
  error: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
    color: colors.errorText,
  },
  success: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
    color: colors.successText,
  },
  warning: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    color: colors.warningText,
  },
  info: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    color: colors.infoText,
  },
})
