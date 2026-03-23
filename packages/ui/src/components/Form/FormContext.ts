import {createContext, useContext} from 'react'

export type LabelPosition = 'top' | 'side'
export type NecessityIndicator = 'icon' | 'label' | false

export interface FormContextValue {
  disabled: boolean
  labelPosition: LabelPosition
  necessityIndicator: NecessityIndicator
}

export const FormContext = createContext<FormContextValue | null>(null)

export function useFormContext() {
  return useContext(FormContext)
}
