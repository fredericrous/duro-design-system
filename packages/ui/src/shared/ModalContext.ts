import {createContext, useContext} from 'react'

/**
 * True inside a Dialog or Drawer. A Popover reads it to pick its layer: inside
 * a modal it must clear that modal (`layers.popover`); outside one it stays at
 * `layers.floating`, so a modal opened later, even from inside the Popover,
 * covers it.
 */
export const ModalContext = createContext(false)

export function useInModal() {
  return useContext(ModalContext)
}
