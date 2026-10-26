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

  // Category hues — non-status colours that tell categories apart (an icon tile, a tag); never a state.
  categoryBlue: '#9EB9FF',
  categoryGreen: '#66DC7E',
  categoryOrange: '#E0B65A',
  categoryYellow: '#F1C96A',
  categoryRed: '#EE6E6C',
  categoryIndigo: '#8EA3FF',
  categoryPurple: '#C0A7FF',

  // Fixed overlays — the same in every theme (a scrim darkens whatever is
  // under it; the inverse overlays sit on an accent surface).
  scrim: 'rgba(0, 0, 0, 0.4)',
  inverseFill: 'rgba(0, 0, 0, 0.10)',
  inverseFillHover: 'rgba(0, 0, 0, 0.18)',
  inverseBorder: 'rgba(0, 0, 0, 0.55)',
  inverseBorderHover: 'rgba(0, 0, 0, 0.70)',
  // A light that does not follow the theme (the Switch knob).
  fixedLight: '#ffffff',
  // The fixed black, the same in every theme (video letterbox).
  fixedDark: '#000000',
  // A fixed translucent white over content (the light counterpart of scrim).
  overlayLight: 'rgba(255, 255, 255, 0.78)',
  // The opposite tone of the theme: a surface that stands out from the page
  // (toasts, coach marks), with its own text colour. Not the fixed inverse*
  // overlays above, which sit on an accent fill.
  contrastSurface: '#f5f5f5',
  onContrastSurface: '#1a1a1a',
  // A border on contrastSurface, at least 3:1 against it (non-text).
  contrastBorder: 'rgba(0, 0, 0, 0.42)',
  // Gap tokens (5.14, plan N0 C0 inventory). A recessed well below its surface: code, editor, input-like insets.
  bgInset: '#0a0a0a',
  // A surface lifted above its parent (a selected or floating card).
  bgElevated: '#242424',
  // Selected rows and selectable containers: the accent hue, stronger than activeBg.
  bgSelected: 'rgba(106, 175, 252, 0.15)',
  // Drawn over a pressed surface (not inverseFill, which sits on an accent fill).
  pressOverlay: 'rgba(255, 255, 255, 0.08)',
  // A touch ripple.
  ripple: 'rgba(255, 255, 255, 0.12)',
  // A hair of tint that separates grouped sections.
  bgSectionTint: 'rgba(255, 255, 255, 0.03)',
  // Low-emphasis hairlines, below border.
  borderSubtle: '#242424',
  // Higher-emphasis outlines, above border.
  borderStrong: '#555555',
  // The top-edge highlight on a bounded surface.
  surfaceHighlight: 'rgba(255, 255, 255, 0.06)',
  // The lowest-emphasis readable text, below textMuted (at least 4.5:1 on bg).
  textSubtle: '#8a8a8a',
  // Text of a disabled control (not required to meet contrast).
  textDisabled: '#6b6b6b',
  // A neutral status (inactive, unknown): the status family without a status meaning.
  neutral: '#a3a3a3',
  neutralBg: 'rgba(163, 163, 163, 0.1)',
  neutralBorder: 'rgba(163, 163, 163, 0.3)',
  neutralText: '#d4d4d4',
  // The active choice: chips, toolbar pills, segmented options (the accent family).
  active: '#6aaffc',
  activeBg: 'rgba(106, 175, 252, 0.1)',
  activeBorder: 'rgba(106, 175, 252, 0.3)',
  activeText: '#93c5fd',
  // A disabled primary fill, where opacity would show what is behind it.
  accentDisabled: 'rgba(106, 175, 252, 0.4)',
  // A segmented control's track, and its raised active segment.
  segmentTrack: 'rgba(255, 255, 255, 0.06)',
  segmentActive: '#333333',
  // Lighter and heavier scrims beside scrim, and secondary text on one.
  scrimSoft: 'rgba(0, 0, 0, 0.2)',
  scrimStrong: 'rgba(0, 0, 0, 0.6)',
  onScrimMuted: 'rgba(255, 255, 255, 0.72)',
})
