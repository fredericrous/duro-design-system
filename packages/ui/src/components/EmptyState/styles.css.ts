import {css} from 'react-strict-dom'
import {colors, spacing, typography} from '@duro-app/tokens'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSizeSm,
    color: colors.textMuted,
    lineHeight: typography.lineHeight,
  },
  action: {
    marginTop: spacing.sm,
  },
})
