/** Calculations behind the saturation and brightness area, shared by web and native. */

export interface AreaPosition {
  /** Saturation, 0 to 1: left to right. */
  s: number
  /** Brightness, 0 to 1: bottom to top. */
  v: number
}

/** Keyboard step of the area, as a fraction; Shift takes the larger one. */
export const AREA_STEP = 0.01
export const AREA_LARGE_STEP = 0.1

const clampUnit = (value: number) => Math.min(1, Math.max(0, value))

/** The saturation and brightness under a point, given as fractions of the area's width and height. */
export function areaPositionAt(fractionX: number, fractionY: number): AreaPosition {
  return {s: clampUnit(fractionX), v: 1 - clampUnit(fractionY)}
}

/** Where an arrow key moves the area, or null for a key it does not handle. */
export function areaPositionAfterKey(
  key: string,
  position: AreaPosition,
  large: boolean,
): AreaPosition | null {
  const step = large ? AREA_LARGE_STEP : AREA_STEP
  switch (key) {
    case 'ArrowRight':
      return {...position, s: clampUnit(position.s + step)}
    case 'ArrowLeft':
      return {...position, s: clampUnit(position.s - step)}
    case 'ArrowUp':
      return {...position, v: clampUnit(position.v + step)}
    case 'ArrowDown':
      return {...position, v: clampUnit(position.v - step)}
    default:
      return null
  }
}

export function areaValueText(
  position: AreaPosition,
  labels: {saturation: string; brightness: string},
): string {
  return `${labels.saturation} ${Math.round(position.s * 100)}%, ${labels.brightness} ${Math.round(position.v * 100)}%`
}
