import {createContext, useContext} from 'react'
import type {Orientation} from '../../shared/types'

/** Where a control sits in an attached group. */
export type GroupPosition = 'first' | 'middle' | 'last' | 'only'

export interface ButtonGroupContextValue {
  orientation: Orientation
  register: (id: string, el: HTMLElement, disabled: boolean) => () => void
  /** `middle` until the control has registered (server render, first paint). */
  positionOf: (id: string) => GroupPosition
}

/** Provided by an `attached` ButtonGroup only; null everywhere else. */
export const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null)

export function useButtonGroup() {
  return useContext(ButtonGroupContext)
}
