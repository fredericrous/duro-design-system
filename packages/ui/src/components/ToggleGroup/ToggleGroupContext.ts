import {createContext, useContext} from 'react'
import type {ToggleSize} from '../Toggle/Toggle'

export type Orientation = 'horizontal' | 'vertical'

export interface ToggleGroupContextValue {
  value: string[]
  toggle: (itemValue: string) => void
  disabled: boolean
  orientation: Orientation
  size: ToggleSize
}

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null)

export function useToggleGroup() {
  return useContext(ToggleGroupContext)
}
