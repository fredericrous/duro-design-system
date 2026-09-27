import {createContext, useContext} from 'react'

export interface TreeContextValue {
  /** the selected item's value (single selection), or null */
  selectedValue: string | null
  onSelect: (value: string) => void
  isExpanded: (value: string) => boolean
  toggle: (value: string) => void
  setExpanded: (value: string, expanded: boolean) => void
  /** the item holding the tree's single tab stop (roving tabindex) */
  focusValue: string | null
  setFocusValue: (value: string) => void
  /** the focus holder is focused from the keyboard (draws its ring) */
  keyboardFocus: boolean
}

export const TreeContext = createContext<TreeContextValue | null>(null)

export function useTree() {
  const ctx = useContext(TreeContext)
  if (!ctx) throw new Error('Tree compound components must be used within Tree.Root')
  return ctx
}

/** The nesting depth of the items rendered here (1 = top level). */
export const TreeLevelContext = createContext(1)
