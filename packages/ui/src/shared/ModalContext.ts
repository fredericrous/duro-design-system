import {createContext, useContext} from 'react'

/**
 * True inside a Dialog or Drawer. A Popover reads it to pick its layer: inside
 * a modal it must clear that modal (`layers.popover`); outside one it stays at
 * `layers.floating`, so a modal opened later, even from inside the Popover,
 * covers it.
 *
 * holds-until: a Dialog opened from a Popover that itself sits inside a Dialog
 * still renders under that Popover (1000/1001 < 1040). It is fixed when a
 * nested Dialog lifts its layer above its opener, or when the parent Popover
 * closes on a nested modal opening; no consumer needs it yet.
 */
export const ModalContext = createContext(false)

export function useInModal() {
  return useContext(ModalContext)
}
