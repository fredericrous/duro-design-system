import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'

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
})
