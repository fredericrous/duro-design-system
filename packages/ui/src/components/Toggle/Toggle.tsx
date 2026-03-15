import {type ReactNode, useCallback} from 'react'
import {html} from 'react-strict-dom'
import {useControllableValue} from '../../hooks/useControllableValue'
import {styles} from './styles.css'

export type ToggleSize = 'default' | 'small'

interface ToggleProps {
  /** Controlled pressed state. */
  pressed?: boolean
  /** Initial pressed state (uncontrolled). */
  defaultPressed?: boolean
  /** Callback fired when the pressed state changes. */
  onPressedChange?: (pressed: boolean) => void
  /** Prevents user interaction. */
  disabled?: boolean
  /** Size variant. */
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
  disabled = false,
  size = 'default',
  'aria-label': ariaLabel,
  children,
}: ToggleProps) {
  const [pressed, setPressed] = useControllableValue(controlledPressed, defaultPressed, onPressedChange)

  const handleClick = useCallback(() => {
    if (!disabled) {
      setPressed(!pressed)
    }
  }, [disabled, pressed, setPressed])

  return (
    <html.button
      type="button"
      role="button"
      aria-pressed={pressed}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      data-pressed={pressed ? '' : undefined}
      style={[styles.base, sizeMap[size], pressed ? styles.pressed : styles.unpressed, disabled && styles.disabled]}
    >
      {children}
    </html.button>
  )
}
