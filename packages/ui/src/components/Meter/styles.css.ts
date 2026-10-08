import {css} from 'react-strict-dom'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {radii} from '@duro-app/tokens/tokens/spacing.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'

export const styles = css.create({
  track: {
    position: 'relative',
    width: '100%',
    height: sizes.meterH,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.full,
    transitionProperty: 'width',
    transitionDuration: duration.base,
    transitionTimingFunction: easing.standard,
  },
  accent: {backgroundColor: colors.accent},
  success: {backgroundColor: colors.success},
  warning: {backgroundColor: colors.warning},
  error: {backgroundColor: colors.error},
  fillAt: (percent: number) => ({
    width: `${percent}%`,
  }),
})
