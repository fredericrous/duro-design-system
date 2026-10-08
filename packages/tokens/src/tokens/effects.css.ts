import {css} from 'react-strict-dom'

// Visual effects. Not themed.
//
// overlayBlur: the blur behind a modal's backdrop (a command palette, a
// lightbox). Apply it ONLY on the backdrop element itself: a backdropFilter
// (or filter) on an ancestor becomes the containing block for every fixed
// descendant, so a Dialog or Drawer opened inside it is positioned against
// that ancestor instead of the viewport.
//
// surfaceBlur: a frosted surface over imagery (a pill or a chip on a photo).
// The same warning holds: put it ONLY on that surface element itself, never on
// a wrapper that holds a Dialog, a Drawer or any fixed descendant.
export const effects = css.defineVars({
  overlayBlur: 'blur(2px)',
  surfaceBlur: 'blur(6px)',
})
