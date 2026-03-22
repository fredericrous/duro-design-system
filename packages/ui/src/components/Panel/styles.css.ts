import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.bgCard,
  },
  bordered: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },

  body: {
    flex: 1,
    overflowY: 'auto',
  },
  bodyPadded: {
    paddingTop: spacing.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: spacing.lg,
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
})
