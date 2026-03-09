import {html} from 'react-strict-dom'
import {useFieldContext} from '../Field/FieldContext'
import {styles} from './styles.css'

export type TextareaVariant = 'default' | 'error'

interface TextareaProps {
  variant?: TextareaVariant
  name?: string
  placeholder?: string
  required?: boolean
  rows?: number
  value?: string
  defaultValue?: string
  disabled?: boolean
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export function Textarea({
  variant = 'default',
  name,
  placeholder,
  required,
  rows = 3,
  value,
  defaultValue,
  disabled,
  onChange,
}: TextareaProps) {
  const ctx = useFieldContext()

  return (
    <html.textarea
      id={ctx?.controlId}
      name={name}
      placeholder={placeholder}
      required={required}
      rows={rows}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      aria-describedby={
        ctx ? `${ctx.descriptionId} ${ctx.invalid ? ctx.errorId : ''}`.trim() : undefined
      }
      aria-invalid={ctx?.invalid || variant === 'error' || undefined}
      onChange={onChange}
      style={[styles.base, styles[variant]]}
    />
  )
}
