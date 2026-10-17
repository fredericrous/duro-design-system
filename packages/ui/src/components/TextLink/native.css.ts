import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'

// Native TextLink: the same colour and underline facts as ./styles.css.ts —
// change both together. A copy, not a composition: the web file's base style
// carries transition* and :focus-visible outline keys that react-strict-dom
// rejects on native, and its :hover state becomes :active (a press) here.
export const nativeStyles = css.create({
  base: {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  default: {
    color: {
      default: colors.accent,
      ':active': colors.accentHover,
    },
    textDecorationColor: {
      default: colors.accent,
      ':active': colors.accentHover,
    },
  },
  subtle: {
    color: {
      default: 'inherit',
      ':active': colors.accent,
    },
    textDecorationColor: {
      default: colors.textMuted,
      ':active': colors.accent,
    },
  },
})
