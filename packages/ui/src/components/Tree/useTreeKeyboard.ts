import {type ReactNode, useEffect, useLayoutEffect, useRef} from 'react'

/** Typed characters within this many ms build one typeahead prefix. */
const TYPEAHEAD_RESET_MS = 500

interface TreeKeyboardInput {
  rootRef: React.RefObject<HTMLUListElement | null>
  focusValue: string | null
  setFocusValue: (value: string | null) => void
  setKeyboardFocus: (on: boolean) => void
  open: ReadonlyArray<string>
  children: ReactNode
  onSelect: (value: string) => void
  setExpanded: (value: string, open: boolean) => void
}

/**
 * Web: the tree's roving tab stop, arrow keys, Home/End, Enter and typeahead
 * (WAI-ARIA tree pattern), read from the rendered DOM. Native has none of
 * them (plan N0, Decision 6): useTreeKeyboard.native.ts.
 */
export function useTreeKeyboard({
  rootRef,
  focusValue,
  setFocusValue,
  setKeyboardFocus,
  open,
  children,
  onSelect,
  setExpanded,
}: TreeKeyboardInput) {
  // Exactly one item is tabbable: the focus holder, else the selection, else
  // the first item — re-checked when an item appears, closes or goes away.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const tabbable = root.querySelector('[role="treeitem"][tabindex="0"]')
    if (tabbable) return
    const first = root.querySelector<HTMLElement>('[role="treeitem"]')
    const next = first?.dataset.treeValue ?? null
    if (next !== focusValue) setFocusValue(next)
  }, [rootRef, focusValue, setFocusValue, open, children])

  // Keyboard: DOM order over the rendered items IS the visible order (a
  // closed branch renders no children), so navigation reads it directly.
  const typeahead = useRef({text: '', at: 0})
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const rootEl = root
    const items = () => Array.from(rootEl.querySelectorAll<HTMLElement>('[role="treeitem"]'))
    const focusItem = (el: HTMLElement | null | undefined) => {
      if (!el) return
      el.focus()
    }
    function onKeyDown(e: KeyboardEvent) {
      const current = (e.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]')
      if (!current || !rootEl.contains(current)) return
      const list = items()
      const i = list.indexOf(current)
      const val = current.dataset.treeValue ?? ''
      const isOpen = current.getAttribute('aria-expanded')
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          focusItem(list[i + 1])
          return
        case 'ArrowUp':
          e.preventDefault()
          focusItem(list[i - 1])
          return
        case 'ArrowRight':
          e.preventDefault()
          if (isOpen === 'false') setExpanded(val, true)
          else if (isOpen === 'true') focusItem(list[i + 1])
          return
        case 'ArrowLeft': {
          e.preventDefault()
          if (isOpen === 'true') {
            setExpanded(val, false)
            return
          }
          const parent = current.parentElement?.closest<HTMLElement>('[role="treeitem"]')
          if (parent && rootEl.contains(parent)) focusItem(parent)
          return
        }
        case 'Home':
          e.preventDefault()
          focusItem(list[0])
          return
        case 'End':
          e.preventDefault()
          focusItem(list[list.length - 1])
          return
        case 'Enter':
        case ' ': {
          e.preventDefault()
          // an item with href: follow its link (the click selects it and
          // runs onNavigate, or the browser navigates)
          const link = current.querySelector<HTMLElement>(':scope > [data-tree-link]')
          if (link) link.click()
          else onSelect(val)
          return
        }
      }
      // typeahead: a printable character, no modifier
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const now = Date.now()
        const t = typeahead.current
        t.text = now - t.at > TYPEAHEAD_RESET_MS ? e.key : t.text + e.key
        t.at = now
        // the same letter typed again cycles through the items it starts;
        // a real prefix ("fi") narrows, and may match the current item
        const typed = t.text.toLocaleLowerCase()
        const repeat = [...typed].every((c) => c === typed[0])
        const needle = repeat ? typed[0] : typed
        const start = repeat ? i + 1 : i
        for (let k = 0; k < list.length; k++) {
          const el = list[(start + k) % list.length]
          if ((el.dataset.treeText ?? '').toLocaleLowerCase().startsWith(needle)) {
            focusItem(el)
            break
          }
        }
      }
    }
    // the roving tab stop follows focus, however it moved (keys or pointer)
    function onFocusIn(e: FocusEvent) {
      const item = (e.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]')
      const v = item?.dataset.treeValue
      if (v) setFocusValue(v)
      setKeyboardFocus(item?.matches(':focus-visible') ?? false)
    }
    function onFocusOut(e: FocusEvent) {
      if (!rootEl.contains(e.relatedTarget as Node | null)) setKeyboardFocus(false)
    }
    const onPointerDown = () => setKeyboardFocus(false)
    const onKey = () => setKeyboardFocus(true)
    root.addEventListener('keydown', onKeyDown)
    root.addEventListener('keydown', onKey)
    root.addEventListener('focusin', onFocusIn)
    root.addEventListener('focusout', onFocusOut)
    root.addEventListener('pointerdown', onPointerDown)
    return () => {
      root.removeEventListener('keydown', onKeyDown)
      root.removeEventListener('keydown', onKey)
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
      root.removeEventListener('pointerdown', onPointerDown)
    }
  }, [rootRef, onSelect, setExpanded, setFocusValue, setKeyboardFocus])
}
