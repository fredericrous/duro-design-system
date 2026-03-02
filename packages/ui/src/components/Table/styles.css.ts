import {css} from 'react-strict-dom'
import {colors, radii, spacing, typography} from '@duro-app/tokens'

export const styles = css.create({
  // Root
  root: {
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
    backgroundColor: colors.bgCard,
  },

  // Row
  row: {
    display: 'grid',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  rowLastChild: {
    borderBottomWidth: 0,
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

  // Dynamic styles — simple identifier params only (StyleX constraint)
  gridColumns: (columns: number) => ({
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
  }),
})
