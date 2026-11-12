import type {ReactNode, Ref} from 'react'
import {devWarnOnce} from '../../shared/devWarnOnce'
import {isNative} from '../../platform'
import {mergeRefs} from '../../shared/mergeRefs'
import {ButtonHost} from '../../shared/ButtonHost'
import type {ControlSize} from '../../shared/types'
import {useGroupedControl} from '../ButtonGroup/useGroupedControl'
import {useFormSubmit} from '../Form/FormSubmitContext'
import {styles} from './styles.css'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'inverseSecondary'
  | 'link'
  | 'danger'
  | 'ghost'
export type ButtonShape = 'default' | 'round'
export type ButtonSize = ControlSize

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /**
   * `round` is an icon-only circle sized by a size token per size; it has no
   * visible text, so it requires an `aria-label` (a development warning otherwise).
   */
  shape?: ButtonShape
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

const roundSizeMap = {
  default: styles.roundDefault,
  small: styles.roundSmall,
} as const

export function Button({
  variant = 'primary',
  size = 'default',
  shape = 'default',
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
  if (shape === 'round' && !ariaLabel) {
    devWarnOnce(
      'Button',
      'round-needs-label',
      'Button shape="round" is icon-only: give it an aria-label.',
    )
  }
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
        shape === 'round' && styles.round,
        shape === 'round' && roundSizeMap[size],
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
