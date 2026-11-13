import {useRef} from 'react'
import type {KeyboardEvent, PointerEvent, ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {fractionOf, valueAfterKey, valueAtFraction} from '../Slider/sliderMath'
import {styles} from './styles.css'

interface ColorSliderProps {
  /** The value, a whole number from 0 to `max`. */
  value: number
  max: number
  label: string
  valueText: string
  disabled: boolean
  onMove: (value: number) => void
  onCommit: (value: number) => void
  /** The track's background layers. */
  children: ReactNode
}

/** A hue or alpha slider on Slider's math: a track with its own background and one thumb. */
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
  const hitRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const lastValue = useRef(value)

  const moveTo = (event: PointerEvent<HTMLDivElement>) => {
    const rect = hitRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const next = valueAtFraction((event.clientX - rect.left) / rect.width, range)
    lastValue.current = next
    onMove(next)
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return
    dragging.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    moveTo(event)
    event.currentTarget.querySelector<HTMLElement>('[role="slider"]')?.focus()
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || !dragging.current) return
    moveTo(event)
  }

  const endDrag = () => {
    if (!dragging.current) return
    dragging.current = false
    onCommit(lastValue.current)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const next = valueAfterKey(event.key, value, range)
    if (next === null) return
    event.preventDefault()
    onCommit(next)
  }

  const percent = fractionOf(value, range) * 100

  return (
    <html.div
      ref={hitRef}
      style={[styles.hit, styles.hitTrack, disabled && styles.hitDisabled]}
      onPointerDown={handlePointerDown as never}
      onPointerMove={handlePointerMove as never}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {children}
      <html.div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valueText}
        aria-disabled={disabled || undefined}
        onKeyDown={handleKeyDown as never}
        style={[styles.thumb, styles.thumbAt(percent, 50)]}
      />
    </html.div>
  )
}
