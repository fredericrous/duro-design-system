import type {Point} from '../types'

export interface ArrowProps {
  from: Point
  to: Point
  /**
   * `none` (default) draws a straight line.
   * `L` draws a 2-segment bend: horizontal-then-vertical or vertical-then-horizontal.
   * `Z` draws a 3-segment dogleg so the middle leg is detached from both endpoints —
   * useful for branching/converging arrows that should not run along the source or
   * target box's edge.
   * `axis` controls the orientation of the middle leg.
   * - axis='v' (default): leg order is V-H or V-H-V (middle leg horizontal).
   * - axis='h': leg order is H-V or H-V-H (middle leg vertical).
   */
  bend?: 'none' | 'L' | 'Z'
  axis?: 'v' | 'h'
  /**
   * For `Z` bends, the position of the middle leg as a fraction (0..1) between
   * `from` and `to` along the primary axis. Defaults to 0.5 (centered).
   */
  mid?: number
}

export function Arrow({from, to, bend = 'none', axis = 'v', mid = 0.5}: ArrowProps) {
  const [x1, y1] = from
  const [x2, y2] = to

  if (bend === 'none') {
    return <line className="arr" x1={x1} y1={y1} x2={x2} y2={y2} markerEnd="url(#duro-arrow)" />
  }

  let d: string
  if (bend === 'L') {
    d = axis === 'v' ? `M ${x1} ${y1} V ${y2} H ${x2}` : `M ${x1} ${y1} H ${x2} V ${y2}`
  } else {
    // Z-bend: 3 segments with the middle leg detached from both endpoints.
    if (axis === 'v') {
      const midY = y1 + (y2 - y1) * mid
      d = `M ${x1} ${y1} V ${midY} H ${x2} V ${y2}`
    } else {
      const midX = x1 + (x2 - x1) * mid
      d = `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`
    }
  }

  return <path className="arr" d={d} fill="none" markerEnd="url(#duro-arrow)" />
}
