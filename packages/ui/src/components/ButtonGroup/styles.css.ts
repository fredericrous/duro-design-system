import {css} from 'react-strict-dom'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

export const styles = css.create({
  base: {
    display: 'flex',
  },
  horizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vertical: {
    flexDirection: 'column',
  },
  alignStart: {justifyContent: 'flex-start'},
  alignCenter: {justifyContent: 'center'},
  alignEnd: {justifyContent: 'flex-end'},
  verticalAlignStart: {alignItems: 'flex-start'},
  verticalAlignCenter: {alignItems: 'center'},
  verticalAlignEnd: {alignItems: 'flex-end'},
  gapXs: {gap: spacing.xs},
  gapSm: {gap: spacing.sm},
  gapMd: {gap: spacing.md},
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
})
