import {SIZES_PX} from '@duro-app/tokens/keys'
import type {ChevronProps} from './types'

/** The group disclosure's chevron, drawn in the trigger's text colour. */
export function Chevron(_props: ChevronProps) {
  return (
    <svg
      width={SIZES_PX.glyphXs}
      height={SIZES_PX.glyphXs}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}
