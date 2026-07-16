import {css} from 'react-strict-dom'

/**
 * Motion timing tokens.
 *
 * Values are harvested from what the system already uses — nothing invented:
 * - durations: 150ms is the de-facto transition (Button, Card, and ~30 other
 *   spots), 200ms the common overlay enter (Drawer), 280ms the larger panel
 *   enter (DetailPanel). `instant` is for explicit no-motion.
 * - easings: `standard` is the default `ease` used throughout; `easeOut` /
 *   `easeIn` are the "Apple ease" curves already defined for DetailPanel.
 *
 * Reduced motion is handled globally (the `@media (prefers-reduced-motion)`
 * rule in the reset neutralizes timing) plus per-component transform guards, so
 * these stay as plain timing values.
 */
export const duration = css.defineVars({
  instant: '0ms',
  fast: '150ms',
  base: '200ms',
  slow: '280ms',
})

export const easing = css.defineVars({
  standard: 'ease',
  easeOut: 'cubic-bezier(0.32, 0.72, 0, 1)',
  easeIn: 'cubic-bezier(0.72, 0, 0.68, 0.28)',
})
