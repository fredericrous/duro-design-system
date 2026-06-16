import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii} from '@duro-app/tokens/tokens/spacing.css'

export const styles = css.create({
  base: {
    width: 44,
    height: 34,
    padding: 2,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: colors.border,
      ':hover': colors.textMuted,
    },
    borderRadius: radii.sm,
    cursor: 'pointer',
    outlineWidth: {
      default: 0,
      ':focus-visible': 2,
    },
    outlineStyle: {
      default: 'none',
      ':focus-visible': 'solid',
    },
    outlineColor: {
      default: 'transparent',
      ':focus-visible': colors.accent,
    },
    outlineOffset: 1,
  },
  invalid: {
    borderColor: colors.error,
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
})
