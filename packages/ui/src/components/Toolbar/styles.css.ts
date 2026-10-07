import {css} from 'react-strict-dom'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  vertical: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
  },
})
