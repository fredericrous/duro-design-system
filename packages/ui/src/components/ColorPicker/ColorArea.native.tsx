import {useRef, useState} from 'react'
import {PanResponder, View} from 'react-native'
import {html} from 'react-strict-dom'
import {areaPositionAfterKey, areaPositionAt, areaValueText, type AreaPosition} from './areaMath'
import {styles} from './styles.css'

interface ColorAreaProps {
  position: AreaPosition
  hueColor: string
  label: string
  saturationLabel: string
  brightnessLabel: string
  disabled: boolean
  onMove: (position: AreaPosition) => void
  onCommit: (position: AreaPosition) => void
}

const ACTION_KEYS: Record<string, string> = {
  increment: 'ArrowRight',
  decrement: 'ArrowLeft',
  brightnessUp: 'ArrowUp',
  brightnessDown: 'ArrowDown',
}

/**
 * Native area: a touch sets saturation and brightness and a drag moves them.
 * The area is one adjustable element: increment and decrement step saturation,
 * and two custom actions step brightness (native has no arrow keys).
 */
export function ColorArea({
  position,
  hueColor,
  label,
  saturationLabel,
  brightnessLabel,
  disabled,
  onMove,
  onCommit,
}: ColorAreaProps) {
  const [size, setSize] = useState({width: 0, height: 0})
  const latest = useRef({position, size, disabled, onMove, onCommit})
  latest.current = {position, size, disabled, onMove, onCommit}
  const dragStart = useRef({x: 0, y: 0})
  const lastPosition = useRef(position)

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled && latest.current.size.width > 0,
      onMoveShouldSetPanResponder: () => !latest.current.disabled && latest.current.size.width > 0,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        const {size: area, onMove: move} = latest.current
        const x = event.nativeEvent.locationX / area.width
        const y = event.nativeEvent.locationY / area.height
        dragStart.current = {x, y}
        lastPosition.current = areaPositionAt(x, y)
        move(lastPosition.current)
      },
      onPanResponderMove: (_event, gesture) => {
        const {size: area, onMove: move} = latest.current
        lastPosition.current = areaPositionAt(
          dragStart.current.x + gesture.dx / area.width,
          dragStart.current.y + gesture.dy / area.height,
        )
        move(lastPosition.current)
      },
      onPanResponderRelease: () => latest.current.onCommit(lastPosition.current),
      onPanResponderTerminate: () => latest.current.onCommit(lastPosition.current),
    }),
  ).current

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{
        text: areaValueText(position, {saturation: saturationLabel, brightness: brightnessLabel}),
      }}
      accessibilityState={{disabled}}
      accessibilityActions={[
        {name: 'increment'},
        {name: 'decrement'},
        {name: 'brightnessUp', label: brightnessLabel},
        {name: 'brightnessDown', label: brightnessLabel},
      ]}
      onAccessibilityAction={(event) => {
        if (disabled) return
        const key = ACTION_KEYS[event.nativeEvent.actionName]
        const next = key ? areaPositionAfterKey(key, position, true) : null
        if (next) onCommit(next)
      }}
      onLayout={(event) =>
        setSize({width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height})
      }
      {...responder.panHandlers}
    >
      <html.div style={[styles.hit, styles.hitArea, disabled && styles.hitDisabled]}>
        <html.div style={[styles.layer, styles.areaBase(hueColor)]} />
        <html.div style={[styles.layer, styles.areaWhite]} />
        <html.div style={[styles.layer, styles.areaBlack]} />
        <html.div
          style={[styles.thumb, styles.thumbAt(position.s * 100, (1 - position.v) * 100)]}
        />
      </html.div>
    </View>
  )
}
