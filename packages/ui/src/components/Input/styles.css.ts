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
  // Direction OutlineOnHover (docs/mockups/input-ghost/OutlineOnHover.dc.html):
  // reads as text at rest; hover draws the field's hairline border, focus
  // turns it accent and adds the ring. For inline edit with a visible label.
  ghost: {
    backgroundColor: 'transparent',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    // The text lines up with its label above.
    marginLeft: `calc(-1 * ${spacing.sm})`,
    borderColor: {
      default: 'transparent',
      ':hover': colors.border,
      ':focus': colors.accent,
    },
  },
  ghostError: {
    backgroundColor: colors.errorBg,
    borderColor: {
      default: colors.errorBorder,
      ':focus': colors.error,
    },
  },
  ghostDisabled: {
    color: colors.textMuted,
    cursor: 'not-allowed',
    borderColor: 'transparent',
  },
  inGroup: {
    borderWidth: 0,
    borderRadius: 0,
    outlineWidth: 0,
  },
  // orthogonal to variant (default/error) — composes on top so a mono field
  // still shows its error border. For slugs, identifiers, hashes.
  mono: {
    fontFamily: typography.fontFamilyMono,
  },
})
