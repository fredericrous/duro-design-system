import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {microSpacing, radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'

export const styles = css.create({
  // Two columns — row labels, date track — with the axis as the first row.
  root: {
    display: 'grid',
    gridTemplateColumns: `${sizes.timelineLabelW} 1fr`,
    rowGap: spacing.xs,
    color: colors.text,
  },
  heading: {
    display: 'flex',
    alignItems: 'flex-end',
    fontSize: typography.fontSizeXs,
    color: colors.textMuted,
  },
  axis: {
    position: 'relative',
    height: sizes.chip,
    fontSize: typography.fontSizeXs,
    color: colors.textMuted,
    whiteSpace: 'nowrap',
  },
  tick: {
    position: 'absolute',
    top: 0,
    paddingLeft: spacing.xs,
    borderLeftWidth: borders.hairline,
    borderLeftStyle: 'solid',
    borderLeftColor: colors.border,
  },
  todayLabel: {
    position: 'absolute',
    bottom: 0,
    transform: 'translateX(-50%)',
    color: colors.errorText,
    fontWeight: typography.fontWeightMedium,
  },
  left: (percent: number) => ({left: `${percent}%`}),
  width: (percent: number) => ({width: `${percent}%`}),
  label: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  labelText: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  labelDescription: {
    fontSize: typography.fontSizeXs,
    color: colors.textMuted,
    whiteSpace: 'nowrap',
  },
  track: {
    position: 'relative',
    height: sizes.controlMd,
  },
  today: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderLeftWidth: borders.strong,
    borderLeftStyle: 'solid',
    borderLeftColor: colors.error,
    pointerEvents: 'none',
    zIndex: 2,
  },
  bar: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    boxSizing: 'border-box',
    height: sizes.controlSm,
  },
  face: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    padding: 0,
    overflow: 'hidden',
    borderRadius: radii.xs,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: {default: colors.border, ':hover': colors.accent},
    backgroundColor: colors.bg,
    color: colors.text,
    cursor: 'pointer',
    textAlign: 'left',
    transitionProperty: 'box-shadow, border-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
    outlineStyle: {default: 'none', ':focus-visible': 'solid'},
    outlineWidth: borders.focusRing,
    outlineColor: colors.accent,
    outlineOffset: borders.focusOffset,
  },
  faceSelected: {
    borderColor: colors.accent,
    boxShadow: `0 0 0 ${microSpacing.px1} ${colors.accent}`,
  },
  barPlanned: {
    borderStyle: 'dashed',
  },
  barDone: {
    backgroundColor: colors.successBg,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.infoBg,
    borderRightWidth: borders.strong,
    borderRightStyle: 'solid',
    borderRightColor: colors.accent,
  },
  fillDone: {
    backgroundColor: colors.successBg,
    borderRightColor: colors.success,
  },
  barText: {
    position: 'relative',
    paddingLeft: spacing.sm,
    fontSize: typography.fontSizeXs,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // The edges: keyboard sliders, drawn only while focused.
  edge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: spacing.sm,
    borderRadius: radii.xs,
    outlineStyle: {default: 'none', ':focus-visible': 'solid'},
    outlineWidth: borders.focusRing,
    outlineColor: colors.accent,
    backgroundColor: {default: 'transparent', ':focus-visible': colors.accent},
    zIndex: 3,
  },
  edgeStart: {
    left: `calc(-1 * ${spacing.xs})`,
  },
  edgeEnd: {
    right: `calc(-1 * ${spacing.xs})`,
  },
})
