import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii} from '@duro-app/tokens/tokens/spacing.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'

// Direction "Underlined" (docs/mockups/text-link/Underlined.dc.html): the
// underline is always there, so colour is never the only cue (WCAG F73).
export const styles = css.create({
  base: {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    cursor: 'pointer',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    borderRadius: radii.xs,
    transitionProperty: 'color, text-decoration-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
    outlineWidth: {
      default: 0,
      ':focus-visible': borders.focusRing,
    },
    outlineStyle: {
      default: 'none',
      ':focus-visible': 'solid',
    },
    outlineColor: {
      default: 'transparent',
      ':focus-visible': colors.accent,
    },
    outlineOffset: {
      default: 0,
      ':focus-visible': borders.focusOffset,
    },
  },
  default: {
    color: {
      default: colors.accent,
      ':hover': colors.accentHover,
    },
    textDecorationColor: {
      default: colors.accent,
      ':hover': colors.accentHover,
    },
  },
  subtle: {
    color: {
      default: 'inherit',
      ':hover': colors.accent,
    },
    textDecorationColor: {
      default: colors.textMuted,
      ':hover': colors.accent,
    },
  },
})
