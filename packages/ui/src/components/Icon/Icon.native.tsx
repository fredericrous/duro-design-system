import {createElement} from 'react'
import Svg, {Circle, Ellipse, Line, Path, Polygon, Polyline, Rect} from 'react-native-svg'
import {ICON_SIZES, type ColorToken} from '@duro-app/tokens/keys'
import {useResolvedColors} from '../ThemeProvider/ThemeProvider'
import {GLYPHS, type Paint, type Shape} from './geometry'
import type {IconProps} from './types'

export type {IconName, IconProps, IconSize} from './types'

const elements = {
  path: Path,
  circle: Circle,
  ellipse: Ellipse,
  line: Line,
  rect: Rect,
  polyline: Polyline,
  polygon: Polygon,
} as const

/** react-native-svg reads `currentColor` from the Svg's `color`, which is a resolved colour here. */
function nativeShape(shape: Shape, key: number) {
  const {tag, ...attrs} = shape
  return createElement(elements[tag] as never, {key, ...attrs})
}

/**
 * Native Icon: the same geometry as the web, drawn with react-native-svg
 * (plan N0, Decision 9; RSD has no `svg`). It cannot inherit a text colour,
 * so its colour is a token resolved through the nearest ThemeProvider. It is
 * decorative: the control that hosts it carries the label.
 */
export function Icon({name, size: sizeToken = 'lg', color = 'text'}: IconProps) {
  const size = ICON_SIZES[sizeToken]
  const glyph = GLYPHS[name]
  const resolved = useResolvedColors()[color as ColorToken]
  const paint: {fill: Paint; stroke?: Paint} =
    glyph.style === 'fill' ? {fill: 'currentColor'} : {fill: 'none', stroke: 'currentColor'}
  return (
    <Svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      color={resolved}
      {...paint}
      strokeWidth={glyph.style === 'stroke' ? 2 : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {glyph.shapes.map(nativeShape)}
    </Svg>
  )
}
