import {createContext, useContext} from 'react'

export interface MenuContextValue {
  open: boolean
  toggle: () => void
  /** Close the menu; focus returns to the trigger unless `restoreFocus` is false. */
  close: (options?: {restoreFocus?: boolean}) => void
  menuId: string
  triggerId: string
  highlightedId: string | null
  setHighlightedId: (id: string | null) => void
  registerItem: (id: string, element: HTMLElement) => () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  popupRef: React.RefObject<HTMLDivElement | null>
}

export const MenuContext = createContext<MenuContextValue | null>(null)

export function useMenu() {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error('Menu compound components must be used within Menu.Root')
  return ctx
}
