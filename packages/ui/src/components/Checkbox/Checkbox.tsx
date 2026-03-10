import {type ReactNode, useState, useCallback} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

interface CheckboxProps {
  name?: string
  value?: string
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  children?: ReactNode
}

export function Checkbox({
  name,
  value,
  checked: controlledChecked,
  defaultChecked = false,
  disabled = false,
  onChange,
  children,
}: CheckboxProps) {
  const isControlled = controlledChecked !== undefined
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isChecked = isControlled ? controlledChecked : internalChecked

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked)
      }
      onChange?.(e)
    },
    [isControlled, onChange],
  )

  return (
    <html.label style={[styles.root, disabled && styles.rootDisabled]}>
      <html.input
        type="checkbox"
        name={name}
        value={value}
        checked={isControlled ? controlledChecked : undefined}
        defaultChecked={!isControlled ? defaultChecked : undefined}
        disabled={disabled}
        onChange={handleChange}
        style={styles.input}
      />
      <html.span
        style={[styles.box, isChecked ? styles.boxChecked : styles.boxUnchecked]}
        aria-hidden
      >
        {isChecked && (
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
            <polyline
              points="2.5 6 5 8.5 9.5 3.5"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </html.span>
      {children && <html.span>{children}</html.span>}
    </html.label>
  )
}
