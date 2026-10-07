import {createContext, useContext} from 'react'

export interface ToolbarContextValue {
  register: (id: string, el: HTMLElement, disabled: boolean) => () => void
  /** 0 for the toolbar's one tab stop, -1 for the rest; undefined before
   *  the control has registered (server render, first paint). */
  tabIndexOf: (id: string) => 0 | -1 | undefined
  onItemFocus: (id: string) => void
}

export const ToolbarContext = createContext<ToolbarContextValue | null>(null)

export function useToolbar() {
  return useContext(ToolbarContext)
}
