import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {typography} from '@duro-app/tokens/tokens/typography.css'

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
