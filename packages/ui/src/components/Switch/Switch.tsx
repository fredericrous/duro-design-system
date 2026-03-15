import {type ReactNode, useCallback, useRef} from 'react'
import {html} from 'react-strict-dom'
import {useControllableValue} from '../../hooks/useControllableValue'
import {styles} from './styles.css'

interface SwitchProps {
  /** Controlled checked state. */
  checked?: boolean
  /** Initial checked state (uncontrolled). */
  defaultChecked?: boolean
  /** Callback fired when the checked state changes. */
  onCheckedChange?: (checked: boolean) => void
  /** Prevents user interaction. */
  disabled?: boolean
  /** Form field name for the hidden input. */
  name?: string
  /** Value submitted when checked. */
  value?: string
  /** Label content rendered beside the switch. */
  children?: ReactNode
}

export function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  name,
  value,
  children,
}: SwitchProps) {
  const [checked, setChecked] = useControllableValue(
    controlledChecked,
    defaultChecked,
    onCheckedChange,
  )
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = useCallback(() => {
    if (disabled) return
    setChecked(!checked)
    // Keep hidden input in sync for form submission
    if (inputRef.current) {
      inputRef.current.checked = !checked
    }
  }, [disabled, checked, setChecked])

  return (
    <html.label style={[styles.root, disabled && styles.rootDisabled]}>
      <html.input
        ref={inputRef}
        type="checkbox"
        role="switch"
        name={name}
        value={value}
        checked={controlledChecked !== undefined ? controlledChecked : undefined}
        defaultChecked={controlledChecked === undefined ? defaultChecked : undefined}
        disabled={disabled}
        aria-checked={checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onCheckedChange?.(e.target.checked)
        }}
        style={styles.input}
      />
      <html.button
        type="button"
        tabIndex={-1}
        aria-hidden
        disabled={disabled}
        onClick={handleClick}
        style={[styles.track, checked ? styles.trackChecked : styles.trackUnchecked]}
      >
        <html.span style={[styles.thumb, checked && styles.thumbChecked]} />
      </html.button>
      {children && <html.span>{children}</html.span>}
    </html.label>
  )
}
