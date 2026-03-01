import { createContext, useContext } from "react"

export type Orientation = "horizontal" | "vertical"

export interface TabsContextValue {
  activeValue: string | null
  onSelect: (value: string) => void
  orientation: Orientation
  registerTab: (value: string, disabled: boolean) => () => void
  tabsRef: React.RefObject<Map<string, boolean>>
  orderRef: React.RefObject<string[]>
}

export const TabsContext = createContext<TabsContextValue | null>(null)

export function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error("Tabs compound components must be used within Tabs.Root")
  return ctx
}
