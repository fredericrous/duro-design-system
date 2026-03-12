import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  // Colors
  default: {
    color: colors.text,
  },
  muted: {
    color: colors.textMuted,
  },
  accent: {
    color: colors.accent,
  },
  error: {
    color: colors.errorText,
  },
  success: {
    color: colors.successText,
  },
  warning: {
    color: colors.warningText,
  },

  // Weight overrides
  weightNormal: {
    fontWeight: typography.fontWeightNormal,
  },
  weightMedium: {
    fontWeight: typography.fontWeightMedium,
  },
  weightSemibold: {
    fontWeight: typography.fontWeightSemibold,
  },
  weightBold: {
    fontWeight: typography.fontWeightBold,
  },

  // Alignment
  alignStart: {
    textAlign: 'start',
  },
  alignCenter: {
    textAlign: 'center',
  },
  alignEnd: {
    textAlign: 'end',
  },

  // Truncate
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})
