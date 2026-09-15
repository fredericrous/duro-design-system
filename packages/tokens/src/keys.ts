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

// Mirrors tokens/breakpoints.css.ts `breakpoints` (css.defineConsts), as
// numbers. The css.ts file also exports `breakpointsPx`, but importing it
// pulls react-strict-dom; tooling that only needs the numbers reads here.
export const BREAKPOINT_KEYS = ['xs', 'sm', 'md', 'lg', 'xl'] as const
export const BREAKPOINTS_PX = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

// Mirrors tokens/typography.css.ts `typography` font sizes, in rem.
export const FONT_SIZE_REM = {
  fontSizeXs: 0.75,
  fontSizeSm: 0.875,
  fontSizeMd: 1,
  fontSizeLg: 1.125,
  fontSizeXl: 1.25,
  fontSizeHeading: 1.5,
} as const

// Mirrors tokens/typography.css.ts `typography` font weights, as numbers.
export const FONT_WEIGHTS = {
  fontWeightNormal: 400,
  fontWeightMedium: 500,
  fontWeightSemibold: 600,
  fontWeightBold: 700,
} as const

// Mirrors tokens/typography.css.ts `typeScale` fontSize1..9, in rem.
export const TYPE_SCALE_FONT_SIZE_REM = {
  fontSize1: 0.75,
  fontSize2: 0.8125,
  fontSize3: 0.875,
  fontSize4: 1,
  fontSize5: 1.125,
  fontSize6: 1.25,
  fontSize7: 1.5,
  fontSize8: 1.875,
  fontSize9: 2.25,
} as const

// Mirrors tokens/shadows.css.ts `shadows` (the base, dark palette) verbatim.
export const SHADOWS = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
  md: '0 4px 12px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
} as const

// Mirrors tokens/motion.css.ts `easing` verbatim.
export const EASINGS = {
  standard: 'ease',
  easeOut: 'cubic-bezier(0.32, 0.72, 0, 1)',
  easeIn: 'cubic-bezier(0.72, 0, 0.68, 0.28)',
} as const

export type ColorToken = keyof RawColors

export type {Breakpoint} from './tokens/breakpoints.css.js'
