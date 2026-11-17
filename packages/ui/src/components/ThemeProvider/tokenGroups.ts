import type {ThemableGroup} from '@greenharness/greenrack-tokens/theme'
import {borders} from '@greenharness/greenrack-tokens/tokens/borders.css'
import {colors} from '@greenharness/greenrack-tokens/tokens/colors.css'
import {effects} from '@greenharness/greenrack-tokens/tokens/effects.css'
import {layoutSpacing} from '@greenharness/greenrack-tokens/tokens/layout-spacing.css'
import {duration, easing} from '@greenharness/greenrack-tokens/tokens/motion.css'
import {shadows} from '@greenharness/greenrack-tokens/tokens/shadows.css'
import {sizes} from '@greenharness/greenrack-tokens/tokens/sizes.css'
import {radii, spacing} from '@greenharness/greenrack-tokens/tokens/spacing.css'
import {typeScale, typography} from '@greenharness/greenrack-tokens/tokens/typography.css'

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
