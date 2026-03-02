import {css} from 'react-strict-dom'
import {colors, radii, spacing, typography} from '@duro/tokens'

export const styles = css.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeightMedium,
    lineHeight: 1,
    borderRadius: radii.full,
    whiteSpace: 'nowrap',
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
})
