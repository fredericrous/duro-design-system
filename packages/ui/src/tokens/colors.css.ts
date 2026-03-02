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
  infoBg: 'rgba(106, 175, 252, 0.1)',
  infoBorder: 'rgba(106, 175, 252, 0.3)',
  infoText: '#93c5fd',
})
