import {css} from 'react-strict-dom'

/**
 * Motion timing tokens.
 *
 * Durations are **reduced-motion-aware at the token level**: under
 * `prefers-reduced-motion: reduce` they collapse to `0ms`, so any component that
 * references them for a `transitionDuration` / `animationDuration` honors the
 * user's setting automatically — no per-component media guard required.
 */
export const duration = css.defineVars({
  instant: '0ms',
  fast: {
    default: '120ms',
    '@media (prefers-reduced-motion: reduce)': '0ms',
  },
  base: {
    default: '200ms',
    '@media (prefers-reduced-motion: reduce)': '0ms',
  },
  slow: {
    default: '320ms',
    '@media (prefers-reduced-motion: reduce)': '0ms',
  },
})

/**
 * Easing curves. `standard` for most enter/exit and state changes, `emphasized`
 * for larger or more expressive movement, `exit` for elements leaving.
 */
export const easing = css.defineVars({
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
})
