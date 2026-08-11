// Token key unions and raw numeric values, as plain TypeScript.
//
// The css.ts files can't export these: StyleX requires inline object literals,
// and `css.defineVars` returns an opaque VarGroup whose keyof includes phantom
// members (`__opaqueId`, `__tokens`). So the scales are duplicated here as the
// typed source of truth for component props, Storybook argTypes, and tooling —
// with zero StyleX/react-strict-dom imports, so this module is safe to load in
// Node (tests, scripts, the ESLint plugin's drift test).
//
// `scripts/check-token-drift.mjs` runs in `prebuild` and fails the build if any
// value here diverges from the corresponding css.ts literal.

// Explicit .js extensions: this module is also typechecked under NodeNext
// resolution (the ESLint plugin's tests import it via the `types` condition),
// which rejects extensionless relative imports. Both are type-only, so they
// are erased at build time.
import type {RawColors} from './raw.js'

export const SPACING_KEYS = ['xs', 'sm', 'ms', 'md', 'lg', 'xl', 'xxl', 'xxxl'] as const
export type SpacingToken = (typeof SPACING_KEYS)[number]

// Mirrors tokens/spacing.css.ts `spacing` (px).
export const SPACING_PX = {
  xs: 4,
  sm: 8,
  ms: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const

export const RADIUS_KEYS = ['xs', 'sm', 'md', 'lg', 'full'] as const
export type RadiusToken = (typeof RADIUS_KEYS)[number]

// Mirrors tokens/spacing.css.ts `radii` (px).
export const RADII_PX = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const

export const SHADOW_KEYS = ['sm', 'md', 'lg'] as const
export type ShadowToken = (typeof SHADOW_KEYS)[number]

// Mirrors tokens/motion.css.ts `duration`, as numbers for setTimeout use.
export const DURATION_MS = {
  instant: 0,
  fast: 150,
  base: 200,
  slow: 280,
} as const
export type DurationToken = keyof typeof DURATION_MS

// Icon rendering sizes (SVG width/height, px). Not a css.defineVars scale —
// icons size via attributes, not CSS custom properties.
export const ICON_SIZES = {
  sm: 16,
  md: 18,
  lg: 24,
  xl: 36,
  xxl: 48,
} as const
export type IconSize = keyof typeof ICON_SIZES

export type ColorToken = keyof RawColors

export type {Breakpoint} from './tokens/breakpoints.css.js'
