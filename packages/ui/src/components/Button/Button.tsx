import type {ReactNode, Ref} from 'react'
import {html} from 'react-strict-dom'
import {isNative} from '../../platform'
import {styles} from './styles.css'

export type ButtonVariant = 'primary' | 'secondary' | 'inverseSecondary' | 'link' | 'danger'
export type ButtonSize = 'default' | 'small'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
  onClick?: () => void
  /** Accessible name override — e.g. for buttons whose visible text isn't unique. */
  'aria-label'?: string
  /** For a button that shows or hides another element (a disclosure, a panel). */
  'aria-expanded'?: boolean
  /** Id of the element this button controls. */
  'aria-controls'?: string
  /**
   * The underlying <button>, e.g. to anchor a Popover or return focus to it.
   * Web only: on native the ref is not attached.
   */
  ref?: Ref<HTMLButtonElement>
  children: ReactNode
}

const sizeMap = {
  default: styles.sizeDefault,
  small: styles.sizeSmall,
} as const

export function Button({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  'aria-label': ariaLabel,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  ref,
  children,
}: ButtonProps) {
  return (
    <html.button
      ref={isNative ? undefined : ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      style={[
        styles.base,
        isNative && styles.nativeFlex,
        sizeMap[size],
        styles[variant],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
    >
      {children}
    </html.button>
  )
}
