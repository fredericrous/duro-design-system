import {useCallback, useRef, useState} from 'react'

export interface MenuOpenOptions {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * The menu's open state, controlled or not, shared by both platforms (plan
 * N0, Decision 10). Focus, highlight and keys are each platform's adapter:
 * `useMenuRoot` on the web, Menu.native on native.
 */
export function useMenuOpen({open: openProp, defaultOpen = false, onOpenChange}: MenuOpenOptions) {
  const [inner, setInner] = useState(defaultOpen)
  const controlled = openProp !== undefined
  const open = controlled ? openProp : inner
  const openRef = useRef(open)
  openRef.current = open
  const onOpenChangeRef = useRef(onOpenChange)
  onOpenChangeRef.current = onOpenChange

  const setOpen = useCallback(
    (next: boolean) => {
      if (next === openRef.current) return
      if (!controlled) setInner(next)
      onOpenChangeRef.current?.(next)
    },
    [controlled],
  )

  return {open, openRef, setOpen}
}
