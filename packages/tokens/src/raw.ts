// Plain hex values for non-`react-strict-dom` consumers (e.g. an MUI
// `createTheme` palette). These mirror the literals defined in
// `tokens/colors.css.ts`, `themes/light.css.ts`, and `themes/high-contrast.css.ts`.
//
// We can't make the css.ts files import from here: StyleX (the babel plugin
// behind RSD's `css.defineVars` / `css.createTheme` on web) requires the
// argument to be an inline object literal. So values live in two places.
//
// `scripts/check-token-drift.mjs` runs in `prebuild` and fails the build if
// the literal in any css.ts file diverges from the corresponding export here.

export type RawColors = {
  bg: string
  bgCard: string
  bgCardHover: string
  text: string
  textMuted: string
  accent: string
  accentHover: string
  accentContrast: string
  border: string
  error: string
  errorHover: string
  errorBg: string
  errorBorder: string
  errorText: string
  errorContrast: string
  success: string
  successBg: string
  successBorder: string
  successText: string
  warning: string
  warningBg: string
  warningBorder: string
  warningText: string
  info: string
  infoBg: string
  infoBorder: string
  infoText: string
  highlight: string
  highlightBg: string
  highlightBorder: string
  highlightText: string
  scrim: string
  inverseFill: string
  inverseFillHover: string
  inverseBorder: string
  inverseBorderHover: string
  fixedLight: string
  overlayLight: string
  contrastSurface: string
  onContrastSurface: string
  contrastBorder: string
}

// Numeric maps for consumers that load only the compiled `/raw` entry (e.g.
// ui-email, which cannot read CSS variables or the TypeScript `/keys` source).
// Copies of the keys.ts maps; check-token-drift.mjs fails if they diverge.
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

export const RADII_PX = {
  xs: 4,
  px6: 6,
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const

export const FONT_SIZE_REM = {
  fontSizeXs: 0.75,
  fontSizeSm: 0.875,
  fontSizeMd: 1,
  fontSizeLg: 1.125,
  fontSizeXl: 1.25,
  fontSizeHeading: 1.5,
} as const

export const BORDERS_PX = {
  hairline: 1,
  strong: 2,
  accent: 3,
  focusRing: 2,
  focusOffset: 2,
  focusOffsetSm: 1,
} as const

export const LAYERS = {
  raised: 1,
  floating: 50,
  floatingRaised: 60,
  overlay: 1000,
  modal: 1001,
  modalRaised: 1002,
  popover: 1040,
  popoverRaised: 1041,
  popupBackdrop: 1049,
  popup: 1050,
  toast: 1060,
  portal: 1100,
} as const

// Copy of keys.ts EFFECTS (CSS filter strings, not a numeric map).
export const EFFECTS = {
  overlayBlur: 'blur(2px)',
  surfaceBlur: 'blur(6px)',
} as const

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
  sidebarW: 240,
  pageXs: 480,
  pageXl: 1440,
  asideW: 320,
  gridColXs: 200,
  fieldMinWSm: 80,
  fieldMinW: 160,
  popoverWSm: 240,
  popoverW: 320,
  popupMaxW: 280,
  meterH: 6,
  skeletonChipW: 96,
  dropZoneMinH: 128,
  canvasMinH: 480,
  editorMinH: 160,
  toolbarH: 36,
  embedW: 550,
  colorPickerW: 196,
  colorAreaH: 150,
  colorTrackH: 12,
  colorSwatch: 20,
  colorPreviewH: 22,
  handle: 16,
  chip: 24,
  placeholderMinH: 80,
  previewMaxH: 320,
  barH: 4,
  readoutW: 40,
  sliderW: 96,
  paletteMinW: 96,
  deviceBarW: 96,
  timeGutterW: 64,
  dayHeaderH: 46,
  timelineLabelW: 180,
  appBarH: 61,
  dragThumbW: 132,
  dragThumbH: 99,
} as const

// Email-only measures: no CSS variable (mail clients cannot read them) and not
// a lint candidate, so it is deliberately absent from keys.ts.
export const EMAIL_PX = {emailCardW: 520, trackingPixel: 1} as const

// Dark theme — matches the defaults in `tokens/colors.css.ts`.
export const darkColors: RawColors = {
  bg: '#0f0f0f',
  bgCard: '#1a1a1a',
  bgCardHover: '#242424',
  text: '#e5e5e5',
  textMuted: '#b0b0b0',
  accent: '#6aaffc',
  accentHover: '#93c5fd',
  accentContrast: '#000000',
  border: '#333333',
  error: '#f87171',
  errorHover: '#fca5a5',
  errorBg: 'rgba(248, 113, 113, 0.1)',
  errorBorder: 'rgba(248, 113, 113, 0.3)',
  errorText: '#fca5a5',
  errorContrast: '#000000',
  success: '#22c55e',
  successBg: 'rgba(34, 197, 94, 0.1)',
  successBorder: 'rgba(34, 197, 94, 0.3)',
  successText: '#86efac',
  warning: '#fbbf24',
  warningBg: 'rgba(251, 191, 36, 0.1)',
  warningBorder: 'rgba(251, 191, 36, 0.3)',
  warningText: '#fde68a',
  info: '#6aaffc',
  infoBg: 'rgba(106, 175, 252, 0.1)',
  infoBorder: 'rgba(106, 175, 252, 0.3)',
  infoText: '#93c5fd',
  highlight: '#c084fc',
  highlightBg: 'rgba(192, 132, 252, 0.1)',
  highlightBorder: 'rgba(192, 132, 252, 0.3)',
  highlightText: '#d8b4fe',
  scrim: 'rgba(0, 0, 0, 0.4)',
  inverseFill: 'rgba(0, 0, 0, 0.10)',
  inverseFillHover: 'rgba(0, 0, 0, 0.18)',
  inverseBorder: 'rgba(0, 0, 0, 0.55)',
  inverseBorderHover: 'rgba(0, 0, 0, 0.70)',
  fixedLight: '#ffffff',
  overlayLight: 'rgba(255, 255, 255, 0.78)',
  contrastSurface: '#f5f5f5',
  onContrastSurface: '#1a1a1a',
  contrastBorder: 'rgba(0, 0, 0, 0.42)',
}

// Light theme — matches the overrides in `themes/light.css.ts`.
export const lightColors: RawColors = {
  bg: '#ffffff',
  bgCard: '#f5f5f5',
  bgCardHover: '#ebebeb',
  text: '#1a1a1a',
  textMuted: '#4a4a4a',
  accent: '#1e40af',
  accentHover: '#1a3799',
  accentContrast: '#ffffff',
  border: '#d4d4d4',
  error: '#991b1b',
  errorHover: '#7f1d1d',
  errorBg: 'rgba(153, 27, 27, 0.08)',
  errorBorder: 'rgba(153, 27, 27, 0.3)',
  errorText: '#7f1d1d',
  errorContrast: '#ffffff',
  success: '#166534',
  successBg: 'rgba(22, 101, 52, 0.08)',
  successBorder: 'rgba(22, 101, 52, 0.3)',
  successText: '#14532d',
  warning: '#92400e',
  warningBg: 'rgba(146, 64, 14, 0.08)',
  warningBorder: 'rgba(146, 64, 14, 0.3)',
  warningText: '#78350f',
  info: '#1e40af',
  infoBg: 'rgba(30, 64, 175, 0.08)',
  infoBorder: 'rgba(30, 64, 175, 0.3)',
  infoText: '#1e40af',
  highlight: '#6b21a8',
  highlightBg: 'rgba(107, 33, 168, 0.08)',
  highlightBorder: 'rgba(107, 33, 168, 0.3)',
  highlightText: '#581c87',
  scrim: 'rgba(0, 0, 0, 0.4)',
  inverseFill: 'rgba(0, 0, 0, 0.10)',
  inverseFillHover: 'rgba(0, 0, 0, 0.18)',
  inverseBorder: 'rgba(0, 0, 0, 0.55)',
  inverseBorderHover: 'rgba(0, 0, 0, 0.70)',
  fixedLight: '#ffffff',
  overlayLight: 'rgba(255, 255, 255, 0.78)',
  contrastSurface: '#1a1a1a',
  onContrastSurface: '#e5e5e5',
  contrastBorder: 'rgba(255, 255, 255, 0.33)',
}

// High-contrast theme — matches the overrides in `themes/high-contrast.css.ts`.
export const highContrastColors: RawColors = {
  bg: '#000000',
  bgCard: '#111111',
  bgCardHover: '#1a1a1a',
  text: '#ffffff',
  textMuted: '#b0b0b0',
  accent: '#60a5fa',
  accentHover: '#93c5fd',
  accentContrast: '#000000',
  border: '#555555',
  error: '#f87171',
  errorHover: '#fca5a5',
  errorBg: 'rgba(248, 113, 113, 0.15)',
  errorBorder: 'rgba(248, 113, 113, 0.5)',
  errorText: '#fca5a5',
  errorContrast: '#000000',
  success: '#4ade80',
  successBg: 'rgba(74, 222, 128, 0.15)',
  successBorder: 'rgba(74, 222, 128, 0.5)',
  successText: '#86efac',
  warning: '#fcd34d',
  warningBg: 'rgba(252, 211, 77, 0.15)',
  warningBorder: 'rgba(252, 211, 77, 0.5)',
  warningText: '#fef08a',
  info: '#60a5fa',
  infoBg: 'rgba(96, 165, 250, 0.15)',
  infoBorder: 'rgba(96, 165, 250, 0.5)',
  infoText: '#bfdbfe',
  highlight: '#d8b4fe',
  highlightBg: 'rgba(216, 180, 254, 0.15)',
  highlightBorder: 'rgba(216, 180, 254, 0.5)',
  highlightText: '#e9d5ff',
  scrim: 'rgba(0, 0, 0, 0.4)',
  inverseFill: 'rgba(0, 0, 0, 0.10)',
  inverseFillHover: 'rgba(0, 0, 0, 0.18)',
  inverseBorder: 'rgba(0, 0, 0, 0.55)',
  inverseBorderHover: 'rgba(0, 0, 0, 0.70)',
  fixedLight: '#ffffff',
  overlayLight: 'rgba(255, 255, 255, 0.78)',
  contrastSurface: '#ffffff',
  onContrastSurface: '#000000',
  contrastBorder: 'rgba(0, 0, 0, 0.42)',
}
