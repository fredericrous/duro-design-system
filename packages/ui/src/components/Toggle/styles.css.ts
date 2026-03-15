import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

export const styles = css.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeightMedium,
    transitionProperty: 'background-color, border-color, color, opacity',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    outlineWidth: {default: 0, ':focus-visible': 2},
    outlineStyle: 'solid',
    outlineColor: colors.accent,
    outlineOffset: 2,
  },
  sizeDefault: {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSizeSm,
    borderRadius: radii.sm,
    gap: spacing.sm,
  },
  sizeSmall: {
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: typography.fontSizeXs,
    borderRadius: radii.sm,
    gap: spacing.xs,
  },
  unpressed: {
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.bgCardHover,
    },
    borderColor: {
      default: colors.border,
      ':hover': colors.textMuted,
    },
    color: colors.textMuted,
  },
  pressed: {
    backgroundColor: {
      default: colors.accent,
      ':hover': colors.accentHover,
    },
    borderColor: colors.accent,
    color: colors.accentContrast,
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
})
