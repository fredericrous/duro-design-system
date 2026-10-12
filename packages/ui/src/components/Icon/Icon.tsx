import {createElement} from 'react'
import {ICON_SIZES} from '@duro-app/tokens/keys'
import {colors} from '@duro-app/tokens/tokens/colors.css'

import {GLYPHS, type Shape} from './geometry'
import type {IconProps} from './types'

export type {IconName, IconProps, IconSize} from './types'

/** One geometry shape as the SVG element it was drawn as before 5.12. */
function svgShape(shape: Shape, key: number) {
  const {tag, ...attrs} = shape
  return createElement(tag, {key, ...attrs})
}

export function Icon({name, size: sizeToken = 'lg', color}: IconProps) {
  const size = ICON_SIZES[sizeToken]
  const glyph = GLYPHS[name]
  const shapes = glyph.shapes.map(svgShape)
  const style = color ? {color: colors[color]} : undefined
  if (glyph.style === 'fill') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} style={style}>
        {shapes}
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={style}
    >
      {shapes}
    </svg>
  )
}
