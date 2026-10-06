import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {microSpacing, radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

export const styles = css.create({
  base: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
  },
  iconWrap: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: microSpacing.px1,
  },
  content: {
    flex: 1,
    minWidth: 0,
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
