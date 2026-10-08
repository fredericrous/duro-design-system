import {type RefObject, createContext, useContext, useLayoutEffect} from 'react'

// A Popover's nested popups (a Select listbox, a Combobox listbox, a child
// Popover) are portalled out of its DOM subtree. They register here so a press
// on them counts as inside the Popover.
export interface PopoverLayerContextValue {
  register: (el: Element) => () => void
  /** Set by a `raised` Popup for what it holds, so a Popover nested in it is
   *  raised too and is not drawn under its parent. */
  raised?: boolean
}

export const PopoverLayerContext = createContext<PopoverLayerContextValue | null>(null)

/** Register the ref's element as part of the enclosing Popover's layer while `active`. */
export function usePopoverLayer(ref: RefObject<Element | null>, {active}: {active: boolean}) {
  const layer = useContext(PopoverLayerContext)
  useLayoutEffect(() => {
    const el = ref.current
    if (!layer || !active || !el) return
    return layer.register(el)
  }, [layer, active, ref])
}
