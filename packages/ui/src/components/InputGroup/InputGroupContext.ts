import {createContext, useContext} from 'react'

interface InputGroupContextValue {
  inGroup: boolean
}

export const InputGroupContext = createContext<InputGroupContextValue | null>(null)

export function useInputGroupContext() {
  return useContext(InputGroupContext)
}
