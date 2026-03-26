import {createContext, useContext} from 'react'

export interface TagGroupContextValue {
  values: string[]
  addTag: (value: string) => void
  removeTag: (value: string) => void
  editable: boolean
  setEditable: (v: boolean) => void
  disabled: boolean
  validate?: (value: string) => true | string
  focusedIndex: number
  setFocusedIndex: (index: number) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  gridId: string
  name?: string
}

export const TagGroupContext = createContext<TagGroupContextValue | null>(null)

export function useTagGroup(): TagGroupContextValue | null {
  return useContext(TagGroupContext)
}
