import {html} from 'react-strict-dom'
import {useFieldContext} from '../Field/FieldContext'
import {styles} from './styles.css'

type StrictTextareaProps = React.ComponentProps<typeof html.textarea>

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
  autoFocus?: boolean
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: () => void
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  /** Keyboard handlers — e.g. Enter to commit, Escape to cancel, arrow-key
   *  navigation of a list driven by this field. */
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  ref?: React.Ref<HTMLTextAreaElement>
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
  autoFocus,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  onKeyUp,
  ref,
}: TextareaProps) {
  const ctx = useFieldContext()

  const fieldCtx = ctx?.field
  const effectiveName = name ?? fieldCtx?.name
  const effectiveValue = value ?? (fieldCtx ? String(fieldCtx.value ?? '') : undefined)
  const effectiveOnChange = onChange ?? fieldCtx?.onChange
  const effectiveOnBlur = onBlur ?? fieldCtx?.onBlur
  const effectiveRef = ref ?? fieldCtx?.ref
  const effectiveDisabled = disabled ?? ctx?.disabled
  const effectiveVariant = ctx?.invalid ? 'error' : variant

  const extraProps: Record<string, unknown> = {}
  if (autoFocus) extraProps.autoFocus = true

  return (
    <html.textarea
      id={ctx?.controlId}
      name={effectiveName}
      placeholder={placeholder}
      required={required}
      rows={rows}
      value={effectiveValue}
      defaultValue={defaultValue}
      disabled={effectiveDisabled}
      aria-describedby={
        ctx ? `${ctx.descriptionId} ${ctx.invalid ? ctx.errorId : ''}`.trim() : undefined
      }
      aria-invalid={ctx?.invalid || variant === 'error' || undefined}
      onChange={effectiveOnChange as StrictTextareaProps['onChange']}
      onBlur={effectiveOnBlur as StrictTextareaProps['onBlur']}
      onFocus={onFocus as StrictTextareaProps['onFocus']}
      onKeyDown={onKeyDown as StrictTextareaProps['onKeyDown']}
      onKeyUp={onKeyUp as StrictTextareaProps['onKeyUp']}
      ref={effectiveRef as React.Ref<HTMLTextAreaElement>}
      style={[styles.base, styles[effectiveVariant]]}
      {...extraProps}
    />
  )
}
