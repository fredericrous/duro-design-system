import {css} from 'react-strict-dom'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'

export const styles = css.create({
  base: {
    display: 'grid',
  },
  col1: {gridTemplateColumns: '1fr'},
  col2: {gridTemplateColumns: 'repeat(2, 1fr)'},
  col3: {gridTemplateColumns: 'repeat(3, 1fr)'},
  col4: {gridTemplateColumns: 'repeat(4, 1fr)'},
  col5: {gridTemplateColumns: 'repeat(5, 1fr)'},
  col6: {gridTemplateColumns: 'repeat(6, 1fr)'},
  autoFit: (minWidth: string) => ({
    gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
  }),
  gapXs: {gap: spacing.xs},
  gapSm: {gap: spacing.sm},
  gapMs: {gap: spacing.ms},
  gapMd: {gap: spacing.md},
  gapLg: {gap: spacing.lg},
  gapXl: {gap: spacing.xl},
  gapXxl: {gap: spacing.xxl},
  gapXxxl: {gap: spacing.xxxl},
})
