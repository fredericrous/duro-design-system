import {type ReactNode, useCallback, useLayoutEffect, useRef} from 'react'
import {html} from 'react-strict-dom'
import {useControllableValue} from '../../hooks/useControllableValue'
import {useToggleGroup} from '../ToggleGroup/ToggleGroupContext'
import {useGroupedControl} from '../ButtonGroup/useGroupedControl'
import {mergeRefs} from '../../shared/mergeRefs'
import type {ControlSize} from '../../shared/types'
import {styles} from './styles.css'

export type ToggleSize = ControlSize

interface ToggleProps {
  /** Controlled pressed state (standalone usage). */
  pressed?: boolean
  /** Initial pressed state (uncontrolled, standalone usage). */
  defaultPressed?: boolean
  /** Callback fired when the pressed state changes (standalone usage). */
  onPressedChange?: (pressed: boolean) => void
  /** Unique value when used inside a ToggleGroup. */
  value?: string
  /** Prevents user interaction. */
  disabled?: boolean
  /** Size variant (overridden by ToggleGroup when grouped). */
  size?: ToggleSize
  'aria-label'?: string
  children: ReactNode
}

const wrappedSizeMap = {
  default: styles.wrappedDefault,
  small: styles.wrappedSmall,
} as const

const sizeMap = {
  default: styles.sizeDefault,
  small: styles.sizeSmall,
} as const

export function Toggle({
  pressed: controlledPressed,
  defaultPressed = false,
  onPressedChange,
  value,
  disabled: disabledProp = false,
  size: sizeProp = 'default',
  'aria-label': ariaLabel,
  children,
}: ToggleProps) {
  const group = useToggleGroup()

  // When inside a ToggleGroup, derive pressed state from group context
  const groupPressed = group && value !== undefined ? group.value.includes(value) : undefined
  const isGrouped = group !== null
  const disabled = disabledProp || (group?.disabled ?? false)
  const size = group?.size ?? sizeProp

  const wrap = group?.wrap ?? false
  const ref = useRef<HTMLButtonElement>(null)
  const register = group?.register
  useLayoutEffect(() => {
    if (!wrap || !register || value === undefined || !ref.current) return
    return register(value, ref.current)
  }, [wrap, register, value])

  const [standalonePressed, setStandalonePressed] = useControllableValue(
    controlledPressed,
    defaultPressed,
    onPressedChange,
  )

  const pressed = groupPressed ?? standalonePressed
  const grouped = useGroupedControl<HTMLButtonElement>({disabled})
  // In a Toolbar the toolbar owns the roving tabindex, not a wrapping group.
  const roving = wrap && value !== undefined && !grouped.onFocus

  const handleClick = useCallback(() => {
    if (disabled) return
    if (isGrouped && value !== undefined) {
      group.toggle(value)
    } else {
      setStandalonePressed(!pressed)
    }
  }, [disabled, isGrouped, value, group, pressed, setStandalonePressed])

  return (
    <html.button
      ref={mergeRefs(ref, grouped.ref)}
      type="button"
      tabIndex={
        grouped.onFocus
          ? grouped.tabIndex
          : roving
            ? group?.tabStopValue === value
              ? 0
              : -1
            : undefined
      }
      onFocus={grouped.onFocus ?? (roving ? () => group?.onItemFocus(value) : undefined)}
      aria-pressed={pressed}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      data-pressed={pressed ? '' : undefined}
      style={[
        styles.base,
        sizeMap[size],
        pressed ? styles.pressed : styles.unpressed,
        wrap && wrappedSizeMap[size],
        // In an attached ButtonGroup the group joins the borders instead.
        isGrouped && !wrap && !grouped.attached && styles.grouped,
        disabled && styles.disabled,
        grouped.style,
        grouped.attached && pressed && styles.attachedPressed,
      ]}
    >
      {children}
    </html.button>
  )
}
