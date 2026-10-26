import {css} from 'react-strict-dom'
import {colors} from '../tokens/colors.css'
import {shadows} from '../tokens/shadows.css'

export const lightTheme = css.createTheme(colors, {
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

  // Highlight — a non-status accent (a category, an intent); no status meaning.
  highlight: '#6b21a8',
  highlightBg: 'rgba(107, 33, 168, 0.08)',
  highlightBorder: 'rgba(107, 33, 168, 0.3)',
  highlightText: '#581c87',

  // Category hues — non-status colours that tell categories apart (an icon tile, a tag); never a state.
  categoryBlue: '#007AFF',
  categoryGreen: '#34C759',
  categoryOrange: '#FF9500',
  categoryYellow: '#FFCC00',
  categoryRed: '#FF3B30',
  categoryIndigo: '#5856D6',
  categoryPurple: '#AF52DE',

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
  contrastSurface: '#1a1a1a',
  onContrastSurface: '#e5e5e5',
  // A border on contrastSurface, at least 3:1 against it (non-text).
  contrastBorder: 'rgba(255, 255, 255, 0.33)',
  bgInset: '#f0f0f0',
  bgElevated: '#ffffff',
  bgSelected: 'rgba(30, 64, 175, 0.12)',
  pressOverlay: 'rgba(0, 0, 0, 0.08)',
  ripple: 'rgba(0, 0, 0, 0.12)',
  bgSectionTint: 'rgba(0, 0, 0, 0.03)',
  borderSubtle: '#ebebeb',
  borderStrong: '#a3a3a3',
  surfaceHighlight: 'rgba(255, 255, 255, 0.7)',
  textSubtle: '#6b6b6b',
  textDisabled: '#a3a3a3',
  neutral: '#525252',
  neutralBg: 'rgba(82, 82, 82, 0.08)',
  neutralBorder: 'rgba(82, 82, 82, 0.3)',
  neutralText: '#404040',
  active: '#1e40af',
  activeBg: 'rgba(30, 64, 175, 0.08)',
  activeBorder: 'rgba(30, 64, 175, 0.3)',
  activeText: '#1e40af',
  accentDisabled: 'rgba(30, 64, 175, 0.4)',
  segmentTrack: 'rgba(0, 0, 0, 0.06)',
  segmentActive: '#ffffff',
  scrimSoft: 'rgba(0, 0, 0, 0.2)',
  scrimStrong: 'rgba(0, 0, 0, 0.6)',
  onScrimMuted: 'rgba(255, 255, 255, 0.72)',
})

export const lightShadows = css.createTheme(shadows, {
  sm: '0 2px 4px rgba(0, 0, 0, 0.08)',
  md: '0 4px 12px rgba(0, 0, 0, 0.12)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.16)',
  dropReady: 'inset 0 0 0 1px #d4d4d4',
  dropOver: 'inset 0 0 0 2px #1e40af',
})
