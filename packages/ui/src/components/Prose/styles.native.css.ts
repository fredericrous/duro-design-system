import {css} from 'react-strict-dom'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

export const styles = css.create({
  // One column at reading width, one gap between blocks.
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    width: '100%',
    maxWidth: sizes.panelLg,
    minWidth: 0,
  },
})
