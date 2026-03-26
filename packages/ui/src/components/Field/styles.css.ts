import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  rootSide: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  label: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    color: colors.text,
  },
  labelSide: {
    minWidth: 120,
    paddingTop: spacing.sm,
    flexShrink: 0,
  },
  description: {
    fontSize: typography.fontSizeXs,
    color: colors.textMuted,
  },
  error: {
    fontSize: typography.fontSizeXs,
    color: colors.errorText,
  },
  fieldContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    flex: 1,
    minWidth: 0,
  },
  necessityIcon: {
    color: colors.error,
  },
  necessityLabel: {
    color: colors.textMuted,
    fontWeight: typography.fontWeightNormal,
    fontSize: typography.fontSizeXs,
  },
})
