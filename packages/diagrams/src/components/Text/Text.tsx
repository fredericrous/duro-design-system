import type {ReactNode} from 'react'

export type TextVariant = 't' | 'ts' | 'th'
export type TextAnchor = 'start' | 'middle' | 'end'

export interface TextProps {
  x: number
  y: number
  variant?: TextVariant
  anchor?: TextAnchor
  children: ReactNode
}

export function Text({x, y, variant = 't', anchor = 'start', children}: TextProps) {
  return (
    <text className={variant} x={x} y={y} textAnchor={anchor} dominantBaseline="central">
      {children}
    </text>
  )
}
