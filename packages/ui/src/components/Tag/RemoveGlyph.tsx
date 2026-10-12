import type {RemoveGlyphProps} from './types'

/** The tag's remove cross: 1.5 strokes on a 12 box, drawn in the tag's text colour. */
export function RemoveGlyph({size}: RemoveGlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}
