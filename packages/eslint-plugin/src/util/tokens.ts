// Token data mirrored from @duro-app/tokens. The published plugin stays
// dependency-free, so these tables are literals; the drift test in
// test/token-drift.test.ts rebuilds each one from @duro-app/tokens (a
// workspace devDependency) with the same construction and fails on divergence.

/** Barrel specifier → deep-import path, keyed by the *imported* name. */
export const TOKEN_DEEP_PATHS: Record<string, string> = {
  colors: 'tokens/colors.css',
  spacing: 'tokens/spacing.css',
  radii: 'tokens/spacing.css',
  microSpacing: 'tokens/spacing.css',
  sizes: 'tokens/sizes.css',
  borders: 'tokens/borders.css',
  layers: 'tokens/layers.css',
  effects: 'tokens/effects.css',
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
  MICRO_SPACING_KEYS: 'keys',
  MICRO_SPACING_PX: 'keys',
  MicroSpacingToken: 'keys',
  RADII_PX: 'keys',
  RadiusToken: 'keys',
  SIZE_KEYS: 'keys',
  SIZES_PX: 'keys',
  SizeToken: 'keys',
  BORDER_KEYS: 'keys',
  BORDERS_PX: 'keys',
  BorderToken: 'keys',
  LAYER_KEYS: 'keys',
  LAYERS: 'keys',
  LayerToken: 'keys',
  EFFECT_KEYS: 'keys',
  EFFECTS: 'keys',
  EffectToken: 'keys',
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

/** px value → micro-spacing token name (off-scale nudges). */
export const MICRO_SPACING_TOKENS_BY_PX: Record<number, string> = {
  1: 'px1',
  2: 'px2',
  3: 'px3',
  5: 'px5',
  6: 'px6',
}

/** px value → radius token name. */
export const RADII_TOKENS_BY_PX: Record<number, string> = {
  4: 'xs',
  6: 'px6',
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
 * `contrastSurface` / `onContrastSurface` are another theme's colours, so they
 * go last (CONTRAST_MIRROR_TOKENS): `#f5f5f5` stays `bgCard`.
 */
/** Colour tokens whose values mirror another theme's; listed after the rest. */
export const CONTRAST_MIRROR_TOKENS = ['contrastSurface', 'onContrastSurface']

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
  '#c084fc': 'highlight',
  'rgba(192, 132, 252, 0.1)': 'highlightBg',
  'rgba(192, 132, 252, 0.3)': 'highlightBorder',
  '#d8b4fe': 'highlightText',
  'rgba(0, 0, 0, 0.4)': 'scrim',
  'rgba(0, 0, 0, 0.10)': 'inverseFill',
  'rgba(0, 0, 0, 0.18)': 'inverseFillHover',
  'rgba(0, 0, 0, 0.55)': 'inverseBorder',
  'rgba(0, 0, 0, 0.70)': 'inverseBorderHover',
  '#ffffff': 'fixedLight',
  'rgba(255, 255, 255, 0.78)': 'overlayLight',
  'rgba(0, 0, 0, 0.42)': 'contrastBorder',
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
  '#6b21a8': 'highlight',
  'rgba(107, 33, 168, 0.08)': 'highlightBg',
  'rgba(107, 33, 168, 0.3)': 'highlightBorder',
  '#581c87': 'highlightText',
  'rgba(255, 255, 255, 0.33)': 'contrastBorder',
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
  'rgba(216, 180, 254, 0.15)': 'highlightBg',
  'rgba(216, 180, 254, 0.5)': 'highlightBorder',
  '#e9d5ff': 'highlightText',
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
  'inset0001px#333333': 'dropReady',
  'inset0002px#6aaffc': 'dropOver',
}

/** ms value → duration token. */
export const DURATION_TOKENS_BY_MS: Record<number, string> = {
  0: 'instant',
  1: 'minimal',
  120: 'quick',
  150: 'fast',
  160: 'brisk',
  200: 'base',
  280: 'slow',
}

/** Easing value (whitespace-normalized) → easing token. */
export const EASING_TOKENS: Record<string, string> = {
  ease: 'standard',
  linear: 'linear',
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

/** Style properties whose lengths map to the sizes scale. */
export const SIZE_PROPERTIES = new Set([
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'flexBasis',
  'blockSize',
  'inlineSize',
  'minBlockSize',
  'maxBlockSize',
  'minInlineSize',
  'maxInlineSize',
])

/** Longhands holding a border width, an outline width or an outline offset. */
export const BORDER_WIDTH_PROPERTIES = new Set([
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderBlockWidth',
  'borderInlineWidth',
  'borderBlockStartWidth',
  'borderBlockEndWidth',
  'borderInlineStartWidth',
  'borderInlineEndWidth',
  'outlineWidth',
  'outlineOffset',
])

/** Shorthands whose string value carries a width (`1px solid red`). */
export const BORDER_SHORTHAND_PROPERTIES = new Set([
  'border',
  'borderTop',
  'borderRight',
  'borderBottom',
  'borderLeft',
  'borderBlock',
  'borderInline',
  'borderBlockStart',
  'borderBlockEnd',
  'borderInlineStart',
  'borderInlineEnd',
  'outline',
])

/**
 * px value → every sizes token at that value, in key order. A list, because
 * several tokens share a value (44, 28, 40, 18, 8, 36, 16, 24, 96, 160, 200,
 * 240, 280, 320, 480).
 */
export const SIZE_TOKENS_BY_PX: Record<number, string[]> = {
  44: ['touchTarget', 'swatchW'],
  28: ['controlSm', 'iconButtonSm'],
  39: ['controlMd'],
  40: ['controlLg', 'spinnerLg', 'readoutW'],
  18: ['indicator', 'iconMd', 'navMarkerH'],
  8: ['indicatorDot', 'scrollbar'],
  5: ['checkMarkW'],
  9: ['checkMarkH'],
  36: ['switchTrackW', 'iconXl', 'toolbarH'],
  20: ['switchTrackH', 'colorSwatch'],
  16: ['switchThumb', 'spinnerSm', 'glyphMd', 'iconSm', 'handle'],
  32: ['iconButton', 'edgeFade'],
  24: ['spinnerMd', 'iconLg', 'chip'],
  10: ['glyphXs'],
  12: ['glyphSm', 'colorTrackH'],
  48: ['iconXxl'],
  3: ['navMarkerW'],
  1: ['divider'],
  2: ['tabIndicator'],
  34: ['swatchH'],
  120: ['labelMinW'],
  160: ['popupMinW', 'fieldMinW', 'editorMinH'],
  280: ['listMaxH', 'gridColMd', 'popupMaxW'],
  200: ['listMaxHSm', 'gridColXs'],
  400: ['dialogSm'],
  520: ['dialogMd'],
  680: ['dialogLg'],
  360: ['panelSm'],
  480: ['panelMd', 'pageXs', 'canvasMinH'],
  640: ['panelLg'],
  440: ['toastMaxW'],
  240: ['gridColSm', 'sidebarW', 'popoverWSm'],
  600: ['pageSm'],
  800: ['pageMd'],
  1200: ['pageLg'],
  1440: ['pageXl'],
  320: ['asideW', 'popoverW', 'previewMaxH'],
  80: ['fieldMinWSm', 'placeholderMinH'],
  6: ['meterH'],
  96: ['skeletonChipW', 'sliderW', 'paletteMinW', 'deviceBarW'],
  128: ['dropZoneMinH'],
  550: ['embedW'],
  196: ['colorPickerW'],
  150: ['colorAreaH'],
  22: ['colorPreviewH'],
  4: ['barH'],
  64: ['timeGutterW'],
  46: ['dayHeaderH'],
}

/** px value → every borders token at that value, in key order. */
export const BORDER_TOKENS_BY_PX: Record<number, string[]> = {
  1: ['hairline', 'focusOffsetSm'],
  2: ['strong', 'focusRing', 'focusOffset'],
  3: ['accent'],
}

/** Borders tokens a width longhand (or the width in a border shorthand) may use. */
export const BORDER_WIDTH_TOKENS = ['hairline', 'strong', 'accent']
/** Borders tokens `outlineWidth` (or the width in `outline`) may use. */
export const OUTLINE_WIDTH_TOKENS = ['focusRing']
/** Borders tokens `outlineOffset` may use. */
export const OUTLINE_OFFSET_TOKENS = ['focusOffset', 'focusOffsetSm']

/** z-index value → layers token (unitless). */
export const LAYERS_BY_VALUE: Record<number, string> = {
  1: 'raised',
  50: 'floating',
  60: 'floatingRaised',
  1000: 'overlay',
  1001: 'modal',
  1002: 'modalRaised',
  1040: 'popover',
  1041: 'popoverRaised',
  1049: 'popupBackdrop',
  1050: 'popup',
  1060: 'toast',
  1100: 'portal',
}

/** Effect value (whitespace-normalized) → effects token. */
export const EFFECTS_BY_VALUE: Record<string, string> = {
  'blur(2px)': 'overlayBlur',
  'blur(6px)': 'surfaceBlur',
}
