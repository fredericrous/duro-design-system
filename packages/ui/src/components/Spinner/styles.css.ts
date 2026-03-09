import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens'

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
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  sm: {
    width: 16,
    height: 16,
    borderWidth: 2,
  },
  md: {
    width: 24,
    height: 24,
    borderWidth: 2,
  },
  lg: {
    width: 40,
    height: 40,
    borderWidth: 3,
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
  },
})
