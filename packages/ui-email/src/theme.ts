import {
  darkColors,
  FONT_SIZE_REM,
  lightColors,
  RADII_PX,
  SPACING_PX,
  type RawColors,
} from '@duro-app/tokens/raw'

// ---------------------------------------------------------------------------
// Spacing / radius / type
//
// Email needs literal px values (clients reset the root font-size, so rem is
// unsafe, and they cannot read CSS variables) and table-friendly units. Every
// value below is computed from the @duro-app/tokens raw maps, so a measure
// still comes from its token (ADR-0027); only the unit is resolved here.
// ---------------------------------------------------------------------------

const px = <N extends number>(n: N) => `${n}px` as `${N}px`

// Type sizes are rem tokens; email resolves them against a fixed root size.
const REM_PX = 16
const remPx = (rem: number) => px(rem * REM_PX)

export const space = {
  xs: px(SPACING_PX.xs),
  sm: px(SPACING_PX.sm),
  ms: px(SPACING_PX.ms),
  md: px(SPACING_PX.md),
  lg: px(SPACING_PX.lg),
  xl: px(SPACING_PX.xl),
  xxl: px(SPACING_PX.xxl),
  xxxl: px(SPACING_PX.xxxl),
} as const

export const radius = {
  sm: px(RADII_PX.sm),
  md: px(RADII_PX.md),
  lg: px(RADII_PX.lg),
} as const

export const font = {
  family:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  // FONT_SIZE_REM resolved against the fixed REM_PX root.
  sizeXs: remPx(FONT_SIZE_REM.fontSizeXs),
  sizeSm: remPx(FONT_SIZE_REM.fontSizeSm),
  sizeMd: remPx(FONT_SIZE_REM.fontSizeMd),
  sizeLg: remPx(FONT_SIZE_REM.fontSizeLg),
  sizeXl: remPx(FONT_SIZE_REM.fontSizeXl),
  sizeHeading: remPx(FONT_SIZE_REM.fontSizeHeading),
  weightNormal: 400,
  weightMedium: 500,
  weightSemibold: 600,
  weightBold: 700,
  lineHeight: 1.5,
} as const

// ---------------------------------------------------------------------------
// Semantic colour roles, derived from the shared token palettes
// ---------------------------------------------------------------------------

export interface EmailRoles {
  bg: string
  card: string
  cardBorder: string
  text: string
  textMuted: string
  heading: string
  accent: string
  accentText: string
  border: string
}

const roles = (c: RawColors): EmailRoles => ({
  bg: c.bg,
  card: c.bgCard,
  cardBorder: c.border,
  text: c.text,
  textMuted: c.textMuted,
  heading: c.text,
  accent: c.accent,
  accentText: c.accentContrast,
  border: c.border,
})

export const palette = {
  light: roles(lightColors),
  dark: roles(darkColors),
} as const

// ---------------------------------------------------------------------------
// Dark-mode mechanism
//
// Stable classNames that the dark <style> block targets. Inline (light) styles
// are the base; the @media (prefers-color-scheme: dark) rules override them.
// NB: inline styles beat <style> rules, so every override MUST use !important.
// Honoured by Apple Mail (iOS/macOS); Gmail/Outlook apply their own dark
// transform regardless; every other client falls back to the light base.
// ---------------------------------------------------------------------------

export const cls = {
  body: 'd-body',
  card: 'd-card',
  text: 'd-text',
  textMuted: 'd-text-muted',
  heading: 'd-heading',
  button: 'd-btn',
  hr: 'd-hr',
  link: 'd-link',
} as const

const ruleLines = (prefix: string): string[] => {
  const d = palette.dark
  const p = prefix ? `${prefix} ` : ''
  return [
    `${p}.${cls.body} { background-color: ${d.bg} !important; }`,
    `${p}.${cls.card} { background-color: ${d.card} !important; border-color: ${d.cardBorder} !important; }`,
    `${p}.${cls.text} { color: ${d.text} !important; }`,
    `${p}.${cls.textMuted} { color: ${d.textMuted} !important; }`,
    `${p}.${cls.heading} { color: ${d.heading} !important; }`,
    `${p}.${cls.button} { background-color: ${d.accent} !important; color: ${d.accentText} !important; }`,
    `${p}.${cls.hr} { border-color: ${d.border} !important; }`,
    `${p}.${cls.link} { color: ${d.accent} !important; }`,
  ]
}

export const darkModeCss = [
  '@media (prefers-color-scheme: dark) {',
  ...ruleLines('').map((l) => '  ' + l),
  '}',
  '/* Outlook.com / Outlook mobile dark mode */',
  ...ruleLines('[data-ogsc]'),
].join('\n')
