import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  wrap: {
    position: 'relative',
    width: '100%',
  },
  scroll: {
    position: 'relative',
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.bgCard,
  },
  // Dynamic: only virtualized lists get a capped, scrollable viewport.
  scrollMax: (maxHeight: number | string) => ({
    maxHeight,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  }),
  head: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: colors.bgCard,
  },
  headRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  headCell: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
    color: colors.textMuted,
  },
  headCellSortable: {
    cursor: 'pointer',
    userSelect: 'none',
    color: {default: colors.textMuted, ':hover': colors.text},
  },
  sortMark: {
    fontSize: typography.fontSizeXs,
    color: colors.accent,
  },
  bodyTotal: (height: number) => ({
    position: 'relative',
    width: '100%',
    height,
  }),
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  rowClickable: {
    cursor: 'pointer',
    backgroundColor: {default: 'transparent', ':hover': colors.bgCardHover},
  },
  // Dynamic: absolute placement of a windowed row.
  rowAbsolute: (y: number) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    transform: `translateY(${y}px)`,
  }),
  cell: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // Dynamic: proportional column width from the TanStack column size (fr-like).
  cellFlex: (size: number) => ({
    flexGrow: size,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
  }),
  // --- Stack (card) mode: narrow containers ---
  // The scroll frame drops its border/background so each row card stands on
  // its own; windowing is off in this mode so no capped viewport.
  stackScroll: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'transparent',
  },
  stackBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  stackRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    width: '100%',
    padding: spacing.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.bgCard,
  },
  stackCell: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: spacing.sm,
    alignItems: 'center',
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    color: colors.text,
  },
  stackCellLabel: {
    color: colors.textMuted,
    fontWeight: typography.fontWeightMedium,
    fontSize: typography.fontSizeXs,
  },
  stackCellValue: {
    minWidth: 0,
    overflowWrap: 'break-word',
  },
  empty: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    textAlign: 'center' as const,
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
  },
  // Floating position indicator, pinned bottom-right of the viewport.
  pos: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.bgCardHover,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    pointerEvents: 'none',
  },
})
