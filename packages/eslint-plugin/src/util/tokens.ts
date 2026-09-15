// Token data mirrored from @duro-app/tokens. The published plugin stays
// dependency-free, so these tables are literals; the drift test in
// test/token-drift.test.ts rebuilds each one from @duro-app/tokens (a
// workspace devDependency) with the same construction and fails on divergence.

/** Barrel specifier → deep-import path, keyed by the *imported* name. */
export const TOKEN_DEEP_PATHS: Record<string, string> = {
  colors: 'tokens/colors.css',
  spacing: 'tokens/spacing.css',
  radii: 'tokens/spacing.css',
  layoutSpacing: 'tokens/layout-spacing.css',
  typography: 'tokens/typography.css',
  typeScale: 'tokens/typography.css',
  typePresets: 'tokens/type-presets.css',
  shadows: 'tokens/shadows.css',
  duration: 'tokens/motion.css',
  easing: 'tokens/motion.css',
  breakpoints: 'tokens/breakpoints.css',
  breakpointsPx: 'tokens/breakpoints.css',
  Breakpoint: 'tokens/breakpoints.css',
  lightTheme: 'themes/light.css',
  lightShadows: 'themes/light.css',
  highContrastTheme: 'themes/high-contrast.css',
  highContrastShadows: 'themes/high-contrast.css',
  SPACING_KEYS: 'keys',
  SPACING_PX: 'keys',
  SpacingToken: 'keys',
  RADIUS_KEYS: 'keys',
  RADII_PX: 'keys',
  RadiusToken: 'keys',
  SHADOW_KEYS: 'keys',
  ShadowToken: 'keys',
  DURATION_MS: 'keys',
  DurationToken: 'keys',
  ICON_SIZES: 'keys',
  IconSize: 'keys',
  BREAKPOINT_KEYS: 'keys',
  BREAKPOINTS_PX: 'keys',
  FONT_SIZE_REM: 'keys',
  FONT_WEIGHTS: 'keys',
  TYPE_SCALE_FONT_SIZE_REM: 'keys',
  SHADOWS: 'keys',
  EASINGS: 'keys',
  ColorToken: 'keys',
  RawColors: 'raw',
  darkColors: 'raw',
  lightColors: 'raw',
  highContrastColors: 'raw',
}

/** px value → spacing token name. */
export const SPACING_TOKENS_BY_PX: Record<number, string> = {
  4: 'xs',
  8: 'sm',
  12: 'ms',
  16: 'md',
  24: 'lg',
  32: 'xl',
  48: 'xxl',
  64: 'xxxl',
}

/** px value → radius token name. */
export const RADII_TOKENS_BY_PX: Record<number, string> = {
  4: 'xs',
  8: 'sm',
  12: 'md',
  16: 'lg',
  9999: 'full',
}

/**
 * Color value (lowercased) → semantic color token name. Built from the dark,
 * light, and high-contrast palettes in that order, first entry wins — so a hex
 * shared across tokens/themes suggests the token it most likely stands for
 * (e.g. #6aaffc is both `accent` and `info` in the dark palette → `accent`).
 */
export const COLOR_TOKENS: Record<string, string> = {
  '#0f0f0f': 'bg',
  '#1a1a1a': 'bgCard',
  '#242424': 'bgCardHover',
  '#e5e5e5': 'text',
  '#b0b0b0': 'textMuted',
  '#6aaffc': 'accent',
  '#93c5fd': 'accentHover',
  '#000000': 'accentContrast',
  '#333333': 'border',
  '#f87171': 'error',
  '#fca5a5': 'errorHover',
  'rgba(248, 113, 113, 0.1)': 'errorBg',
  'rgba(248, 113, 113, 0.3)': 'errorBorder',
  '#22c55e': 'success',
  'rgba(34, 197, 94, 0.1)': 'successBg',
  'rgba(34, 197, 94, 0.3)': 'successBorder',
  '#86efac': 'successText',
  '#fbbf24': 'warning',
  'rgba(251, 191, 36, 0.1)': 'warningBg',
  'rgba(251, 191, 36, 0.3)': 'warningBorder',
  '#fde68a': 'warningText',
  'rgba(106, 175, 252, 0.1)': 'infoBg',
  'rgba(106, 175, 252, 0.3)': 'infoBorder',
  '#ffffff': 'bg',
  '#f5f5f5': 'bgCard',
  '#ebebeb': 'bgCardHover',
  '#4a4a4a': 'textMuted',
  '#1e40af': 'accent',
  '#1a3799': 'accentHover',
  '#d4d4d4': 'border',
  '#991b1b': 'error',
  '#7f1d1d': 'errorHover',
  'rgba(153, 27, 27, 0.08)': 'errorBg',
  'rgba(153, 27, 27, 0.3)': 'errorBorder',
  '#166534': 'success',
  'rgba(22, 101, 52, 0.08)': 'successBg',
  'rgba(22, 101, 52, 0.3)': 'successBorder',
  '#14532d': 'successText',
  '#92400e': 'warning',
  'rgba(146, 64, 14, 0.08)': 'warningBg',
  'rgba(146, 64, 14, 0.3)': 'warningBorder',
  '#78350f': 'warningText',
  'rgba(30, 64, 175, 0.08)': 'infoBg',
  'rgba(30, 64, 175, 0.3)': 'infoBorder',
  '#111111': 'bgCard',
  '#60a5fa': 'accent',
  '#555555': 'border',
  'rgba(248, 113, 113, 0.15)': 'errorBg',
  'rgba(248, 113, 113, 0.5)': 'errorBorder',
  '#4ade80': 'success',
  'rgba(74, 222, 128, 0.15)': 'successBg',
  'rgba(74, 222, 128, 0.5)': 'successBorder',
  '#fcd34d': 'warning',
  'rgba(252, 211, 77, 0.15)': 'warningBg',
  'rgba(252, 211, 77, 0.5)': 'warningBorder',
  '#fef08a': 'warningText',
  'rgba(96, 165, 250, 0.15)': 'infoBg',
  'rgba(96, 165, 250, 0.5)': 'infoBorder',
  '#bfdbfe': 'infoText',
}

/** px value → breakpoint token name (`breakpoints.md` is the '768px' const). */
export const BREAKPOINT_TOKENS_BY_PX: Record<number, string> = {
  480: 'xs',
  640: 'sm',
  768: 'md',
  1024: 'lg',
  1280: 'xl',
}

/**
 * rem value → font-size token. Built from typeScale.fontSize1..9 first, then
 * typography.fontSize* on top — so a size both scales carry suggests the
 * named `typography` token, and only the steps typography lacks (13px, 30px,
 * 36px) fall back to the numbered typeScale one.
 */
export const FONT_SIZE_TOKENS_BY_REM: Record<number, {group: string; token: string}> = {
  0.75: {group: 'typography', token: 'fontSizeXs'},
  0.8125: {group: 'typeScale', token: 'fontSize2'},
  0.875: {group: 'typography', token: 'fontSizeSm'},
  1: {group: 'typography', token: 'fontSizeMd'},
  1.125: {group: 'typography', token: 'fontSizeLg'},
  1.25: {group: 'typography', token: 'fontSizeXl'},
  1.5: {group: 'typography', token: 'fontSizeHeading'},
  1.875: {group: 'typeScale', token: 'fontSize8'},
  2.25: {group: 'typeScale', token: 'fontSize9'},
}

/** numeric weight → typography token. */
export const FONT_WEIGHT_TOKENS: Record<number, string> = {
  400: 'fontWeightNormal',
  500: 'fontWeightMedium',
  600: 'fontWeightSemibold',
  700: 'fontWeightBold',
}

/** Shadow value (base palette, whitespace-normalized) → shadows token. */
export const SHADOW_TOKENS: Record<string, string> = {
  '02px4pxrgba(0,0,0,0.3)': 'sm',
  '04px12pxrgba(0,0,0,0.4)': 'md',
  '08px24pxrgba(0,0,0,0.5)': 'lg',
}

/** ms value → duration token. */
export const DURATION_TOKENS_BY_MS: Record<number, string> = {
  0: 'instant',
  150: 'fast',
  200: 'base',
  280: 'slow',
}

/** Easing value (whitespace-normalized) → easing token. */
export const EASING_TOKENS: Record<string, string> = {
  ease: 'standard',
  'cubic-bezier(0.32,0.72,0,1)': 'easeOut',
  'cubic-bezier(0.72,0,0.68,0.28)': 'easeIn',
}

/** Collapse whitespace so `rgba(0, 0, 0, .3)` and `rgba(0,0,0,.3)` compare equal. */
export function normalizeValue(value: string): string {
  return value.trim().replace(/\s+/g, '')
}

/** COLOR_TOKENS keyed by normalized value, so rgba() entries are reachable. */
export const COLOR_TOKENS_NORMALIZED: Record<string, string> = Object.fromEntries(
  Object.entries(COLOR_TOKENS).map(([value, token]) => [normalizeValue(value), token]),
)

/** Expand #abc / #abcd to the 6/8-digit form, lowercased. */
export function normalizeHex(hex: string): string {
  const lower = hex.toLowerCase()
  const digits = lower.slice(1)
  if (digits.length === 3 || digits.length === 4) {
    return '#' + [...digits].map((d) => d + d).join('')
  }
  return lower
}

/** Style properties whose numeric values map to the spacing scale. */
export const SPACING_PROPERTIES = new Set([
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingBlock',
  'paddingBlockStart',
  'paddingBlockEnd',
  'paddingInline',
  'paddingInlineStart',
  'paddingInlineEnd',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginBlock',
  'marginBlockStart',
  'marginBlockEnd',
  'marginInline',
  'marginInlineStart',
  'marginInlineEnd',
  'gap',
  'rowGap',
  'columnGap',
])

/** Style properties whose numeric values map to the radius scale. */
export const RADII_PROPERTIES = new Set([
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderStartStartRadius',
  'borderStartEndRadius',
  'borderEndStartRadius',
  'borderEndEndRadius',
])
