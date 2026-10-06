import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {easing} from '@duro-app/tokens/tokens/motion.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

const spin = css.keyframes({
  '0%': {transform: 'rotate(0deg)'},
  '100%': {transform: 'rotate(360deg)'},
})

export const styles = css.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderRadius: '50%',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderTopColor: colors.accent,
    animationName: spin,
    animationDuration: '0.6s',
    animationTimingFunction: easing.linear,
    animationIterationCount: 'infinite',
  },
  sm: {
    width: sizes.spinnerSm,
    height: sizes.spinnerSm,
    borderWidth: borders.strong,
  },
  md: {
    width: sizes.spinnerMd,
    height: sizes.spinnerMd,
    borderWidth: borders.strong,
  },
  lg: {
    width: sizes.spinnerLg,
    height: sizes.spinnerLg,
    borderWidth: borders.accent,
  },
  // Layered on visuallyHidden.base.
  srOnly: {
    clip: 'rect(0, 0, 0, 0)',
  },
})
