import {createContext, useContext} from 'react'
import type {ToggleSize} from '../Toggle/Toggle'
import type {Orientation} from '../../shared/types'

export type {Orientation}

export interface ToggleGroupContextValue {
  value: string[]
  toggle: (itemValue: string) => void
  disabled: boolean
  orientation: Orientation
  size: ToggleSize
  /** Items wrap onto rows with their own borders (and roving focus). */
  wrap: boolean
  /** The item holding the group's single tab stop (wrap only). */
  tabStopValue: string | null
  register: (itemValue: string, el: HTMLElement) => () => void
  onItemFocus: (itemValue: string) => void
}

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null)

export function useToggleGroup() {
  return useContext(ToggleGroupContext)
}
