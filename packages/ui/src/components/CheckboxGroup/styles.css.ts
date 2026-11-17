import {css} from 'react-strict-dom'
import {spacing} from '@greenharness/greenrack-tokens/tokens/spacing.css'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  rootHorizontal: {
    flexDirection: 'row',
  },
})
