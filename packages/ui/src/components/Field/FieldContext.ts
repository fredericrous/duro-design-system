import {createContext, useContext} from 'react'
import type {LabelPosition, NecessityIndicator} from '../Form/FormContext'

interface FieldContextValue {
  controlId: string
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
