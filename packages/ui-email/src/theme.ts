import {darkColors, lightColors, type RawColors} from '@duro-app/tokens/raw'

// ---------------------------------------------------------------------------
// Spacing / radius / type
//
// Email needs literal px values (clients reset the root font-size, so rem is
// unsafe) and table-friendly units. These mirror @duro-app/tokens (spacing /
// type scale) converted to px. Colours, by contrast, are imported live from
// the tokens package below so the brand palette can never drift.
// ---------------------------------------------------------------------------

export const space = {
  xs: '4px',
  sm: '8px',
  ms: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
} as const

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
} as const

export const font = {
  family:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  // rem → px (1rem = 16px): xs .75 / sm .875 / md 1 / lg 1.125 / xl 1.25 / heading 1.5
  sizeXs: '12px',
  sizeSm: '14px',
  sizeMd: '16px',
  sizeLg: '18px',
  sizeXl: '20px',
  sizeHeading: '24px',
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
