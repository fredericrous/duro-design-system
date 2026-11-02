import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    minWidth: 0,
  },
  // A step under the top one stays mounted, so its rows (and the row that opened the next step) survive.
  stepHidden: {
    display: 'none',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.ms,
    paddingRight: spacing.ms,
  },
  title: {
    flex: 1,
    minWidth: 0,
    margin: 0,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightSemibold,
    lineHeight: typography.lineHeight,
    color: colors.text,
  },
  input: {
    paddingLeft: spacing.ms,
    paddingRight: spacing.ms,
    paddingBottom: spacing.xs,
  },
  rows: {
    overflowY: 'auto',
  },
  // Dynamic style: simple identifier params only (StyleX constraint)
  rowsMaxHeight: (maxHeight: number | string) => ({
    maxHeight,
  }),
})
