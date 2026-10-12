import {useCallback, useRef} from 'react'
import {html} from 'react-strict-dom'
import {SIZES_PX} from '@duro-app/tokens/keys'
import {useTagGroup} from '../TagGroup/TagGroupContext'
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

export function Tag({
  value,
  variant = 'default',
  size = 'md',
  removable: removableProp,
  onRemove: onRemoveProp,
  disabled: disabledProp = false,
  wrap = false,
  children,
}: TagProps) {
  const group = useTagGroup()
  const contentRef = useRef<HTMLElement>(null)

  const isGrouped = group !== null
  const disabled = disabledProp || (group?.disabled ?? false)
  const removable = removableProp ?? (isGrouped ? group.editable : false)

  const onRemove = useCallback(() => {
    if (disabled) return
    if (onRemoveProp) {
      onRemoveProp()
    } else if (isGrouped && value !== undefined) {
      group.removeTag(value)
    }
  }, [disabled, onRemoveProp, isGrouped, value, group])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return
      if ((e.key === 'Backspace' || e.key === 'Delete') && removable) {
        e.preventDefault()
        onRemove()
      }
      // Arrow key navigation delegated to TagGroup via context
      if (isGrouped && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault()
        const idx = value !== undefined ? group.values.indexOf(value) : -1
        if (e.key === 'ArrowLeft' && idx > 0) {
          group.setFocusedIndex(idx - 1)
        } else if (e.key === 'ArrowRight') {
          if (idx < group.values.length - 1) {
            group.setFocusedIndex(idx + 1)
          } else {
            // Move focus to input
            group.inputRef.current?.focus()
            group.setFocusedIndex(-1)
          }
        }
      }
    },
    [disabled, removable, onRemove, isGrouped, value, group],
  )

  const removeLabel = contentRef.current?.textContent
    ? `Remove ${contentRef.current.textContent}`
    : 'Remove'

  const tagContent = (
    <>
      <html.span ref={contentRef} {...(isGrouped ? {role: 'gridcell' as any} : {})}>
        {children}
      </html.span>
      {removable && (
        <html.span {...(isGrouped ? {role: 'gridcell' as any} : {})}>
          <html.button
            type="button"
            aria-label={removeLabel}
            disabled={disabled}
            onClick={(e) => {
              ;(e as any).stopPropagation?.()
              onRemove()
            }}
            tabIndex={-1}
            style={[styles.removeButton, disabled && styles.removeButtonDisabled]}
          >
            <RemoveGlyph
              size={size === 'sm' ? SIZES_PX.glyphXs : SIZES_PX.glyphSm}
              color={variantText[variant]}
            />
          </html.button>
        </html.span>
      )}
    </>
  )

  return (
    <html.span
      {...(isGrouped ? {role: 'row' as any} : {})}
      tabIndex={isGrouped ? 0 : undefined}
      onKeyDown={isGrouped ? (handleKeyDown as any) : undefined}
      style={[
        styles.base,
        sizeMap[size],
        removable && removableSizeMap[size],
        styles[variant],
        disabled && styles.disabled,
        wrap && styles.wrap,
      ]}
    >
      {tagContent}
    </html.span>
  )
}
