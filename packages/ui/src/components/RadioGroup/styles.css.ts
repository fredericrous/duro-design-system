import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

export const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  rootHorizontal: {
    flexDirection: 'row',
  },
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.sm,
    cursor: 'pointer',
    fontSize: typography.fontSizeSm,
    color: colors.text,
    lineHeight: typography.lineHeight,
  },
  itemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  circle: {
    width: sizes.indicator,
    height: sizes.indicator,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderRadius: radii.full,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transitionProperty: 'background-color, border-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
  },
  circleUnchecked: {
    backgroundColor: colors.bg,
    borderColor: {
      default: colors.border,
      ':hover': colors.textMuted,
    },
  },
  circleChecked: {
    backgroundColor: colors.bg,
    borderColor: colors.accent,
  },
  dot: {
    width: sizes.indicatorDot,
    height: sizes.indicatorDot,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
  },
  // Layered on visuallyHidden.base: a native input is also made transparent.
  input: {
    opacity: 0,
  },
})
