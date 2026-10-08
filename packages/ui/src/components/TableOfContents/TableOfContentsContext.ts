import {createContext, useContext} from 'react'

export type TableOfContentsVariant = 'list' | 'menu'

export interface TableOfContentsContextValue {
  /** the id of the section being read (an Item is active when its href is `#<value>`) */
  value: string | null
  variant: TableOfContentsVariant
  /** closes the menu variant's disclosure (no-op for the list) */
  close: () => void
}

export const TableOfContentsContext = createContext<TableOfContentsContextValue | null>(null)

export function useTableOfContents() {
  const ctx = useContext(TableOfContentsContext)
  if (!ctx)
    throw new Error('TableOfContents compound components must be used within TableOfContents.Root')
  return ctx
}
