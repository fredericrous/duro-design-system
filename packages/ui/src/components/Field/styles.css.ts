import {css} from 'react-strict-dom'
import {colors, spacing, typography} from '@duro/tokens'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSizeXs,
    color: colors.textMuted,
  },
  error: {
    fontSize: typography.fontSizeXs,
    color: colors.error,
  },
})
