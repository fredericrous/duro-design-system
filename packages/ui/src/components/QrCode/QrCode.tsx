import {useMemo} from 'react'
import {html} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {qrGeometry} from './geometry'
import {resolveLength} from '../../shared/length'
import {styles} from './styles.css'
import type {QrCodeProps} from './types'

export type {QrCodeProps} from './types'

/**
 * A QR code for another device to scan: one SVG path of the dark modules, drawn as an image with
 * a label. Native draws the same path with react-native-svg (QrCode.native.tsx).
 */
export function QrCode({value, label, size: maxSize}: QrCodeProps) {
  const {size, d} = useMemo(() => qrGeometry(value), [value])
  return (
    <html.div
      role="img"
      aria-label={label}
      style={[styles.frame, maxSize != null && styles.sized(resolveLength(maxSize))]}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        height="100%"
        fill="currentColor"
        style={{color: colors.fixedDark, display: 'block'}}
        aria-hidden="true"
      >
        <path d={d} />
      </svg>
    </html.div>
  )
}
