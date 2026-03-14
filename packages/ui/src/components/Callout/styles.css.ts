import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  base: {
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
    overflow: 'hidden', // contain the float
  },
  icon: {
    float: 'left',
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
    marginTop: 2,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
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
