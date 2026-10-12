import {html} from 'react-strict-dom'
import {SIZES_PX} from '@duro-app/tokens/keys'
import {styles} from './styles.css'
import {RemoveGlyph} from './RemoveGlyph'
import {variantText, type TagProps} from './types'

export type {TagProps, TagSize, TagVariant} from './types'

const sizeMap = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
} as const

const removableSizeMap = {
  sm: styles.removableSm,
  md: styles.removableMd,
} as const

/**
 * Native Tag (plan N0, Slice B): the label and, when removable, the remove
 * button. TagGroup is not ported (its grid keyboard model is web only,
 * Decision 6), so `value` is unused here; the remove button's name comes from
 * a string label.
 */
export function Tag({
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  disabled = false,
  wrap = false,
  children,
}: TagProps) {
  const removeLabel = typeof children === 'string' ? `Remove ${children}` : 'Remove'
  // A div, not the web's span: a native span is a Text, which would lay the
  // remove button out inline, raised off the label's centre line.
  return (
    <html.div
      style={[
        styles.base,
        styles.nativeFlex,
        sizeMap[size],
        removable && removableSizeMap[size],
        styles[variant],
        disabled && styles.disabled,
        wrap && styles.wrap,
      ]}
    >
      <html.span>{children}</html.span>
      {removable && (
        <html.button
          type="button"
          aria-label={removeLabel}
          disabled={disabled}
          onClick={disabled ? undefined : onRemove}
          style={[
            styles.removeButton,
            styles.nativeButtonFlex,
            disabled && styles.removeButtonDisabled,
          ]}
        >
          <RemoveGlyph
            size={size === 'sm' ? SIZES_PX.glyphXs : SIZES_PX.glyphSm}
            color={variantText[variant]}
          />
        </html.button>
      )}
    </html.div>
  )
}
