import {css} from 'react-strict-dom'
import {easing} from '@duro-app/tokens/tokens/motion.css'

const spin = css.keyframes({
  '0%': {transform: 'rotate(0deg)'},
  '100%': {transform: 'rotate(360deg)'},
})

export const styles = css.create({
  // Web turns the ring with a CSS animation (one turn per TURN_MS).
  spinning: {
    animationName: spin,
    animationDuration: '0.6s',
    animationTimingFunction: easing.linear,
    animationIterationCount: 'infinite',
  },
})
