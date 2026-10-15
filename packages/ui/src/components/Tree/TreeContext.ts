import {createContext, useContext} from 'react'
import type {TreeFocusStore} from './TreeFocusStore'

export interface TreeContextValue {
  /** the selected item's value (single selection), or null */
  selectedValue: string | null
  onSelect: (value: string) => void
  isExpanded: (value: string) => boolean
  toggle: (value: string) => void
  setExpanded: (value: string, expanded: boolean) => void
  /** the tab stop and the focus ring: rows subscribe, the tree does not re-render */
  focus: TreeFocusStore
  /** native: names a branch's chevron control from the item's text */
  expandLabel?: (label: string) => string
}

export const TreeContext = createContext<TreeContextValue | null>(null)

export function useTree() {
  const ctx = useContext(TreeContext)
  if (!ctx) throw new Error('Tree compound components must be used within Tree.Root')
  return ctx
}

/** The nesting depth of the items rendered here (1 = top level). */
export const TreeLevelContext = createContext(1)
