import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

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
    width: 18,
    height: 18,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: radii.full,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transitionProperty: 'background-color, border-color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
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
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
  },
  input: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
})
