import {type ReactNode, useCallback} from 'react'
import {html} from 'react-strict-dom'
import {useControllableValue} from '../../hooks/useControllableValue'
import {useToggleGroup} from '../ToggleGroup/ToggleGroupContext'
import {styles} from './styles.css'

export type ToggleSize = 'default' | 'small'

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
  const groupPressed =
    group && value !== undefined ? group.value.includes(value) : undefined
  const isGrouped = group !== null
  const disabled = disabledProp || (group?.disabled ?? false)
  const size = group?.size ?? sizeProp

  const [standalonePressed, setStandalonePressed] = useControllableValue(
    controlledPressed,
    defaultPressed,
    onPressedChange,
  )

  const pressed = groupPressed ?? standalonePressed

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
      type="button"
      aria-pressed={pressed}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      data-pressed={pressed ? '' : undefined}
      style={[
        styles.base,
        sizeMap[size],
        pressed ? styles.pressed : styles.unpressed,
        isGrouped && styles.grouped,
        disabled && styles.disabled,
      ]}
    >
      {children}
    </html.button>
  )
}
