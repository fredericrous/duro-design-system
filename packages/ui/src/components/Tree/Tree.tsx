import {
  Children,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {TreeContext, TreeLevelContext, useTree} from './TreeContext'
import {isPlainClick, type LinkClickEvent, type OnNavigate} from '../../shared/navigate'

/* Tree — a hierarchy of items (the WAI-ARIA tree pattern): single selection,
 * expandable branches, one tab stop (roving tabindex), and the keyboard of a
 * file explorer — ↑/↓ move between visible items, → opens a branch then goes
 * to its first child, ← closes it then goes to the parent, Home/End, Enter
 * or Space select, and typing jumps to the next item whose label starts with
 * the typed letters.
 *
 * An item with `href` renders its row as a real link (cmd-click opens a tab,
 * "Copy link" works) that stays out of the tab order: the treeitem keeps the
 * single tab stop and the keyboard above, and Enter or Space on it follows
 * the link, through `onNavigate` when given. */

// --- Root ---

interface RootProps {
  children: ReactNode
  /** accessible name of the tree (or give `aria-labelledby`) */
  'aria-label'?: string
  'aria-labelledby'?: string
  /** the selected item (controlled) */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string) => void
  /** the open branches (controlled) */
  expanded?: ReadonlyArray<string>
  defaultExpanded?: ReadonlyArray<string>
  onExpandedChange?: (expanded: string[]) => void
}

const TYPEAHEAD_RESET_MS = 500

function Root({
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  value,
  defaultValue = null,
  onValueChange,
  expanded,
  defaultExpanded = [],
  onExpandedChange,
}: RootProps) {
  const [selectedInner, setSelectedInner] = useState<string | null>(defaultValue)
  const selectedValue = value !== undefined ? value : selectedInner
  const [expandedInner, setExpandedInner] = useState<ReadonlyArray<string>>(defaultExpanded)
  const open = expanded ?? expandedInner
  const [focusValue, setFocusValue] = useState<string | null>(selectedValue)
  // the ring shows on the focused ROW (the item wraps its children, so a
  // ring on it would circle the whole branch), only for keyboard focus —
  // the tree's own :focus-visible
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const rootRef = useRef<HTMLUListElement>(null)

  const onSelect = useCallback(
    (v: string) => {
      if (value === undefined) setSelectedInner(v)
      onValueChange?.(v)
    },
    [value, onValueChange],
  )
  const setExpanded = useCallback(
    (v: string, isOpen: boolean) => {
      const next = isOpen ? [...new Set([...open, v])] : open.filter((x) => x !== v)
      if (next.length === open.length && next.every((x, i) => x === open[i])) return
      if (expanded === undefined) setExpandedInner(next)
      onExpandedChange?.(next)
    },
    [open, expanded, onExpandedChange],
  )
  const isExpanded = useCallback((v: string) => open.includes(v), [open])
  const toggle = useCallback((v: string) => setExpanded(v, !open.includes(v)), [open, setExpanded])

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
  }, [focusValue, open, children])

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
  }, [onSelect, setExpanded])

  return (
    <TreeContext.Provider
      value={{
        selectedValue,
        onSelect,
        isExpanded,
        toggle,
        setExpanded,
        focusValue,
        setFocusValue,
        keyboardFocus,
      }}
    >
      <TreeLevelContext.Provider value={1}>
        <html.ul
          ref={rootRef}
          role="tree"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          style={styles.root}
        >
          {children}
        </html.ul>
      </TreeLevelContext.Provider>
    </TreeContext.Provider>
  )
}

// --- Item ---

interface ItemProps {
  /** unique within the tree */
  value: string
  /** what the row shows */
  label: ReactNode
  /** plain text for typeahead when `label` isn't a string */
  textValue?: string
  /** nested items: the branch's children (none = a leaf) */
  children?: ReactNode
  /** trailing content on the row (a count, a status) */
  meta?: ReactNode
  /**
   * Makes the row a link to this URL. A plain click (or Enter / Space)
   * selects the item and calls `onNavigate`; a modified click keeps the
   * browser default (new tab, new window) and does not select.
   */
  href?: string
  /**
   * Client-side navigation for `href`: called for a plain primary click. Call
   * `event.preventDefault()`, then your router's navigate.
   */
  onNavigate?: OnNavigate
}

function Item({value, label, textValue, children, meta, href, onNavigate}: ItemProps) {
  const {selectedValue, onSelect, isExpanded, toggle, focusValue, keyboardFocus} = useTree()
  const level = useContext(TreeLevelContext)
  const hasChildren = Children.count(children) > 0
  const open = hasChildren && isExpanded(value)
  const selected = selectedValue === value
  const text = textValue ?? (typeof label === 'string' ? label : '')
  // named by its own label only: a branch's content includes its children,
  // and a name computed from content would read the whole subtree
  const labelId = useId()
  const rowStyles = [
    styles.indent(level),
    selected && styles.rowSelected,
    keyboardFocus && focusValue === value && styles.rowFocused,
  ]
  const rowContent = (
    <>
      <html.span
        aria-hidden
        onClick={(e: {stopPropagation: () => void; preventDefault: () => void}) => {
          if (!hasChildren) return
          // the chevron only toggles: it never selects, nor follows a link
          e.stopPropagation()
          e.preventDefault()
          toggle(value)
        }}
        style={[styles.chevron, open && styles.chevronOpen, !hasChildren && styles.chevronLeaf]}
      >
        ▸
      </html.span>
      <html.span id={labelId} style={styles.label}>
        {label}
      </html.span>
      {meta != null ? <html.span style={styles.meta}>{meta}</html.span> : null}
    </>
  )

  return (
    <html.li
      role="treeitem"
      aria-labelledby={labelId}
      aria-level={level}
      aria-expanded={hasChildren ? open : undefined}
      aria-selected={selected}
      tabIndex={focusValue === value ? 0 : -1}
      data-tree-value={value}
      data-tree-text={text}
      style={styles.item}
    >
      {href !== undefined ? (
        <html.a
          href={href}
          tabIndex={-1}
          data-tree-link=""
          onClick={(e: LinkClickEvent) => {
            if (!isPlainClick(e)) return
            onSelect(value)
            onNavigate?.(href, e)
          }}
          style={[styles.row, styles.rowLink, ...rowStyles]}
        >
          {rowContent}
        </html.a>
      ) : (
        <html.div onClick={() => onSelect(value)} style={[styles.row, ...rowStyles]}>
          {rowContent}
        </html.div>
      )}
      {open ? (
        <TreeLevelContext.Provider value={level + 1}>
          <html.ul role="group" style={styles.group}>
            {children}
          </html.ul>
        </TreeLevelContext.Provider>
      ) : null}
    </html.li>
  )
}

export const Tree = {
  Root,
  Item,
}
