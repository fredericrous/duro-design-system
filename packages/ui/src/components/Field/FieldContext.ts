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
  /** The control's own `validationMessage`, reported by the DOM `invalid` event. */
  nativeError?: string
  setNativeError?: (message: string | undefined) => void
}

export type {FieldContextValue}

export const FieldContext = createContext<FieldContextValue | null>(null)

export function useFieldContext() {
  return useContext(FieldContext)
}

interface NativeValidityTarget {
  validationMessage: string
  validity: {valid: boolean}
}

/** Wires a text control to its Field's native validation message: the DOM
 *  `invalid` event sets it, and a later change clears or refreshes it. The
 *  browser's own bubble is left alone. Outside a Field both handlers are
 *  undefined. Structural types: the native build (no DOM lib) types this too. */
export function useNativeValidation() {
  const ctx = useFieldContext()
  const setNativeError = ctx?.setNativeError
  if (!setNativeError) return {onInvalid: undefined, afterChange: undefined}
  const hasNativeError = ctx.nativeError !== undefined
  return {
    onInvalid: (event: {currentTarget: object}) =>
      setNativeError((event.currentTarget as NativeValidityTarget).validationMessage),
    afterChange: hasNativeError
      ? (event: {currentTarget: object}) => {
          // Native DOM typings lack the validity members on the element type.
          const target = event.currentTarget as NativeValidityTarget
          setNativeError(target.validity.valid ? undefined : target.validationMessage)
        }
      : undefined,
  }
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
