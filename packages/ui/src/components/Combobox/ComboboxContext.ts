import {createContext, useContext} from 'react'

export interface ComboboxContextValue {
  open: boolean
  openPopup: () => void
  close: () => void
  value: string | null
  setValue: (value: string) => void
  inputValue: string
  /** What filters the list: empty while the field shows the chosen option's label. */
  query: string
  setInputValue: (value: string) => void
  onInputFocus: () => void
  onInputBlur: () => void
  labels: Record<string, string>
  registerLabel: (value: string, label: string) => void
  listboxId: string
  highlightedId: string | null
  setHighlightedId: (id: string | null) => void
  registerItem: (id: string, value: string, element: HTMLElement) => () => void
  /** How many options the list shows now (mounted and not filtered out). */
  shownCount: number
  inputRef: React.RefObject<HTMLInputElement | null>
  rootRef: React.RefObject<HTMLDivElement | null>
}

export const ComboboxContext = createContext<ComboboxContextValue | null>(null)

export function useCombobox() {
  const ctx = useContext(ComboboxContext)
  if (!ctx) throw new Error('Combobox compound components must be used within Combobox.Root')
  return ctx
}
