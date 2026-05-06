import type {Point} from '../types'

export interface ArrowProps {
  from: Point
  to: Point
  /**
   * `none` (default) draws a straight line.
   * `L` draws a horizontal-then-vertical (or vertical-then-horizontal) bend.
   * `axis` controls which leg comes first for L-bends; defaults to 'v' (vertical first).
   */
  bend?: 'none' | 'L'
  axis?: 'v' | 'h'
}

export function Arrow({from, to, bend = 'none', axis = 'v'}: ArrowProps) {
  const [x1, y1] = from
  const [x2, y2] = to

  if (bend === 'none') {
    return <line className="arr" x1={x1} y1={y1} x2={x2} y2={y2} markerEnd="url(#duro-arrow)" />
  }

  // L-bend: vertical first (V then H), or horizontal first (H then V)
  const d = axis === 'v' ? `M ${x1} ${y1} V ${y2} H ${x2}` : `M ${x1} ${y1} H ${x2} V ${y2}`

  return <path className="arr" d={d} fill="none" markerEnd="url(#duro-arrow)" />
}
