import Svg, {Path} from 'react-native-svg'
import {SIZES_PX} from '@duro-app/tokens/keys'
import {useResolvedColors} from '../ThemeProvider/ThemeProvider'
import type {ChevronProps} from './types'

/** The web's chevron, drawn with react-native-svg in the trigger's resolved colour. */
export function Chevron({color}: ChevronProps) {
  const stroke = useResolvedColors()[color]
  return (
    <Svg width={SIZES_PX.glyphXs} height={SIZES_PX.glyphXs} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
