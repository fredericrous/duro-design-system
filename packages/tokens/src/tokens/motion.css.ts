import {css} from 'react-strict-dom'

/**
 * Motion timing tokens.
 *
 * Values are harvested from what the system already uses — nothing invented:
 * - durations: 150ms is the de-facto transition (Button, Card, and ~30 other
 *   spots), 200ms the common overlay enter (Drawer), 280ms the larger panel
 *   enter (DetailPanel). `instant` is for explicit no-motion.
 *   `quick` (List hover, sort indicator) and `brisk` (Toast enter) are the
 *   two other values components used; `minimal` is the 1ms reduced-motion
 *   duration that still fires animationend.
 * - easings: `standard` is the default `ease` used throughout; `easeOut` /
 *   `easeIn` are the "Apple ease" curves already defined for DetailPanel.
 *   `linear` is the Spinner's constant rotation.
 *
 * Reduced motion is handled globally (the `@media (prefers-reduced-motion)`
 * rule in the reset neutralizes timing) plus per-component transform guards, so
 * these stay as plain timing values.
 */
export const duration = css.defineVars({
  instant: '0ms',
  // Non-zero so animationend still fires under reduced motion.
  minimal: '1ms',
  quick: '120ms',
  fast: '150ms',
  brisk: '160ms',
  base: '200ms',
  slow: '280ms',
})

export const easing = css.defineVars({
  standard: 'ease',
  linear: 'linear',
  easeOut: 'cubic-bezier(0.32, 0.72, 0, 1)',
  easeIn: 'cubic-bezier(0.72, 0, 0.68, 0.28)',
})
