import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration} from '@duro-app/tokens/tokens/motion.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

export const styles = css.create({
  root: {
    position: 'relative',
    display: 'inline-flex',
  },
  inputWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    backgroundColor: colors.bgCard,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: {
      default: colors.border,
      ':hover': colors.accent,
    },
    borderRadius: radii.sm,
    transitionProperty: 'border-color',
    transitionDuration: duration.fast,
  },
  inputWrapperFocused: {
    borderColor: colors.accent,
  },
  input: {
    flex: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.text,
    backgroundColor: 'transparent',
    borderWidth: 0,
    outline: 'none',
    minWidth: 0,
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: colors.textMuted,
    cursor: 'pointer',
  },
})
