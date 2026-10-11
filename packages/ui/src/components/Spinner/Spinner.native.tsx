import {useEffect} from 'react'
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import {html} from 'react-strict-dom'
import {ring, TURN_MS} from './ring.css'
import {visuallyHidden} from '../../styles/visually-hidden.css'
import type {SpinnerProps} from './Spinner.types'

export type {SpinnerProps, SpinnerSize} from './Spinner.types'

/**
 * Native Spinner: the web's ring, turned by Reanimated on the UI thread (RSD
 * has no CSS animations on native), so a busy JS thread does not stall it.
 */
export function Spinner({size = 'md', label = 'Loading'}: SpinnerProps) {
  const turn = useSharedValue(0)
  useEffect(() => {
    turn.value = withRepeat(withTiming(360, {duration: TURN_MS, easing: Easing.linear}), -1)
    return () => cancelAnimation(turn)
  }, [turn])
  const turning = useAnimatedStyle(() => ({transform: [{rotate: `${turn.value}deg`}]}))

  return (
    <html.div role="status" style={ring.root}>
      <Animated.View style={turning}>
        <html.div style={[ring.ring, ring[size]]} aria-hidden />
      </Animated.View>
      <html.span style={[visuallyHidden.base, ring.srOnly]}>{label}</html.span>
    </html.div>
  )
}
