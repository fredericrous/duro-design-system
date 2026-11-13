import {useCallback, useId, useRef} from 'react'
import type {KeyboardEvent, PointerEvent} from 'react'
import {html} from 'react-strict-dom'
import {useControllableValue} from '../../hooks/useControllableValue'
import {styles} from './styles.css'
import {fractionOf, snapToStep, valueAfterKey, valueAtFraction} from './sliderMath'
import type {SliderProps} from './Slider.types'

export type {SliderProps} from './Slider.types'

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
  const labelId = useId()
  const hitRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const change = useCallback(
    (next: number) => {
      if (next !== current) setValue(next)
    },
    [current, setValue],
  )

  const moveTo = (event: PointerEvent<HTMLDivElement>) => {
    const rect = hitRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    change(valueAtFraction((event.clientX - rect.left) / rect.width, range))
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
    dragging.current = false
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const next = valueAfterKey(event.key, current, range)
    if (next === null) return
    event.preventDefault()
    change(next)
  }

  return (
    <html.div style={[styles.root, disabled && styles.rootDisabled]}>
      {(children || showValue) && (
        <html.div style={styles.header}>
          {children && <html.span id={labelId}>{children}</html.span>}
          {showValue && <html.span style={styles.valueText}>{text}</html.span>}
        </html.div>
      )}
      <html.div
        ref={hitRef}
        style={[styles.hit, disabled && styles.hitDisabled]}
        onPointerDown={handlePointerDown as never}
        onPointerMove={handlePointerMove as never}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <html.div style={styles.track} />
        <html.div style={[styles.fill, styles.fillWidth(percent)]} />
        <html.div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={children ? undefined : ariaLabel}
          aria-labelledby={children ? labelId : undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-valuetext={text}
          aria-disabled={disabled || undefined}
          onKeyDown={handleKeyDown as never}
          style={[styles.thumb, styles.thumbAt(percent)]}
        />
      </html.div>
    </html.div>
  )
}
