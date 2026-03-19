import {html} from 'react-strict-dom'
import {useFieldContext} from '../Field/FieldContext'
import {useInputGroupContext} from '../InputGroup/InputGroupContext'
import {styles} from './styles.css'

type StrictInputProps = React.ComponentProps<typeof html.input>
export type InputType = NonNullable<StrictInputProps['type']>

export type InputVariant = 'default' | 'error'

interface InputProps {
  variant?: InputVariant
  type?: InputType
  name?: string
  placeholder?: string
  required?: boolean
  minLength?: number
  pattern?: string
  autoComplete?:
    | 'on'
    | 'off'
    | 'email'
    | 'username'
    | 'current-password'
    | 'new-password'
    | 'name'
    | 'tel'
    | 'url'
  value?: string
  defaultValue?: string
  disabled?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  ref?: React.Ref<HTMLInputElement>
}

export function Input({
  variant = 'default',
  type = 'text',
  name,
  placeholder,
  required,
  minLength,
  pattern,
  autoComplete,
  value,
  defaultValue,
  disabled,
  onChange,
  onBlur,
  ref,
}: InputProps) {
  const ctx = useFieldContext()
  const groupCtx = useInputGroupContext()

  const fieldCtx = ctx?.field
  const effectiveName = name ?? fieldCtx?.name
  const effectiveValue = value ?? (fieldCtx ? String(fieldCtx.value ?? '') : undefined)
  const effectiveOnChange = onChange ?? fieldCtx?.onChange
  const effectiveOnBlur = onBlur ?? fieldCtx?.onBlur
  const effectiveRef = ref ?? fieldCtx?.ref
  const effectiveVariant = ctx?.invalid ? 'error' : variant

  // react-strict-dom omits web-only `pattern` from its types, but the
  // underlying DOM element supports it. Type-assert to pass it through.
  const extraProps = pattern !== undefined ? {pattern} : undefined

  return (
    <html.input
      id={ctx?.controlId}
      type={type}
      name={effectiveName}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
      autoComplete={autoComplete}
      value={effectiveValue}
      defaultValue={defaultValue}
      disabled={disabled}
      aria-describedby={
        ctx ? `${ctx.descriptionId} ${ctx.invalid ? ctx.errorId : ''}`.trim() : undefined
      }
      aria-invalid={ctx?.invalid || variant === 'error' || undefined}
      onChange={effectiveOnChange as StrictInputProps['onChange']}
      onBlur={effectiveOnBlur as StrictInputProps['onBlur']}
      ref={effectiveRef as React.Ref<HTMLInputElement>}
      style={[styles.base, styles[effectiveVariant], groupCtx?.inGroup && styles.inGroup]}
      {...(extraProps as Record<string, unknown>)}
    />
  )
}
