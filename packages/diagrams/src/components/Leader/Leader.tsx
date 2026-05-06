import type {Point} from '../types'

export interface LeaderProps {
  from: Point
  to: Point
}

export function Leader({from, to}: LeaderProps) {
  const [x1, y1] = from
  const [x2, y2] = to
  return <line className="leader" x1={x1} y1={y1} x2={x2} y2={y2} />
}
