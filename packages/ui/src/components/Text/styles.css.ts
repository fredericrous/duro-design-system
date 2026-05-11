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

  // Truncate. minWidth: 0 lets a truncating Text actually shrink inside a
  // flex/grid container — without it, the default `min-width: auto` would
  // keep the element at its content width, so text-overflow: ellipsis would
  // never trigger and the text would just overflow the parent instead.
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
})
