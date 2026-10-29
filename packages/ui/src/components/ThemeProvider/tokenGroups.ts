import type {ThemableGroup} from '@duro-app/tokens/theme'
import {borders} from '@duro-app/tokens/tokens/borders.css'
import {colors} from '@duro-app/tokens/tokens/colors.css'
import {effects} from '@duro-app/tokens/tokens/effects.css'
import {layoutSpacing} from '@duro-app/tokens/tokens/layout-spacing.css'
import {duration, easing} from '@duro-app/tokens/tokens/motion.css'
import {shadows} from '@duro-app/tokens/tokens/shadows.css'
import {sizes} from '@duro-app/tokens/tokens/sizes.css'
import {radii, spacing} from '@duro-app/tokens/tokens/spacing.css'
import {typeScale, typography} from '@duro-app/tokens/tokens/typography.css'

/** The `defineVars` group each themable group names, for both providers. */
export const TOKEN_GROUPS: Record<ThemableGroup, object> = {
  colors,
  shadows,
  typography,
  typeScale,
  spacing,
  layoutSpacing,
  radii,
  sizes,
  borders,
  duration,
  easing,
  effects,
}
