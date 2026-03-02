import {createContext, useContext} from 'react'

export interface ScrollAreaContextValue {
  viewportRef: React.RefObject<HTMLDivElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
  scrollTop: number
  scrollLeft: number
  scrollHeight: number
  scrollWidth: number
  clientHeight: number
  clientWidth: number
  scrolling: boolean
}

export const ScrollAreaContext = createContext<ScrollAreaContextValue | null>(null)

export function useScrollArea() {
  const ctx = useContext(ScrollAreaContext)
  if (!ctx) throw new Error('ScrollArea compound components must be used within ScrollArea.Root')
  return ctx
}
