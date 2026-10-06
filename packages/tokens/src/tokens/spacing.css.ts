import {css} from 'react-strict-dom'

export const spacing = css.defineVars({
  xs: '4px',
  sm: '8px',
  ms: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
})

// Optical micro-steps below and between the spacing scale: a 1-6px nudge that
// aligns a glyph or tightens a dense control. Not a layout choice, so not part
// of SpacingToken (no `gap="px2"`); prefer the scale.
export const microSpacing = css.defineVars({
  px1: '1px',
  px2: '2px',
  px3: '3px',
  px5: '5px',
  px6: '6px',
})

export const radii = css.defineVars({
  xs: '4px',
  px6: '6px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  full: '9999px',
})
