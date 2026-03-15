import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii} from '@duro-app/tokens/tokens/spacing.css'

export const styles = css.create({
  root: {
    display: 'inline-flex',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    overflow: 'hidden',
  },
  vertical: {
    flexDirection: 'column',
  },
})
