import {createContext, useContext, type ComponentType, type ReactNode} from 'react'

export type LabelPosition = 'top' | 'side'
export type NecessityIndicator = 'icon' | 'label' | false

/** What a Field inside a Form is bound to: the form library's field state,
 *  in the shape the Field's controls read from FieldContext. */
export interface FieldBinding {
  value: unknown
  onChange: (...event: unknown[]) => void
  onBlur: () => void
  ref: React.RefCallback<unknown>
  name: string
  errorMessage?: string
}

/**
 * Binds one named field to the enclosing form and hands its state to
 * `children`. Form (at `@duro-app/ui/form`) supplies it through FormContext,
 * so Field — which lives at the package root — never imports the form
 * library: a root import reaches no `react-hook-form` / `@hookform/*`, and
 * those peers stay genuinely optional.
 */
export type FieldBinder = ComponentType<{
  name: string
  children: (binding: FieldBinding) => ReactNode
}>

export interface FormContextValue {
  disabled: boolean
  labelPosition: LabelPosition
  necessityIndicator: NecessityIndicator
  /** Supplied by Form; a Field.Root with a `name` renders through it. */
  FieldBinder: FieldBinder
}

export const FormContext = createContext<FormContextValue | null>(null)

export function useFormContext() {
  return useContext(FormContext)
}
