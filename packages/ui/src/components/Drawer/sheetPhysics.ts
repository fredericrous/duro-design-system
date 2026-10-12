/**
 * The drawer's drag rules, shared by the web (pointer events) and native
 * (Gesture Handler on the UI thread) so both settle a drag the same way.
 * Pure numbers: no DOM, no React Native. The functions the native drag
 * calls on the UI thread are worklets ('worklet'); on the web the directive
 * is an inert string.
 */

import {DURATION_MS, SPACING_PX} from '@duro-app/tokens/keys'

/** A bottom-sheet detent (plan N0, Decision 5). */
export type SnapPoint = 'medium' | 'large'

/** Fraction of the panel (or of the lowest detent) a drag must cover to dismiss */
export const DISMISS_THRESHOLD = 0.3

/** Release speed (px/ms) that dismisses, or moves one detent, whatever the distance */
export const VELOCITY_THRESHOLD = 0.5

/** Duration of the slide-out once a drag dismisses (ms) */
export const DISMISS_DURATION = DURATION_MS.brisk

/** Duration of the settle onto a detent, or the snap back (ms) */
export const SNAP_DURATION = DURATION_MS.base

/** Movement (px) before a press becomes a drag; under it a tap stays a tap */
export const DRAG_SLOP = 8

/** Movement (px) across the drag's axis that hands the gesture to a scroll instead */
export const CROSS_SLOP = 16

/** 'medium' is half the window */
export const MEDIUM_FRACTION = 0.5

/** How far (px) a snap sheet may be pulled past its largest detent: it resists, never further */
export const SNAP_MAX_OVERSHOOT = SPACING_PX.lg

/** Height of one detent: 'medium' half the window, 'large' the window less its top inset. */
export function detentHeight(point: SnapPoint, windowHeight: number, topInset: number): number {
  'worklet'
  return point === 'medium' ? windowHeight * MEDIUM_FRACTION : windowHeight - topInset
}

/** The detents in ascending height, each once. */
export function sortSnapPoints(points: readonly SnapPoint[]): SnapPoint[] {
  return (['medium', 'large'] as const).filter((p) => points.includes(p))
}

/**
 * Where a released drag settles: a detent index into `heights` (ascending),
 * or 'dismiss'.
 *
 * - A fling (|velocity| over VELOCITY_THRESHOLD) moves one detent in its
 *   direction from the detent it started at; down from the lowest dismisses.
 * - Otherwise the nearest detent wins, unless the sheet is below the lowest
 *   by more than DISMISS_THRESHOLD of it, which dismisses.
 *
 * `velocity` is px/ms, positive downward (closing).
 */
export function settleDetent({
  heights,
  from,
  height,
  velocity,
}: {
  heights: readonly number[]
  from: number
  height: number
  velocity: number
}): number | 'dismiss' {
  'worklet'
  const last = heights.length - 1
  if (velocity > VELOCITY_THRESHOLD) return from === 0 ? 'dismiss' : from - 1
  if (velocity < -VELOCITY_THRESHOLD) return Math.min(from + 1, last)
  if (height < heights[0] * (1 - DISMISS_THRESHOLD)) return 'dismiss'
  let nearest = 0
  for (let i = 1; i <= last; i++) {
    if (Math.abs(heights[i] - height) < Math.abs(heights[nearest] - height)) nearest = i
  }
  return nearest
}

/** The grabber's tap: the next detent up, wrapping from the largest to the smallest. */
export function cycleDetent(index: number, count: number): number {
  'worklet'
  return count === 0 ? 0 : (index + 1) % count
}

/**
 * Past the largest detent the sheet resists: the overshoot grows ever more
 * slowly and never exceeds `max`.
 */
export function rubberBand(overshoot: number, max: number): number {
  'worklet'
  if (overshoot <= 0) return 0
  return (overshoot / (overshoot + max * 4)) * max
}

/** Whether a side drawer's release dismisses it. `movement` is toward its edge. */
export function shouldDismissEdge(movement: number, size: number, velocity: number): boolean {
  'worklet'
  return movement / size > DISMISS_THRESHOLD || velocity > VELOCITY_THRESHOLD
}
