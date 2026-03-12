import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  wrapper: {
    display: 'flex',
    alignItems: 'stretch',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: colors.border,
      ':focus-within': colors.accent,
    },
    borderRadius: radii.sm,
    overflow: 'hidden',
    transitionProperty: 'border-color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
  },
  addon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    backgroundColor: colors.bgCardHover,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.textMuted,
    userSelect: 'none',
    borderWidth: 0,
  },
  addonStart: {
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
  },
  addonEnd: {
    borderLeftWidth: 1,
    borderLeftStyle: 'solid',
    borderLeftColor: colors.border,
  },
  addonClickable: {
    cursor: 'pointer',
    backgroundColor: {
      default: colors.bgCardHover,
      ':hover': colors.bgCard,
      ':active': colors.bg,
    },
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
  },
  addonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
})
