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
  infoBg: 'rgba(30, 64, 175, 0.08)',
  infoBorder: 'rgba(30, 64, 175, 0.3)',
  infoText: '#1e40af',
})

export const lightShadows = css.createTheme(shadows, {
  sm: '0 2px 4px rgba(0, 0, 0, 0.08)',
  md: '0 4px 12px rgba(0, 0, 0, 0.12)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.16)',
})
