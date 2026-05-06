import type {ReactNode} from 'react'

export interface DiagramProps {
  width: number
  height: number
  title: string
  desc?: string
  viewBox?: string
  children: ReactNode
}

export function Diagram({width, height, title, desc, viewBox, children}: DiagramProps) {
  return (
    <svg
      role="img"
      className="duro-diagram"
      viewBox={viewBox ?? `0 0 ${width} ${height}`}
      width="100%"
      style={{maxWidth: width, height: 'auto', display: 'block'}}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {desc ? <desc>{desc}</desc> : null}
      <defs>
        <marker
          id="duro-arrow"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto-start-reverse"
        >
          <path
            d="M2 1L8 5L2 9"
            fill="none"
            stroke="context-stroke"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
      {children}
    </svg>
  )
}
