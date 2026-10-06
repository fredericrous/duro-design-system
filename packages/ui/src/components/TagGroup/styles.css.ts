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
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  containerError: {},
  containerDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  // Static display (no Input) — no gap needed
  containerStatic: {
    gap: 0,
  },
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: {
      default: colors.border,
      ':focus': colors.accent,
    },
    borderRadius: radii.sm,
    backgroundColor: colors.bg,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
    color: colors.text,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    minHeight: sizes.controlLg,
    transitionProperty: 'border-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
    outlineWidth: {
      default: 0,
      ':focus': borders.focusRing,
    },
    outlineStyle: {
      default: 'none',
      ':focus': 'solid',
    },
    outlineColor: {
      default: 'transparent',
      ':focus': colors.accent,
    },
    outlineOffset: {
      default: 0,
      ':focus': borders.focusOffsetSm,
    },
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: {
      default: colors.error,
      ':focus': colors.error,
    },
  },
})
