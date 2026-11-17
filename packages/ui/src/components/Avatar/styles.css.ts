import {css} from 'react-strict-dom'
import {colors} from '@greenharness/greenrack-tokens/tokens/colors.css'
import {radii} from '@greenharness/greenrack-tokens/tokens/spacing.css'
import {sizes} from '@greenharness/greenrack-tokens/tokens/sizes.css'
import {typography} from '@greenharness/greenrack-tokens/tokens/typography.css'

export const styles = css.create({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: colors.neutralBg,
    color: colors.neutralText,
    fontWeight: typography.fontWeightMedium,
    lineHeight: 1,
  },

  sm: {width: sizes.controlSm, height: sizes.controlSm, fontSize: typography.fontSizeXs},
  md: {width: sizes.thumbSm, height: sizes.thumbSm, fontSize: typography.fontSizeSm},
  lg: {width: sizes.iconXxl, height: sizes.iconXxl, fontSize: typography.fontSizeMd},

  circle: {borderRadius: radii.full},
  square: {borderRadius: radii.sm},

  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
})
