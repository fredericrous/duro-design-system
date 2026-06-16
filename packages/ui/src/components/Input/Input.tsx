import {html} from 'react-strict-dom'
import {useFieldContext} from '../Field/FieldContext'
import {useInputGroupContext} from '../InputGroup/InputGroupContext'
import {styles} from './styles.css'

type StrictInputProps = React.ComponentProps<typeof html.input>
export type InputType = NonNullable<StrictInputProps['type']>

export type InputVariant = 'default' | 'error'

interface InputProps {
  variant?: InputVariant
  /** Orthogonal to variant — `mono` keeps the error border but uses the
   *  monospace family (slugs, identifiers, hashes). */
  font?: 'mono'
  type?: InputType
  /** Explicit id — overrides the Field-context controlId when set (e.g. a
   *  control used outside a Field that still needs a stable id). */
  id?: string
  name?: string
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  minLength?: number
  maxLength?: number
  /** Numeric/range hints — forwarded to the native input (date/number/etc). */
  min?: string | number
  max?: string | number
  step?: string | number
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
  /** id of a <datalist> for native typeahead. */
  list?: string
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
  autoFocus?: boolean
  /** Accessible name when there's no associated <Field.Label>. */
  'aria-label'?: string
  /** Extra describedby ids (merged with the Field context's, if any). */
  'aria-describedby'?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  ref?: React.Ref<HTMLInputElement>
}

export function Input({
  variant = 'default',
  font,
  type = 'text',
  id,
  name,
  placeholder,
  required,
  readOnly,
  minLength,
  maxLength,
  min,
  max,
  step,
  inputMode,
  list,
  pattern,
  autoComplete,
  value,
  defaultValue,
  disabled,
  autoFocus,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
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
  const effectiveDisabled = disabled ?? ctx?.disabled
  const effectiveVariant = ctx?.invalid ? 'error' : variant
  // Field context owns describedby (description + error); fall back to the
  // explicit prop only when standalone.
  const describedBy = ctx
    ? `${ctx.descriptionId} ${ctx.invalid ? ctx.errorId : ''}`.trim()
    : ariaDescribedby

  // react-strict-dom omits some web-only props from its types, but the
  // underlying DOM element supports them. Type-assert to pass them through.
  const extraProps: Record<string, unknown> = {}
  if (pattern !== undefined) extraProps.pattern = pattern
  if (autoFocus) extraProps.autoFocus = true
  if (readOnly) extraProps.readOnly = true
  if (maxLength !== undefined) extraProps.maxLength = maxLength
  if (min !== undefined) extraProps.min = min
  if (max !== undefined) extraProps.max = max
  if (step !== undefined) extraProps.step = step
  if (inputMode !== undefined) extraProps.inputMode = inputMode
  if (list !== undefined) extraProps.list = list
  if (ariaLabel !== undefined) extraProps['aria-label'] = ariaLabel

  return (
    <html.input
      id={id ?? ctx?.controlId}
      type={type}
      name={effectiveName}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
      autoComplete={autoComplete}
      value={effectiveValue}
      defaultValue={defaultValue}
      disabled={effectiveDisabled}
      aria-describedby={describedBy || undefined}
      aria-invalid={ctx?.invalid || variant === 'error' || undefined}
      onChange={effectiveOnChange as StrictInputProps['onChange']}
      onBlur={effectiveOnBlur as StrictInputProps['onBlur']}
      ref={effectiveRef as React.Ref<HTMLInputElement>}
      style={[
        styles.base,
        styles[effectiveVariant],
        font === 'mono' && styles.mono,
        groupCtx?.inGroup && styles.inGroup,
      ]}
      {...extraProps}
    />
  )
}
