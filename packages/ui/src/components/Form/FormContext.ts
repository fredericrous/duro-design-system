import {createContext, useContext} from 'react'

export const FormContext = createContext(false)

export function useFormContext() {
  return useContext(FormContext)
}
