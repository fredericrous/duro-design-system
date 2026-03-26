import {type ReactNode, useCallback, useRef} from 'react'
import {html} from 'react-strict-dom'
import {useTagGroup} from '../TagGroup/TagGroupContext'
import {styles} from './styles.css'

export type TagVariant = 'default' | 'success' | 'warning' | 'error' | 'info'
export type TagSize = 'sm' | 'md'

interface TagProps {
  /** Value identifier — required when used inside TagGroup */
  value?: string
  variant?: TagVariant
  size?: TagSize
  /** Show remove button. Auto-derived from TagGroup context when inside one. */
  removable?: boolean
  /** Called when remove button is clicked. Auto-wired to TagGroup when inside one. */
  onRemove?: () => void
  disabled?: boolean
  children: ReactNode
}

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
          <svg
            width={size === 'sm' ? 10 : 12}
            height={size === 'sm' ? 10 : 12}
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M3 3l6 6M9 3l-6 6"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </svg>
        </html.button>
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
      ]}
    >
      {tagContent}
    </html.span>
  )
}
