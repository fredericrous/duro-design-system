import type {ReactNode, Ref} from 'react'
import {isNative} from '../../platform'
import {mergeRefs} from '../../shared/mergeRefs'
import {ButtonHost} from '../../shared/ButtonHost'
import type {ControlSize} from '../../shared/types'
import {useGroupedControl} from '../ButtonGroup/useGroupedControl'
import {useFormSubmit} from '../Form/FormSubmitContext'
import {styles} from './styles.css'

export type ButtonVariant = 'primary' | 'secondary' | 'inverseSecondary' | 'link' | 'danger'
export type ButtonSize = ControlSize

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
   * On native it is react-strict-dom's element (a Pressable host), which
   * measures with `measureInWindow` and takes accessibility focus.
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
  const grouped = useGroupedControl<HTMLButtonElement>({disabled})
  // Native Form only (no DOM submit event); the web Form provides none.
  const formSubmit = useFormSubmit()
  const submit = type === 'submit' ? formSubmit : null
  return (
    <ButtonHost
      ref={isNative ? ref : mergeRefs(ref, grouped.ref)}
      tabIndex={grouped.tabIndex}
      onFocus={grouped.onFocus}
      type={type}
      disabled={disabled}
      onClick={
        submit
          ? () => {
              onClick?.()
              submit()
            }
          : onClick
      }
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
        grouped.style,
      ]}
    >
      {children}
    </ButtonHost>
  )
}
