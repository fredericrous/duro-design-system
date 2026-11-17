import {css} from 'react-strict-dom'
import {spacing} from '@greenharness/greenrack-tokens/tokens/spacing.css'

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
