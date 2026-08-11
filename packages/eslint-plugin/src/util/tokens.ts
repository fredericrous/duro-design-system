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
