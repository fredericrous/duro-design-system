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
}

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
}
