import {createContext, useContext} from 'react'
import type {LabelPosition, NecessityIndicator} from '../Form/FormContext'

interface FieldContextValue {
  controlId: string
  /** id of the Field.Label — what a GROUP control points `aria-labelledby` at. */
  labelId: string
  /** The control is a group (ToggleGroup, CheckboxGroup, RadioGroup, a set of
   *  checkboxes): the label names the group instead of pointing `for` at one
   *  input, which a group is not. */
  group?: boolean
  descriptionId: string
  errorId: string
  invalid: boolean
  required?: boolean
  disabled?: boolean
  labelPosition?: LabelPosition
  necessityIndicator?: NecessityIndicator
  field?: {
    value: unknown
    onChange: (...event: unknown[]) => void
    onBlur: () => void
    ref: React.RefCallback<unknown>
    name: string
  }
  errorMessage?: string
}

export type {FieldContextValue}

export const FieldContext = createContext<FieldContextValue | null>(null)

export function useFieldContext() {
  return useContext(FieldContext)
}

interface GroupLabelling {
  'aria-label'?: string
  'aria-labelledby'?: string
}

/** The accessible-name wiring for a group control: its own `aria-label` /
 *  `aria-labelledby` when given, else the enclosing Field's label and its
 *  description / error. Outside a Field with neither, the group is unnamed —
 *  pass one. */
export function useFieldGroupLabelling(own: GroupLabelling) {
  const ctx = useFieldContext()
  const describedBy = ctx ? `${ctx.descriptionId} ${ctx.invalid ? ctx.errorId : ''}`.trim() : ''
  return {
    'aria-label': own['aria-label'],
    'aria-labelledby': own['aria-labelledby'] ?? (own['aria-label'] ? undefined : ctx?.labelId),
    'aria-describedby': describedBy || undefined,
  }
}
