import {css} from 'react-strict-dom'

export const colors = css.defineVars({
  // Backgrounds
  bg: '#0f0f0f',
  bgCard: '#1a1a1a',
  bgCardHover: '#242424',

  // Text
  text: '#e5e5e5',
  textMuted: '#b0b0b0',

  // Accent
  accent: '#6aaffc',
  accentHover: '#93c5fd',
  accentContrast: '#000000',

  // Border
  border: '#333333',

  // Semantic — Error
  error: '#f87171',
  errorHover: '#fca5a5',
  errorBg: 'rgba(248, 113, 113, 0.1)',
  errorBorder: 'rgba(248, 113, 113, 0.3)',
  errorText: '#fca5a5',
  errorContrast: '#000000',

  // Semantic — Success
  success: '#22c55e',
  successBg: 'rgba(34, 197, 94, 0.1)',
  successBorder: 'rgba(34, 197, 94, 0.3)',
  successText: '#86efac',

  // Semantic — Warning
  warning: '#fbbf24',
  warningBg: 'rgba(251, 191, 36, 0.1)',
  warningBorder: 'rgba(251, 191, 36, 0.3)',
  warningText: '#fde68a',

  // Semantic — Info (uses accent)
  info: '#6aaffc',
  infoBg: 'rgba(106, 175, 252, 0.1)',
  infoBorder: 'rgba(106, 175, 252, 0.3)',
  infoText: '#93c5fd',

  // Highlight — a non-status accent (a category, an intent); no status meaning.
  highlight: '#c084fc',
  highlightBg: 'rgba(192, 132, 252, 0.1)',
  highlightBorder: 'rgba(192, 132, 252, 0.3)',
  highlightText: '#d8b4fe',

  // Fixed overlays — the same in every theme (a scrim darkens whatever is
  // under it; the inverse overlays sit on an accent surface).
  scrim: 'rgba(0, 0, 0, 0.4)',
  inverseFill: 'rgba(0, 0, 0, 0.10)',
  inverseFillHover: 'rgba(0, 0, 0, 0.18)',
  inverseBorder: 'rgba(0, 0, 0, 0.55)',
  inverseBorderHover: 'rgba(0, 0, 0, 0.70)',
  // A light that does not follow the theme (the Switch knob).
  fixedLight: '#ffffff',
  // A fixed translucent white over content (the light counterpart of scrim).
  overlayLight: 'rgba(255, 255, 255, 0.78)',
  // The opposite tone of the theme: a surface that stands out from the page
  // (toasts, coach marks), with its own text colour. Not the fixed inverse*
  // overlays above, which sit on an accent fill.
  contrastSurface: '#f5f5f5',
  onContrastSurface: '#1a1a1a',
  // A border on contrastSurface, at least 3:1 against it (non-text).
  contrastBorder: 'rgba(0, 0, 0, 0.42)',
})
