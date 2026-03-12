import {css} from 'react-strict-dom'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

export const styles = css.create({
  base: {
    display: 'flex',
    flexDirection: 'column',
  },
  alignStart: {alignItems: 'flex-start'},
  alignCenter: {alignItems: 'center'},
  alignEnd: {alignItems: 'flex-end'},
  alignStretch: {alignItems: 'stretch'},
  gapXs: {gap: spacing.xs},
  gapSm: {gap: spacing.sm},
  gapMs: {gap: spacing.ms},
  gapMd: {gap: spacing.md},
  gapLg: {gap: spacing.lg},
  gapXl: {gap: spacing.xl},
  gapXxl: {gap: spacing.xxl},
  gapXxxl: {gap: spacing.xxxl},
})
