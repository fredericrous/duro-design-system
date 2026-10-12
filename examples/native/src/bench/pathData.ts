import type {Shape} from '../../../../packages/ui/src/components/Icon/geometry'

/** One geometry shape as SVG path data, for renderers that only draw paths (Skia). */
export function pathData(shape: Shape): string {
  switch (shape.tag) {
    case 'path':
      return shape.d
    case 'circle':
      return ellipse(shape.cx, shape.cy, shape.r, shape.r)
    case 'ellipse':
      return ellipse(shape.cx, shape.cy, shape.rx, shape.ry)
    case 'line':
      return `M${shape.x1} ${shape.y1}L${shape.x2} ${shape.y2}`
    case 'rect': {
      const {x, y, width: w, height: h} = shape
      const rx = shape.rx ?? shape.ry ?? 0
      const ry = shape.ry ?? rx
      if (rx === 0) return `M${x} ${y}h${w}v${h}h${-w}Z`
      return (
        `M${x + rx} ${y}h${w - 2 * rx}a${rx} ${ry} 0 0 1 ${rx} ${ry}v${h - 2 * ry}` +
        `a${rx} ${ry} 0 0 1 ${-rx} ${ry}h${-(w - 2 * rx)}a${rx} ${ry} 0 0 1 ${-rx} ${-ry}` +
        `v${-(h - 2 * ry)}a${rx} ${ry} 0 0 1 ${rx} ${-ry}Z`
      )
    }
    case 'polyline':
      return points(shape.points)
    case 'polygon':
      return `${points(shape.points)}Z`
  }
}

function ellipse(cx: number, cy: number, rx: number, ry: number): string {
  return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`
}

function points(list: string): string {
  const numbers = list
    .trim()
    .split(/[\s,]+/)
    .map(Number)
  let d = ''
  for (let i = 0; i < numbers.length; i += 2)
    d += `${i === 0 ? 'M' : 'L'}${numbers[i]} ${numbers[i + 1]}`
  return d
}
