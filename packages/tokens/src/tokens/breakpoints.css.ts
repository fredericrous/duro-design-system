import {css} from 'react-strict-dom'

// Breakpoint scale — the widths at which responsive layouts change.
//
// These use `css.defineConsts` rather than `css.defineVars` because CSS media
// and container queries cannot read custom properties: a query threshold has
// to be a literal. `defineConsts` values are inlined into the query text at
// build time by the StyleX babel plugin (that's their whole reason to exist),
// so `@container (max-width: ${breakpoints.sm})` compiles to a real `640px`.
//
// This module is style-only: `css.defineConsts` throws when the file is
// imported somewhere StyleX isn't compiling it (a hook's `matchMedia`, a
// vitest suite, plain Node). For runtime JS — a matchMedia query, a
// `containerWidth < breakpointsPx.sm` comparison — import `breakpointsPx` from
// `@duro-app/tokens/raw` instead. Values follow the common
// Tailwind-aligned scale; `scripts/check-token-drift.mjs` keeps every copy in step.
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

/**
 * @deprecated Importing this module outside a StyleX-compiled style file
 * throws (see above). Use `breakpointsPx` from `@duro-app/tokens/raw`.
 */
export const breakpointsPx = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

export type Breakpoint = keyof typeof breakpointsPx
