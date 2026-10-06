import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

export const styles = css.create({
  base: {
    width: '100%',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    lineHeight: typography.lineHeight,
    color: colors.text,
    backgroundColor: colors.bg,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderRadius: radii.sm,
    resize: 'vertical' as const,
    transitionProperty: 'border-color',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
    outlineWidth: {
      default: 0,
      ':focus-visible': borders.focusRing,
    },
    outlineStyle: {
      default: 'none',
      ':focus-visible': 'solid',
    },
    outlineColor: {
      default: 'transparent',
      ':focus-visible': colors.accent,
    },
    outlineOffset: {
      default: 0,
      ':focus-visible': borders.focusOffsetSm,
    },
  },
  default: {
    borderColor: {
      default: colors.border,
      ':hover': colors.textMuted,
      ':focus': colors.accent,
    },
  },
  error: {
    borderColor: {
      default: colors.error,
      ':focus': colors.error,
    },
  },
})
