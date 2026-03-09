import {css} from 'react-strict-dom'
import {colors, spacing} from '@duro-app/tokens'

export const styles = css.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  error: {
    color: colors.error,
  },
  success: {
    color: colors.success,
  },
  warning: {
    color: colors.warning,
  },
  muted: {
    color: colors.textMuted,
  },
})
