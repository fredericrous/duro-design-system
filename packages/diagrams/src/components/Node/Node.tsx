import type {Ramp} from '../types'

export interface NodeProps {
  x: number
  y: number
  w: number
  h: number
  ramp: Ramp
  title: string
  subtitle?: string
  rx?: number
}

export function Node({x, y, w, h, ramp, title, subtitle, rx = 8}: NodeProps) {
  const cx = x + w / 2
  const titleY = subtitle ? y + h / 2 - 9 : y + h / 2
  const subtitleY = y + h / 2 + 9

  return (
    <g className={`node c-${ramp}`}>
      <rect x={x} y={y} width={w} height={h} rx={rx} strokeWidth={0.5} />
      <text className="th" x={cx} y={titleY} textAnchor="middle" dominantBaseline="central">
        {title}
      </text>
      {subtitle ? (
        <text className="ts" x={cx} y={subtitleY} textAnchor="middle" dominantBaseline="central">
          {subtitle}
        </text>
      ) : null}
    </g>
  )
}
