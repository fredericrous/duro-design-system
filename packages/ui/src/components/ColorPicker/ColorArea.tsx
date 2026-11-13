import {useRef} from 'react'
import type {KeyboardEvent, PointerEvent} from 'react'
import {html} from 'react-strict-dom'
import {areaPositionAfterKey, areaPositionAt, areaValueText, type AreaPosition} from './areaMath'
import {styles} from './styles.css'

interface ColorAreaProps {
  position: AreaPosition
  /** The fully saturated colour of the current hue, as the area's base. */
  hueColor: string
  label: string
  saturationLabel: string
  brightnessLabel: string
  disabled: boolean
  onMove: (position: AreaPosition) => void
  onCommit: (position: AreaPosition) => void
}

/** The saturation and brightness area: a pointer drag or the arrow keys move its thumb. */
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
  const hitRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const lastPosition = useRef(position)

  const positionOf = (event: PointerEvent<HTMLDivElement>): AreaPosition | null => {
    const rect = hitRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return null
    return areaPositionAt(
      (event.clientX - rect.left) / rect.width,
      (event.clientY - rect.top) / rect.height,
    )
  }

  const moveTo = (event: PointerEvent<HTMLDivElement>) => {
    const next = positionOf(event)
    if (!next) return
    lastPosition.current = next
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
    onCommit(lastPosition.current)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const next = areaPositionAfterKey(event.key, position, event.shiftKey)
    if (!next) return
    event.preventDefault()
    onCommit(next)
  }

  return (
    <html.div
      ref={hitRef}
      style={[styles.hit, styles.hitArea, disabled && styles.hitDisabled]}
      onPointerDown={handlePointerDown as never}
      onPointerMove={handlePointerMove as never}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <html.div style={[styles.layer, styles.areaBase(hueColor)]} />
      <html.div style={[styles.layer, styles.areaWhite]} />
      <html.div style={[styles.layer, styles.areaBlack]} />
      <html.div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position.s * 100)}
        aria-valuetext={areaValueText(position, {
          saturation: saturationLabel,
          brightness: brightnessLabel,
        })}
        aria-disabled={disabled || undefined}
        onKeyDown={handleKeyDown as never}
        style={[styles.thumb, styles.thumbAt(position.s * 100, (1 - position.v) * 100)]}
      />
    </html.div>
  )
}
