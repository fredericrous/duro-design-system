import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

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
