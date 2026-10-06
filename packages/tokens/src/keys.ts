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

// Mirrors tokens/spacing.css.ts `microSpacing` (px). Not a SpacingToken.
export const MICRO_SPACING_KEYS = ['px1', 'px2', 'px3', 'px5', 'px6'] as const
export type MicroSpacingToken = (typeof MICRO_SPACING_KEYS)[number]
export const MICRO_SPACING_PX = {
  px1: 1,
  px2: 2,
  px3: 3,
  px5: 5,
  px6: 6,
} as const

export const RADIUS_KEYS = ['xs', 'px6', 'sm', 'md', 'lg', 'full'] as const
export type RadiusToken = (typeof RADIUS_KEYS)[number]

// Mirrors tokens/spacing.css.ts `radii` (px).
export const RADII_PX = {
  xs: 4,
  px6: 6,
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
  minimal: 1,
  quick: 120,
  fast: 150,
  brisk: 160,
  base: 200,
  slow: 280,
} as const
export type DurationToken = keyof typeof DURATION_MS

export const SIZE_KEYS = [
  'touchTarget',
  'controlSm',
  'controlMd',
  'controlLg',
  'indicator',
  'indicatorDot',
  'checkMarkW',
  'checkMarkH',
  'switchTrackW',
  'switchTrackH',
  'switchThumb',
  'iconButton',
  'iconButtonSm',
  'spinnerSm',
  'spinnerMd',
  'spinnerLg',
  'glyphXs',
  'glyphSm',
  'glyphMd',
  'iconSm',
  'iconMd',
  'iconLg',
  'iconXl',
  'iconXxl',
  'navMarkerW',
  'navMarkerH',
  'divider',
  'tabIndicator',
  'edgeFade',
  'scrollbar',
  'swatchW',
  'swatchH',
  'labelMinW',
  'popupMinW',
  'listMaxH',
  'listMaxHSm',
  'dialogSm',
  'dialogMd',
  'dialogLg',
  'panelSm',
  'panelMd',
  'panelLg',
  'toastMaxW',
  'gridColSm',
  'gridColMd',
  'pageSm',
  'pageMd',
  'pageLg',
] as const
export type SizeToken = (typeof SIZE_KEYS)[number]

// Mirrors tokens/sizes.css.ts `sizes` (px).
export const SIZES_PX = {
  touchTarget: 44,
  controlSm: 28,
  controlMd: 39,
  controlLg: 40,
  indicator: 18,
  indicatorDot: 8,
  checkMarkW: 5,
  checkMarkH: 9,
  switchTrackW: 36,
  switchTrackH: 20,
  switchThumb: 16,
  iconButton: 32,
  iconButtonSm: 28,
  spinnerSm: 16,
  spinnerMd: 24,
  spinnerLg: 40,
  glyphXs: 10,
  glyphSm: 12,
  glyphMd: 16,
  iconSm: 16,
  iconMd: 18,
  iconLg: 24,
  iconXl: 36,
  iconXxl: 48,
  navMarkerW: 3,
  navMarkerH: 18,
  divider: 1,
  tabIndicator: 2,
  edgeFade: 32,
  scrollbar: 8,
  swatchW: 44,
  swatchH: 34,
  labelMinW: 120,
  popupMinW: 160,
  listMaxH: 280,
  listMaxHSm: 200,
  dialogSm: 400,
  dialogMd: 520,
  dialogLg: 680,
  panelSm: 360,
  panelMd: 480,
  panelLg: 640,
  toastMaxW: 440,
  gridColSm: 240,
  gridColMd: 280,
  pageSm: 600,
  pageMd: 800,
  pageLg: 1200,
} as const

export const BORDER_KEYS = [
  'hairline',
  'strong',
  'accent',
  'focusRing',
  'focusOffset',
  'focusOffsetSm',
] as const
export type BorderToken = (typeof BORDER_KEYS)[number]

// Mirrors tokens/borders.css.ts `borders` (px).
export const BORDERS_PX = {
  hairline: 1,
  strong: 2,
  accent: 3,
  focusRing: 2,
  focusOffset: 2,
  focusOffsetSm: 1,
} as const

// Icon rendering sizes (SVG width/height, px). Not its own css.defineVars
// scale — icons size via attributes — so it is derived from the `sizes` group
// (iconSm…iconXxl), keeping one source.
export const ICON_SIZES = {
  sm: SIZES_PX.iconSm,
  md: SIZES_PX.iconMd,
  lg: SIZES_PX.iconLg,
  xl: SIZES_PX.iconXl,
  xxl: SIZES_PX.iconXxl,
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
  linear: 'linear',
  easeOut: 'cubic-bezier(0.32, 0.72, 0, 1)',
  easeIn: 'cubic-bezier(0.72, 0, 0.68, 0.28)',
} as const

export type ColorToken = keyof RawColors

export type {Breakpoint} from './tokens/breakpoints.css.js'
