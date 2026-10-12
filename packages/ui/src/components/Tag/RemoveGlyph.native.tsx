import Svg, {Path} from 'react-native-svg'
import {useResolvedColors} from '../ThemeProvider/ThemeProvider'
import type {RemoveGlyphProps} from './types'

/**
 * The same cross as the web's, drawn with react-native-svg (the native icon
 * renderer, plan N0 Decision 9) in the tag's resolved text colour: a raw
 * host has no CSS `currentColor` to inherit.
 */
export function RemoveGlyph({size, color}: RemoveGlyphProps) {
  const stroke = useResolvedColors()[color]
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <Path d="M3 3l6 6M9 3l-6 6" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  )
}
