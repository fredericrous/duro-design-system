import {css} from 'react-strict-dom'
import {colors} from '../tokens/colors.css'
import {shadows} from '../tokens/shadows.css'

export const highContrastTheme = css.createTheme(colors, {
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

  // Highlight — a non-status accent (a category, an intent); no status meaning.
  highlight: '#d8b4fe',
  highlightBg: 'rgba(216, 180, 254, 0.15)',
  highlightBorder: 'rgba(216, 180, 254, 0.5)',
  highlightText: '#e9d5ff',
  // Fixed overlays — the same in every theme (a scrim darkens whatever is
  // under it; the inverse overlays sit on an accent surface).
  scrim: 'rgba(0, 0, 0, 0.4)',
  inverseFill: 'rgba(0, 0, 0, 0.10)',
  inverseFillHover: 'rgba(0, 0, 0, 0.18)',
  inverseBorder: 'rgba(0, 0, 0, 0.55)',
  inverseBorderHover: 'rgba(0, 0, 0, 0.70)',
  // A light that does not follow the theme (the Switch knob).
  fixedLight: '#ffffff',
  fixedDark: '#000000',
  // A fixed translucent white over content (the light counterpart of scrim).
  overlayLight: 'rgba(255, 255, 255, 0.78)',
  // The opposite tone of the theme: a surface that stands out from the page
  // (toasts, coach marks), with its own text colour. Not the fixed inverse*
  // overlays above, which sit on an accent fill.
  contrastSurface: '#ffffff',
  onContrastSurface: '#000000',
  // A border on contrastSurface, at least 3:1 against it (non-text).
  contrastBorder: 'rgba(0, 0, 0, 0.42)',
})

export const highContrastShadows = css.createTheme(shadows, {
  sm: '0 2px 4px rgba(0, 0, 0, 0.6)',
  md: '0 4px 12px rgba(0, 0, 0, 0.7)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.8)',
  dropReady: 'inset 0 0 0 1px #555555',
  dropOver: 'inset 0 0 0 2px #60a5fa',
})
