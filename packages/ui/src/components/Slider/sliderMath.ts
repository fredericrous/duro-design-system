/** Calculations behind Slider, shared by the web and native components. */

export interface SliderRange {
  min: number
  max: number
  step: number
}

/** How many steps PageUp and PageDown move at once. */
export const PAGE_STEPS = 10

function decimalsOf(step: number): number {
  const [, fraction = ''] = String(step).split('.')
  return fraction.length
}

/** The value kept inside the range and on the step grid that starts at `min`. */
export function snapToStep(value: number, {min, max, step}: SliderRange): number {
  const clamped = Math.min(max, Math.max(min, value))
  const snapped = min + Math.round((clamped - min) / step) * step
  const decimals = Math.max(decimalsOf(step), decimalsOf(min))
  return Math.min(max, Number(snapped.toFixed(decimals)))
}

/** Where a value sits along the track, from 0 to 1. */
export function fractionOf(value: number, {min, max}: SliderRange): number {
  if (max <= min) return 0
  return Math.min(1, Math.max(0, (value - min) / (max - min)))
}

/** The snapped value under a position along the track, from 0 to 1. */
export function valueAtFraction(fraction: number, range: SliderRange): number {
  const clamped = Math.min(1, Math.max(0, fraction))
  return snapToStep(range.min + clamped * (range.max - range.min), range)
}

/** The value a key moves to, or null for a key the slider does not handle. */
export function valueAfterKey(key: string, value: number, range: SliderRange): number | null {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return snapToStep(value + range.step, range)
    case 'ArrowLeft':
    case 'ArrowDown':
      return snapToStep(value - range.step, range)
    case 'PageUp':
      return snapToStep(value + range.step * PAGE_STEPS, range)
    case 'PageDown':
      return snapToStep(value - range.step * PAGE_STEPS, range)
    case 'Home':
      return range.min
    case 'End':
      return range.max
    default:
      return null
  }
}
