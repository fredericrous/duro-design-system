export interface PopoverRect {
  top: number
  left: number
  width: number
  height: number
}

export interface PopoverSize {
  width: number
  height: number
}

export type PopoverSide = 'top' | 'bottom'
export type PopoverAlign = 'start' | 'center' | 'end'

interface Input {
  anchor: PopoverRect
  popup: PopoverSize
  viewport: PopoverSize
  side: PopoverSide
  align: PopoverAlign
  offset: number
}

// Pure placement: puts the popup on the requested side of the anchor, flips to
// the opposite side when it would overflow the viewport there (and the other
// side fits), and clamps horizontally into the viewport.
export function computePopoverPosition({anchor, popup, viewport, side, align, offset}: Input) {
  const below = anchor.top + anchor.height + offset
  const above = anchor.top - offset - popup.height
  const fitsBelow = below + popup.height <= viewport.height
  const fitsAbove = above >= 0

  let resolved: PopoverSide = side
  if (side === 'bottom' && !fitsBelow && fitsAbove) resolved = 'top'
  else if (side === 'top' && !fitsAbove && fitsBelow) resolved = 'bottom'

  const top = resolved === 'bottom' ? below : above

  let left = anchor.left
  if (align === 'center') left = anchor.left + (anchor.width - popup.width) / 2
  else if (align === 'end') left = anchor.left + anchor.width - popup.width

  const maxLeft = Math.max(0, viewport.width - popup.width)
  left = Math.min(Math.max(0, left), maxLeft)

  return {top, left, side: resolved}
}
