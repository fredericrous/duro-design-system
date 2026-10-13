import {useMemo} from 'react'
import {html} from 'react-strict-dom'
import Svg, {Path} from 'react-native-svg'
import {useResolvedColors} from '../ThemeProvider/ThemeProvider'
import {qrGeometry} from './geometry'
import {styles} from './styles.css'
import type {QrCodeProps} from './types'

export type {QrCodeProps} from './types'

/**
 * Native QrCode: the web's path, drawn with react-native-svg (RSD has no `svg`). The colour is the
 * fixed dark token resolved through the nearest ThemeProvider, as the native Icon resolves its own.
 */
export function QrCode({value, label}: QrCodeProps) {
  const {size, d} = useMemo(() => qrGeometry(value), [value])
  const dark = useResolvedColors().fixedDark
  return (
    <html.div role="img" aria-label={label} style={styles.frame}>
      <Svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        height="100%"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Path d={d} fill={dark} />
      </Svg>
    </html.div>
  )
}
