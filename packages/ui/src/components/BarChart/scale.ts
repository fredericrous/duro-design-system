export interface Scale {
  /** The axis top: >= the largest stack, a 1/2/5 x 10^n step multiple. */
  top: number
  /** Three gridline values, evenly spaced, the last equal to `top`. */
  gridlines: [number, number, number]
}

/** Round up to a nice 1/2/5 x 10^n value (>= value). */
function niceCeil(value: number): number {
  const exponent = Math.floor(Math.log10(value))
  const base = 10 ** exponent
  const fraction = value / base
  for (const step of [1, 2, 5, 10]) {
    if (fraction <= step + 1e-9) return step * base
  }
  return 10 * base
}

/**
 * The scale for a stacked chart whose tallest stack is `max`. The top is
 * `max` rounded up so that a third of it is a nice step; three gridlines at
 * a third, two thirds and the top. 297 -> 300 (100/200/300). An empty chart
 * (0, negative or not finite) falls back to 3 (1/2/3).
 */
export function niceScale(max: number): Scale {
  if (!Number.isFinite(max) || max <= 0) return {top: 3, gridlines: [1, 2, 3]}
  const step = niceCeil(max / 3)
  return {top: step * 3, gridlines: [step, step * 2, step * 3]}
}
