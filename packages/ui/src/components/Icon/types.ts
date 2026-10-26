import type {ColorToken, IconSize} from '@duro-app/tokens/keys'

import type {PhosphorIconName} from './phosphor-glyphs'

export type {IconSize}

/** Duro's own glyphs, then the Phosphor-generated ones Happier's React Native icon names use. */
export type IconName =
  | PhosphorIconName
  | 'x-circle'
  | 'check-circle'
  | 'check-done'
  | 'clock'
  | 'forbidden'
  | 'info-circle'
  | 'alert-triangle'
  | 'shield'
  | 'lock'
  | 'key'
  // Navigation / wayfinding glyphs
  | 'map'
  | 'layers'
  | 'repeat'
  | 'database'
  | 'shield-check'
  | 'route'
  | 'git-branch'
  | 'menu'
  | 'pin'
  // Infrastructure / inventory glyphs
  | 'server'
  | 'hard-drive'
  | 'box'
  | 'image'
  | 'tag'
  | 'pie-chart'
  // People / access / admin glyphs
  | 'users'
  | 'user-plus'
  | 'mail'
  | 'file-text'
  | 'plug'
  // Input / action glyphs
  | 'search'
  | 'mic'
  | 'x'
  // Color-mode glyphs
  | 'sun'
  | 'moon'
  | 'monitor'
  | 'contrast'
  // Device status glyphs
  | 'signal'
  | 'battery'
  // Media glyphs
  | 'video'
  | 'music'
  | 'play'
  | 'pause'
  // Filled variants (solid shape with cutout symbol)
  | 'info-circle-filled'
  | 'alert-triangle-filled'
  | 'check-circle-filled'
  | 'x-circle-filled'
  | 'shield-filled'
  | 'lock-filled'

export interface IconProps {
  name: IconName
  /** Token from the icon size scale: sm 16, md 18, lg 24, xl 36, xxl 48. */
  size?: IconSize
  /**
   * Colour token. Default: the surrounding text colour on the web
   * (`currentColor`), the `text` token on native, where an icon cannot
   * inherit a colour.
   */
  color?: ColorToken
}
