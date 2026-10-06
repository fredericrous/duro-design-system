import {css} from 'react-strict-dom'
import {ROW_HEIGHT} from '../Toggle/rowHeight'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'

export const styles = css.create({
  root: {
    display: 'inline-flex',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    overflow: 'hidden',
  },
  wrap: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    borderWidth: 0,
    borderRadius: 0,
    overflow: 'visible',
  },
  // the scroll content: room for focus rings to draw
  scrollContent: {
    position: 'relative',
    padding: spacing.xs,
  },
  // shows rows + 0.5 rows so the cut-off row hints at more; shorter content
  // sizes itself (max, not fixed). Row heights match the wrapped Toggles.
  maxRowsSmall: (rows: number) => ({
    maxHeight: {
      default: `calc((${rows} + 0.5) * ${ROW_HEIGHT.small}px + ${rows} * ${spacing.xs} + 2 * ${spacing.xs})`,
      '@media (pointer: coarse)': `calc((${rows} + 0.5) * ${ROW_HEIGHT.coarse}px + ${rows} * ${spacing.xs} + 2 * ${spacing.xs})`,
    },
  }),
  maxRowsDefault: (rows: number) => ({
    maxHeight: {
      default: `calc((${rows} + 0.5) * ${ROW_HEIGHT.default}px + ${rows} * ${spacing.xs} + 2 * ${spacing.xs})`,
      '@media (pointer: coarse)': `calc((${rows} + 0.5) * ${ROW_HEIGHT.coarse}px + ${rows} * ${spacing.xs} + 2 * ${spacing.xs})`,
    },
  }),
  vertical: {
    flexDirection: 'column',
  },
})
