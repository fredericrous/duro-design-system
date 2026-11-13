import {useRef, useState} from 'react'
import type {ReactNode} from 'react'
import {PanResponder, View} from 'react-native'
import {html} from 'react-strict-dom'
import {fractionOf, snapToStep, valueAtFraction} from '../Slider/sliderMath'
import {styles} from './styles.css'

interface ColorSliderProps {
  value: number
  max: number
  label: string
  valueText: string
  disabled: boolean
  onMove: (value: number) => void
  onCommit: (value: number) => void
  children: ReactNode
}

/** Native hue or alpha slider: a touch sets the value, a drag moves it, and increment and decrement actions step it. */
export function ColorSlider({
  value,
  max,
  label,
  valueText,
  disabled,
  onMove,
  onCommit,
  children,
}: ColorSliderProps) {
  const range = {min: 0, max, step: 1}
  const [trackWidth, setTrackWidth] = useState(0)
  const latest = useRef({value, range, trackWidth, disabled, onMove, onCommit})
  latest.current = {value, range, trackWidth, disabled, onMove, onCommit}
  const dragStartFraction = useRef(0)
  const lastValue = useRef(value)

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled && latest.current.trackWidth > 0,
      onMoveShouldSetPanResponder: () => !latest.current.disabled && latest.current.trackWidth > 0,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        const {range: r, trackWidth: width, onMove: move} = latest.current
        const fraction = event.nativeEvent.locationX / width
        dragStartFraction.current = Math.min(1, Math.max(0, fraction))
        lastValue.current = valueAtFraction(fraction, r)
        move(lastValue.current)
      },
      onPanResponderMove: (_event, gesture) => {
        const {range: r, trackWidth: width, onMove: move} = latest.current
        lastValue.current = valueAtFraction(dragStartFraction.current + gesture.dx / width, r)
        move(lastValue.current)
      },
      onPanResponderRelease: () => latest.current.onCommit(lastValue.current),
      onPanResponderTerminate: () => latest.current.onCommit(lastValue.current),
    }),
  ).current

  const stepBy = (direction: 1 | -1) => onCommit(snapToStep(value + direction, range))
  const percent = fractionOf(value, range) * 100

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{min: 0, max, now: value, text: valueText}}
      accessibilityState={{disabled}}
      accessibilityActions={[{name: 'increment'}, {name: 'decrement'}]}
      onAccessibilityAction={(event) => {
        if (disabled) return
        if (event.nativeEvent.actionName === 'increment') stepBy(1)
        if (event.nativeEvent.actionName === 'decrement') stepBy(-1)
      }}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      {...responder.panHandlers}
    >
      <html.div style={[styles.hit, styles.hitTrack, disabled && styles.hitDisabled]}>
        {children}
        <html.div style={[styles.thumb, styles.thumbAt(percent, 50)]} />
      </html.div>
    </View>
  )
}
