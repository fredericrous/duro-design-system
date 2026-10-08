import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {spacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

export const styles = css.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    cursor: 'pointer',
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeightMedium,
    transitionProperty: 'background-color, border-color, color, opacity',
    transitionDuration: duration.fast,
    transitionTimingFunction: easing.standard,
    outlineWidth: {default: 0, ':focus-visible': borders.focusRing},
    outlineStyle: 'solid',
    outlineColor: colors.accent,
    outlineOffset: borders.focusOffset,
    minWidth: {default: null, '@media (pointer: coarse)': sizes.touchTarget},
    minHeight: {default: null, '@media (pointer: coarse)': sizes.touchTarget},
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
    // Every small control is at least controlSm tall, whatever it holds (5.5).
    minHeight: {default: sizes.controlSm, '@media (pointer: coarse)': sizes.touchTarget},
  },
  // wrapped toggles: a fixed block size per size, the touch target under a
  // coarse pointer. ToggleGroup's maxRows arithmetic reads the same tokens.
  wrappedDefault: {
    boxSizing: 'border-box',
    height: {default: sizes.controlMd, '@media (pointer: coarse)': sizes.touchTarget},
  },
  wrappedSmall: {
    boxSizing: 'border-box',
    height: {default: sizes.controlSm, '@media (pointer: coarse)': sizes.touchTarget},
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
  grouped: {
    borderWidth: 0,
    borderRadius: 0,
    borderRightWidth: borders.hairline,
    borderRightStyle: 'solid',
    // Override any borderColor set by pressed state — dividers always use border token
    borderColor: colors.border,
  },
  // Pressed, in an attached group: the accent edge is drawn inset, inside the
  // border a neighbour's negative margin overlaps, so it shows on all four
  // sides without a z-index (which stays for focus).
  attachedPressed: {
    boxShadow: `inset 0 0 0 ${borders.hairline} ${colors.accent}`,
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
})
