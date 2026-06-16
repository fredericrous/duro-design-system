import {html} from 'react-strict-dom'
import {useFieldContext} from '../Field/FieldContext'
import {styles} from './styles.css'

interface ColorInputProps {
  /** Hex color, controlled (e.g. "#cfc8ba"). */
  value?: string
  defaultValue?: string
  name?: string
  /** Explicit id — overrides the Field-context controlId when set. */
  id?: string
  disabled?: boolean
  required?: boolean
  /** Accessible name when there is no associated <Field.Label>. */
  'aria-label'?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  ref?: React.Ref<HTMLInputElement>
}

/**
 * A styled native `<input type="color">` swatch. Mirrors <Input>'s native
 * surface (value/defaultValue/name/onChange/ref/disabled/required) and adopts
 * the parent <Field.Root> context (controlId for label association, value/
 * onChange when bound to a Form, invalid border, disabled) — so it drops into a
 * <Field> exactly like <Input>. The text <Input> can't render type=color, hence
 * a dedicated leaf.
 */
export function ColorInput({
  value,
  defaultValue,
  name,
  id,
  disabled,
  required,
  'aria-label': ariaLabel,
  onChange,
  onBlur,
  ref,
}: ColorInputProps) {
  const ctx = useFieldContext()
  const fieldCtx = ctx?.field

  const effectiveName = name ?? fieldCtx?.name
  const effectiveValue = value ?? (fieldCtx ? String(fieldCtx.value ?? '') : undefined)
  const effectiveOnChange = onChange ?? fieldCtx?.onChange
  const effectiveOnBlur = onBlur ?? fieldCtx?.onBlur
  const effectiveRef = ref ?? fieldCtx?.ref
  const effectiveDisabled = disabled ?? ctx?.disabled

  return (
    <html.input
      type="color"
      id={id ?? ctx?.controlId}
      name={effectiveName}
      value={effectiveValue}
      defaultValue={defaultValue}
      disabled={effectiveDisabled}
      required={required}
      aria-label={ariaLabel}
      aria-invalid={ctx?.invalid || undefined}
      aria-describedby={
        ctx
          ? `${ctx.descriptionId} ${ctx.invalid ? ctx.errorId : ''}`.trim() || undefined
          : undefined
      }
      onChange={effectiveOnChange as React.ComponentProps<typeof html.input>['onChange']}
      onBlur={effectiveOnBlur as React.ComponentProps<typeof html.input>['onBlur']}
      ref={effectiveRef as React.Ref<HTMLInputElement>}
      style={[styles.base, ctx?.invalid && styles.invalid, effectiveDisabled && styles.disabled]}
    />
  )
}
