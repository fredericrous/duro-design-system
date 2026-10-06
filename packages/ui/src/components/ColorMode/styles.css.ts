import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

export const styles = css.create({
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: {
      default: colors.border,
      ':hover': colors.textMuted,
    },
    borderRadius: radii.sm,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    color: colors.text,
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color, color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
    outlineWidth: {default: 0, ':focus-visible': borders.focusRing},
    outlineStyle: 'solid',
    outlineColor: colors.accent,
    outlineOffset: borders.focusOffset,
  },
})
