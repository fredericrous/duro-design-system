import { createContext, useContext } from "react"

export interface SideNavContextValue {
  activeValue: string | null
  onSelect: (value: string) => void
  expandedGroups: Set<string>
  toggleGroup: (group: string) => void
  registerItem: (value: string) => () => void
  orderRef: React.RefObject<string[]>
}

export const SideNavContext = createContext<SideNavContextValue | null>(null)

export function useSideNav() {
  const ctx = useContext(SideNavContext)
  if (!ctx) throw new Error("SideNav compound components must be used within SideNav.Root")
  return ctx
}
