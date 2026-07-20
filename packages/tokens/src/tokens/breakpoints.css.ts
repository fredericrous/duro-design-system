import {css} from 'react-strict-dom'

// Breakpoint scale — the widths at which responsive layouts change.
//
// These use `css.defineConsts` rather than `css.defineVars` because CSS media
// and container queries cannot read custom properties: a query threshold has
// to be a literal. `defineConsts` values are inlined into the query text at
// build time by the StyleX babel plugin (that's their whole reason to exist),
// so `@container (max-width: ${breakpoints.sm})` compiles to a real `640px`.
//
// For runtime JS comparisons (`containerWidth < breakpointsPx.sm`) use the
// plain-number mirror below — defineConsts values are query strings, not
// numbers. Keep the two in sync. Values follow the common Tailwind-aligned scale.
export const breakpoints = css.defineConsts({
  /** Phones — dense tables card up below here. */
  xs: '480px',
  /** Large phone / small tablet. The default "go to the mobile layout" line. */
  sm: '640px',
  /** Tablet portrait. */
  md: '768px',
  /** Tablet landscape / small laptop. */
  lg: '1024px',
  /** Desktop. */
  xl: '1280px',
})

export const breakpointsPx = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

export type Breakpoint = keyof typeof breakpointsPx
