import {css} from 'react-strict-dom'
import {colors} from '../tokens/colors.css'
import {shadows} from '../tokens/shadows.css'
import {typography} from '../tokens/typography.css'

/* "Landscape" — the editorial paper-and-ink identity of application-landscape
 * (EA cartography): warm paper background, near-black ink, parchment hairlines,
 * ink-filled primary actions, and the app's lifecycle palette for the status
 * colors (success = actuel green, warning = transition orange, info = cible
 * blue, error = obsolescence red). */

export const landscapeTheme = css.createTheme(colors, {
  bg: '#faf7f1', // paper
  bgCard: '#ffffff', // card
  bgCardHover: '#f5f1e8',
  text: '#1a1a1a', // ink
  textMuted: '#6b6760', // ink3
  accent: '#1a1a1a', // primary actions are INK-filled in this identity
  accentHover: '#3c3a36', // ink2
  accentContrast: '#faf7f1',
  border: '#e7e1d6', // line
  error: '#c00000', // obsolescence red
  errorHover: '#9a1010',
  errorBg: 'rgba(192, 0, 0, 0.07)',
  errorBorder: 'rgba(192, 0, 0, 0.3)',
  errorText: '#9a1010',
  errorContrast: '#ffffff',
  success: '#2e7d46', // lifecycle "actuel" green
  successBg: 'rgba(46, 125, 70, 0.08)',
  successBorder: 'rgba(46, 125, 70, 0.3)',
  successText: '#1d5a30',
  warning: '#b26b00', // lifecycle "transition" orange
  warningBg: 'rgba(178, 107, 0, 0.08)',
  warningBorder: 'rgba(178, 107, 0, 0.3)',
  warningText: '#8f4e00',
  info: '#1f5fb2', // lifecycle "cible" blue
  infoBg: 'rgba(31, 95, 178, 0.08)',
  infoBorder: 'rgba(31, 95, 178, 0.3)',
  infoText: '#1f5fb2',
})

export const landscapeShadows = css.createTheme(shadows, {
  sm: '0 1px 3px rgba(22, 20, 15, 0.04)',
  md: '0 4px 14px rgba(22, 20, 15, 0.1)',
  lg: '0 12px 40px rgba(22, 20, 15, 0.18)',
})

export const landscapeTypography = css.createTheme(typography, {
  fontFamily: '"Hanken Grotesk", "Segoe UI", system-ui, sans-serif',
  fontFamilyMono: '"JetBrains Mono", monospace',
})
