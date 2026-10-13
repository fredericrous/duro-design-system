import {create} from 'qrcode'

/** Light modules around the code, part of the symbol: scanners need it to find the edges. */
export const QUIET_ZONE = 2

export interface QrGeometry {
  /** Side of the square viewBox, in modules, quiet zone included. */
  readonly size: number
  /** Every dark module as one SVG path, one horizontal run per subpath. */
  readonly d: string
}

/**
 * The code as one path, drawn identically by the web `<svg>` and by react-native-svg on native.
 * Error correction M (15 %) matches what Happier's pairing codes used before this component.
 */
export function qrGeometry(value: string): QrGeometry {
  const {modules} = create(value, {errorCorrectionLevel: 'M'})
  const count = modules.size
  const runs: string[] = []
  for (let row = 0; row < count; row++) {
    let col = 0
    while (col < count) {
      if (!modules.get(row, col)) {
        col++
        continue
      }
      const start = col
      while (col < count && modules.get(row, col)) col++
      runs.push(`M${start + QUIET_ZONE} ${row + QUIET_ZONE}h${col - start}v1h-${col - start}z`)
    }
  }
  return {size: count + QUIET_ZONE * 2, d: runs.join('')}
}
