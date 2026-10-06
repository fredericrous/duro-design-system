import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {microSpacing, radii} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {borders} from '@duro-app/tokens/tokens/borders.css'

export const styles = css.create({
  base: {
    width: sizes.swatchW,
    height: sizes.swatchH,
    padding: microSpacing.px2,
    backgroundColor: colors.bg,
    borderWidth: borders.hairline,
    borderStyle: 'solid',
    borderColor: {
      default: colors.border,
      ':hover': colors.textMuted,
    },
    borderRadius: radii.sm,
    cursor: 'pointer',
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
    outlineOffset: borders.focusOffsetSm,
  },
  invalid: {
    borderColor: colors.error,
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
})
