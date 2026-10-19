import {useCallback, useRef} from 'react'
import {html} from 'react-strict-dom'
import {useFieldContext} from '../Field/FieldContext'
import type {ListboxAnchorProps} from '../Listbox/Listbox'
import {useAutoGrowFallback} from './useAutoGrowFallback'
import {grow} from './grow'
import {styles} from './styles.css'

type StrictTextareaProps = React.ComponentProps<typeof html.textarea>

export type TextareaVariant = 'default' | 'error'

/** `maxRows` only means something on a field that grows. */
type GrowProps =
  | {
      /** The height follows the content, from `rows` up to `maxRows`, then it scrolls. */
      autoGrow: true
      /** The most rows the field shows before it scrolls. Default: no limit */
      maxRows?: number
    }
  | {autoGrow?: false; maxRows?: never}

type TextareaProps = Partial<ListboxAnchorProps> & GrowProps & TextareaBaseProps

interface TextareaBaseProps {
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
  autoGrow,
  maxRows,
  role,
  'aria-controls': ariaControls,
  'aria-expanded': ariaExpanded,
  'aria-activedescendant': ariaActiveDescendant,
  'aria-autocomplete': ariaAutocomplete,
  'aria-haspopup': ariaHasPopup,
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

  // Without CSS field-sizing, measure the content after each render.
  const innerRef = useRef<HTMLTextAreaElement | null>(null)
  const setRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      innerRef.current = el
      if (typeof effectiveRef === 'function') effectiveRef(el)
      else if (effectiveRef) (effectiveRef as {current: unknown}).current = el
    },
    [effectiveRef],
  )
  useAutoGrowFallback(innerRef, autoGrow ? 'content' : 'fixed')

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
      role={role}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-activedescendant={ariaActiveDescendant}
      aria-autocomplete={ariaAutocomplete}
      aria-haspopup={ariaHasPopup}
      ref={setRef}
      style={[
        styles.base,
        styles[effectiveVariant],
        autoGrow && grow.autoGrow,
        autoGrow && maxRows !== undefined && grow.maxRows(maxRows),
      ]}
      {...extraProps}
    />
  )
}
