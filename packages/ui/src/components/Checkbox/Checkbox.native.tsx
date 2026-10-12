import {type ReactNode, useState, useCallback} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

interface CheckboxProps {
  name?: string
  value?: string
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  /** Accessible label when no visible label (children) is provided. */
  'aria-label'?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  children?: ReactNode
}

export function Checkbox({
  name,
  value,
  checked: controlledChecked,
  defaultChecked = false,
  disabled = false,
  'aria-label': ariaLabel,
  onChange,
  children,
}: CheckboxProps) {
  const isControlled = controlledChecked !== undefined
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isChecked = isControlled ? controlledChecked : internalChecked

  // RSD only makes <button> pressable and has no <input type=checkbox>, so the
  // whole row is a button and we synthesize the change payload that consumers
  // read (e.target.checked).
  const handlePress = useCallback(() => {
    if (disabled) return
    const next = !isChecked
    if (!isControlled) {
      setInternalChecked(next)
    }
    onChange?.({
      target: {checked: next, name, value},
    } as unknown as React.ChangeEvent<HTMLInputElement>)
  }, [disabled, isChecked, isControlled, onChange, name, value])

  return (
    <html.button
      type="button"
      onClick={handlePress}
      disabled={disabled}
      role="checkbox"
      aria-checked={isChecked}
      aria-label={!children ? ariaLabel : undefined}
      style={[styles.root, styles.nativeFlex, styles.nativeButton, disabled && styles.rootDisabled]}
    >
      <html.div
        style={[styles.box, styles.nativeFlex, isChecked ? styles.boxChecked : styles.boxUnchecked]}
      >
        {/* CSS-border checkmark (rotated right+bottom borders) — no SVG, no
              react-native-svg dep, so nothing is added to the web bundle. */}
        <html.div
          style={[styles.checkmark, isChecked ? styles.checkmarkVisible : styles.checkmarkHidden]}
        />
      </html.div>
      {children && <html.span style={styles.labelText}>{children}</html.span>}
    </html.button>
  )
}
