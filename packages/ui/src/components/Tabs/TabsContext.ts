import {createContext, useContext} from 'react'

export type Orientation = 'horizontal' | 'vertical'

export interface TabsContextValue {
  activeValue: string | null
  onSelect: (value: string) => void
  orientation: Orientation
  registerTab: (value: string, disabled: boolean) => () => void
  tabsRef: React.RefObject<Map<string, boolean>>
  orderRef: React.RefObject<string[]>
  // True once the List has measured the active tab and is driving a sliding
  // indicator. Tabs suppress their own accent border while it's true so the
  // single sliding bar is the only underline; it stays false without JS
  // (SSR / no-hydration), where the per-tab border is the graceful fallback.
  indicatorActive: boolean
  setIndicatorActive: (active: boolean) => void
}

export const TabsContext = createContext<TabsContextValue | null>(null)

export function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs compound components must be used within Tabs.Root')
  return ctx
}
