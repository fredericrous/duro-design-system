import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

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
  info: {
    color: colors.info,
  },
  muted: {
    color: colors.textMuted,
  },
})
