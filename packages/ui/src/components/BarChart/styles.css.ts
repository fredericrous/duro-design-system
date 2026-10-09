import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    width: '100%',
  },
  text: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    color: colors.textMuted,
  },
  textStrong: {
    color: colors.text,
    fontWeight: typography.fontWeightSemibold,
  },

  // Legend: a swatch and the series name in text (WCAG 1.4.1).
  legend: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
  },
  swatch: {
    width: sizes.glyphSm,
    height: sizes.glyphSm,
    borderRadius: radii.xs,
  },

  // Vertical drawing.
  // The scale labels sit in a left gutter, centred on their gridline; the
  // margin above lets the top label clear the legend.
  plot: {
    position: 'relative',
    height: sizes.chartH,
    width: '100%',
    marginTop: spacing.sm,
  },
  gridline: {
    position: 'absolute',
    left: sizes.readoutW,
    right: 0,
    height: borders.hairline,
    backgroundColor: colors.border,
  },
  gridlineAt: (percent: number) => ({
    bottom: `${percent}%`,
  }),
  gridLabel: {
    position: 'absolute',
    right: '100%',
    bottom: 0,
    paddingRight: spacing.xs,
    transform: 'translateY(50%)',
    whiteSpace: 'nowrap',
  },
  bars: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: sizes.readoutW,
    right: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  slot: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  stack: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column-reverse',
    overflow: 'hidden',
    borderTopLeftRadius: radii.xs,
    borderTopRightRadius: radii.xs,
  },
  stackAt: (percent: number) => ({
    height: `${percent}%`,
  }),
  gap: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderBottomWidth: borders.strong,
    borderBottomStyle: 'dashed',
    borderBottomColor: colors.border,
  },
  axis: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.xs,
    width: '100%',
    paddingLeft: sizes.readoutW,
    boxSizing: 'border-box',
  },
  axisCell: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    overflow: 'visible',
  },
  axisLabel: {
    whiteSpace: 'nowrap',
  },

  // Segments: solid tone fills; the card colour separates neighbours.
  segment: {
    width: '100%',
    flexShrink: 0,
    borderTopWidth: borders.hairline,
    borderTopStyle: 'solid',
    borderTopColor: colors.bgCard,
  },
  segmentAt: (percent: number) => ({
    height: `${percent}%`,
  }),
  success: {backgroundColor: colors.success},
  error: {backgroundColor: colors.error},
  warning: {backgroundColor: colors.warning},
  info: {backgroundColor: colors.info},
  muted: {backgroundColor: colors.textMuted},

  // Row drawing.
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    width: '100%',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowLabel: {
    width: sizes.labelMinW,
    flexShrink: 0,
  },
  rowTrack: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    height: sizes.iconSm,
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: radii.xs,
  },
  rowSegment: {
    height: '100%',
    flexShrink: 0,
    borderLeftWidth: borders.hairline,
    borderLeftStyle: 'solid',
    borderLeftColor: colors.bgCard,
  },
  rowSegmentAt: (percent: number) => ({
    width: `${percent}%`,
  }),
  rowValue: {
    minWidth: sizes.readoutW,
    flexShrink: 0,
  },
})
