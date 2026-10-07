import {useCallback, useLayoutEffect, useRef, useState} from 'react'

/** A registered control: its id, in DOM order, and whether it is disabled. */
export interface RegisteredControl {
  id: string
  disabled: boolean
}

function sameEntries(a: RegisteredControl[], b: RegisteredControl[]) {
  return (
    a.length === b.length && a.every((e, i) => e.id === b[i].id && e.disabled === b[i].disabled)
  )
}

/**
 * Controls register their element here and come back in DOM order (the way
 * useRovingFocus orders a wrapping ToggleGroup). A control's place is read
 * from where it sits in the document, not from its parent: a Select or Menu
 * trigger sits inside its own Root, so `:first-child` cannot tell.
 *
 * Registration happens in a layout effect, so server-rendered HTML (and the
 * first client render) sees an empty registry.
 *
 * Keyed children can move without remounting, so the order is also re-read
 * after every commit of the owner; state changes only when the order did.
 */
export function useOrderedRegistry() {
  const elements = useRef(new Map<string, {el: HTMLElement; disabled: boolean}>())
  const [order, setOrder] = useState<RegisteredControl[]>([])

  const sync = useCallback(() => {
    const next = [...elements.current.entries()]
      .sort(([, a], [, b]) =>
        a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      )
      .map(([id, {disabled}]) => ({id, disabled}))
    setOrder((prev) => (sameEntries(prev, next) ? prev : next))
  }, [])

  const register = useCallback(
    (id: string, el: HTMLElement, disabled: boolean) => {
      elements.current.set(id, {el, disabled})
      sync()
      return () => {
        if (elements.current.get(id)?.el === el) elements.current.delete(id)
        sync()
      }
    },
    [sync],
  )

  useLayoutEffect(() => {
    sync()
  })

  return {elements, order, register}
}
