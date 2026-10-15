import {type RefObject, useEffect, useLayoutEffect, useRef} from 'react'
import type {TreeFocusStore} from './TreeFocusStore'
import type {TreeRowModel} from './TreeRows'

/** Typed characters within this many ms build one typeahead prefix. */
const TYPEAHEAD_RESET_MS = 500

interface TreeKeyboardInput {
  rootRef: RefObject<HTMLElement | null>
  focus: TreeFocusStore
  /** the visible rows when the tree is windowed (most are not in the DOM), else null */
  windowedRows: readonly TreeRowModel[] | null
  /** a change here re-checks the tab stop: the items or the open branches */
  children: unknown
  open: ReadonlyArray<string>
  onSelect: (value: string) => void
  setExpanded: (value: string, open: boolean) => void
}

/** What navigation needs of an item, from the row model or from the DOM. */
interface NavItem {
  value: string
  text: string
  /** undefined for a leaf */
  expanded: boolean | undefined
  parent: string | null
}

const itemSelector = (value: string) => `[data-tree-value="${CSS.escape(value)}"]`

/** The rendered treeitems as nav items: DOM order IS the visible order. */
function readDom(root: HTMLElement): NavItem[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[role="treeitem"]')).map((el) => {
    const expanded = el.getAttribute('aria-expanded')
    const parent = el.parentElement?.closest<HTMLElement>('[role="treeitem"]')
    return {
      value: el.dataset.treeValue ?? '',
      text: el.dataset.treeText ?? '',
      expanded: expanded === null ? undefined : expanded === 'true',
      parent: parent && root.contains(parent) ? (parent.dataset.treeValue ?? null) : null,
    }
  })
}

function readRows(rows: readonly TreeRowModel[]): NavItem[] {
  return rows.map((row) => ({
    value: row.value,
    text: row.text,
    expanded: row.hasChildren ? row.open : undefined,
    parent: row.parent,
  }))
}

/**
 * Web: the tree's roving tab stop, arrow keys, Home/End, Enter and typeahead
 * (WAI-ARIA tree pattern). A nested tree reads its items from the DOM; a
 * windowed one from the row model, since most rows are not mounted: a move to
 * a row that is not mounted goes through the focus store, and the window
 * scrolls to it and focuses it. Native has none of them (plan N0, Decision 6):
 * useTreeKeyboard.native.ts.
 */
export function useTreeKeyboard({
  rootRef,
  focus,
  windowedRows,
  children,
  open,
  onSelect,
  setExpanded,
}: TreeKeyboardInput) {
  // Exactly one item is tabbable: the focus holder, else the selection, else
  // the first item — re-checked when an item appears, closes or goes away.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (root.querySelector('[role="treeitem"][tabindex="0"]')) return
    const first =
      windowedRows?.[0]?.value ??
      root.querySelector<HTMLElement>('[role="treeitem"]')?.dataset.treeValue ??
      null
    focus.setValue(first)
  }, [rootRef, focus, windowedRows, children, open])

  const typeahead = useRef({text: '', at: 0})
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const rootEl = root
    const read = () => (windowedRows ? readRows(windowedRows) : readDom(rootEl))
    const focusItem = (item: NavItem | undefined) => {
      if (!item) return
      const el = rootEl.querySelector<HTMLElement>(itemSelector(item.value))
      if (el) el.focus()
      else focus.request(item.value)
    }
    function onKeyDown(e: KeyboardEvent) {
      const current = (e.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]')
      if (!current || !rootEl.contains(current)) return
      const list = read()
      const val = current.dataset.treeValue ?? ''
      const i = list.findIndex((item) => item.value === val)
      const here = list[i]
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
          if (here?.expanded === false) setExpanded(val, true)
          else if (here?.expanded === true) focusItem(list[i + 1])
          return
        case 'ArrowLeft': {
          e.preventDefault()
          if (here?.expanded === true) {
            setExpanded(val, false)
            return
          }
          focusItem(list.find((item) => item.value === here?.parent))
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
          const item = list[(start + k) % list.length]
          if (item.text.toLocaleLowerCase().startsWith(needle)) {
            focusItem(item)
            break
          }
        }
      }
    }
    // the roving tab stop follows focus, however it moved (keys or pointer)
    function onFocusIn(e: FocusEvent) {
      const item = (e.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]')
      const v = item?.dataset.treeValue
      if (v) focus.setValue(v)
      focus.setRing(item?.matches(':focus-visible') ?? false)
    }
    function onFocusOut(e: FocusEvent) {
      if (!rootEl.contains(e.relatedTarget as Node | null)) focus.setRing(false)
    }
    const onPointerDown = () => focus.setRing(false)
    const onKey = () => focus.setRing(true)
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
  }, [rootRef, focus, windowedRows, onSelect, setExpanded])
}
