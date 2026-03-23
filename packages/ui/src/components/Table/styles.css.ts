import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  // Root — the single grid container for the entire table
  root: {
    display: 'grid',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.bgCard,
    fontFamily: typography.fontFamily,
    color: colors.text,
  },

  // Header group
  header: {
    display: 'grid',
    gridColumn: '1 / -1',
    gridTemplateColumns: 'subgrid',
    backgroundColor: colors.bgCard,
  },

  // Body group
  body: {
    display: 'grid',
    gridColumn: '1 / -1',
    gridTemplateColumns: 'subgrid',
  },

  // Row — spans all columns, uses subgrid to share parent tracks
  row: {
    display: 'grid',
    gridColumn: '1 / -1',
    gridTemplateColumns: 'subgrid',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  bodyRow: {
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
  },

  // Header cell
  headerCell: {
    fontWeight: typography.fontWeightSemibold,
    color: colors.textMuted,
    textAlign: 'start',
  },

  // Body cell
  cell: {
    color: colors.text,
    display: 'flex',
    alignItems: 'center',
  },

  // Size: sm
  cellSm: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    fontSize: typography.fontSizeXs,
  },
  // Size: md
  cellMd: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontSize: typography.fontSizeSm,
  },

  // Variant: striped (even body rows)
  stripedEven: {
    backgroundColor: {
      default: colors.bgCardHover,
      ':hover': colors.bgCardHover,
    },
  },

  // Variant: bordered (cells get side borders)
  borderedCell: {
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: colors.border,
  },
  borderedCellLast: {
    borderRightWidth: 0,
  },

  // Dynamic: grid columns applied on Root
  gridColumns: (template: string) => ({
    gridTemplateColumns: template,
  }),
})
