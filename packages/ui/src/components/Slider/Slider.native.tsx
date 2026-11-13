import {useRef, useState} from 'react'
import {PanResponder, View} from 'react-native'
import {html} from 'react-strict-dom'
import {useControllableValue} from '../../hooks/useControllableValue'
import {styles} from './styles.css'
import {fractionOf, snapToStep, valueAtFraction} from './sliderMath'
import type {SliderProps} from './Slider.types'

export type {SliderProps} from './Slider.types'

/**
 * Native Slider: a touch on the track sets the value and a drag moves it. The
 * track View is one adjustable accessibility element, whose increment and
 * decrement actions step the value (native has no arrow keys).
 */
export function Slider({
  value: controlledValue,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  children,
  'aria-label': ariaLabel,
  showValue = false,
  formatValue,
}: SliderProps) {
  const range = {min, max, step}
  const [value, setValue] = useControllableValue(
    controlledValue,
    snapToStep(defaultValue ?? min, range),
    onValueChange,
  )
  const current = snapToStep(value, range)
  const percent = fractionOf(current, range) * 100
  const text = formatValue ? formatValue(current) : String(current)
  const [trackWidth, setTrackWidth] = useState(0)

  // The responder is created once; it reads what changes through this ref.
  const latest = useRef({current, range, trackWidth, disabled, setValue})
  latest.current = {current, range, trackWidth, disabled, setValue}
  const dragStartFraction = useRef(0)

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled && latest.current.trackWidth > 0,
      onMoveShouldSetPanResponder: () => !latest.current.disabled && latest.current.trackWidth > 0,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        const {range: r, trackWidth: width, current: now, setValue: set} = latest.current
        const fraction = event.nativeEvent.locationX / width
        dragStartFraction.current = Math.min(1, Math.max(0, fraction))
        const next = valueAtFraction(fraction, r)
        if (next !== now) set(next)
      },
      onPanResponderMove: (_event, gesture) => {
        const {range: r, trackWidth: width, current: now, setValue: set} = latest.current
        const next = valueAtFraction(dragStartFraction.current + gesture.dx / width, r)
        if (next !== now) set(next)
      },
    }),
  ).current

  const stepBy = (direction: 1 | -1) => {
    const next = snapToStep(current + direction * step, range)
    if (next !== current) setValue(next)
  }

  return (
    <html.div style={[styles.root, disabled && styles.rootDisabled]}>
      {(children || showValue) && (
        <html.div style={styles.header}>
          {children && <html.span>{children}</html.span>}
          {showValue && <html.span style={styles.valueText}>{text}</html.span>}
        </html.div>
      )}
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={ariaLabel ?? (typeof children === 'string' ? children : undefined)}
        accessibilityValue={{min, max, now: current, text}}
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
        <html.div style={[styles.hit, disabled && styles.hitDisabled]}>
          <html.div style={styles.track} />
          <html.div style={[styles.fill, styles.fillWidth(percent)]} />
          <html.div style={[styles.thumb, styles.thumbAt(percent)]} />
        </html.div>
      </View>
    </html.div>
  )
}
