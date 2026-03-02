import {createContext, useContext} from 'react'

export interface SelectContextValue {
  open: boolean
  toggle: () => void
  close: () => void
  value: string | null
  setValue: (value: string) => void
  labels: Record<string, string>
  registerLabel: (value: string, label: string) => void
  listboxId: string
  highlightedId: string | null
  setHighlightedId: (id: string | null) => void
  registerItem: (id: string, value: string, element: HTMLElement) => () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

export const SelectContext = createContext<SelectContextValue | null>(null)

export function useSelect() {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error('Select compound components must be used within Select.Root')
  return ctx
}
