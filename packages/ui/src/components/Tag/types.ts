import type {ReactNode} from 'react'
import type {ColorToken} from '@duro-app/tokens/keys'

export type TagVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

/** Each variant's text colour, which the remove cross draws in. */
export const variantText = {
  default: 'text',
  success: 'successText',
  warning: 'warningText',
  error: 'errorText',
  info: 'infoText',
} as const satisfies Record<TagVariant, ColorToken>

export type TagSize = 'sm' | 'md'

export interface TagProps {
  /** Value identifier — required when used inside TagGroup */
  value?: string
  variant?: TagVariant
  size?: TagSize
  /** Show remove button. Auto-derived from TagGroup context when inside one. */
  removable?: boolean
  /** Called when remove button is clicked. Auto-wired to TagGroup when inside one. */
  onRemove?: () => void
  disabled?: boolean
  /**
   * Allow the label to wrap / break instead of staying on one line. Tags are
   * `white-space: nowrap` by default (they read as pills); set this for long
   * identifier-style values (e.g. `lldap.group.member.remove`) sitting in a
   * constrained column, so they break within their cell instead of leaking
   * into the next one.
   */
  wrap?: boolean
  children: ReactNode
}

export interface RemoveGlyphProps {
  /** px, from the glyph size tokens */
  size: number
  /** Native only: the web inherits the tag's text colour. */
  color: ColorToken
}
