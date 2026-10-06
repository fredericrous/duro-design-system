import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'

export const styles = css.create({
  root: {
    display: 'inline-flex',
    borderRadius: radii.sm,
    borderWidth: borders.hairline,
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
      default: `calc((${rows} + 0.5) * ${sizes.controlSm} + ${rows} * ${spacing.xs} + 2 * ${spacing.xs})`,
      '@media (pointer: coarse)': `calc((${rows} + 0.5) * ${sizes.touchTarget} + ${rows} * ${spacing.xs} + 2 * ${spacing.xs})`,
    },
  }),
  maxRowsDefault: (rows: number) => ({
    maxHeight: {
      default: `calc((${rows} + 0.5) * ${sizes.controlMd} + ${rows} * ${spacing.xs} + 2 * ${spacing.xs})`,
      '@media (pointer: coarse)': `calc((${rows} + 0.5) * ${sizes.touchTarget} + ${rows} * ${spacing.xs} + 2 * ${spacing.xs})`,
    },
  }),
  vertical: {
    flexDirection: 'column',
  },
})
