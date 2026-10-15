import {Children, type ReactNode, useCallback, useContext, useId, useRef, useState} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {TreeRow} from './TreeRow'
import {TreeContext, TreeLevelContext, useTree} from './TreeContext'
import {useTreeKeyboard} from './useTreeKeyboard'
import type {OnNavigate} from '../../shared/navigate'

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
  /**
   * Native: the accessible name of a branch's chevron control, from the item's
   * text (its `textValue`, else a string `label`). Defaults to that text.
   */
  expandLabel?: (label: string) => string
}

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
  expandLabel,
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

  useTreeKeyboard({
    rootRef,
    focusValue,
    setFocusValue,
    setKeyboardFocus,
    open,
    children,
    onSelect,
    setExpanded,
  })

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
        expandLabel,
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
  const {selectedValue, onSelect, isExpanded, toggle, focusValue, keyboardFocus, expandLabel} =
    useTree()
  const level = useContext(TreeLevelContext)
  const hasChildren = Children.count(children) > 0
  const open = hasChildren && isExpanded(value)
  const selected = selectedValue === value
  const text = textValue ?? (typeof label === 'string' ? label : '')
  // named by its own label (and meta) only: a branch's content includes its
  // children, and a name computed from content would read the whole subtree
  const labelId = useId()
  const metaId = useId()

  return (
    <TreeRow
      value={value}
      level={level}
      label={label}
      meta={meta}
      text={text}
      href={href}
      onNavigate={onNavigate}
      hasChildren={hasChildren}
      open={open}
      selected={selected}
      tabStop={focusValue === value}
      ringed={keyboardFocus && focusValue === value}
      labelId={labelId}
      metaId={metaId}
      onSelect={() => onSelect(value)}
      onToggle={() => toggle(value)}
      expandLabel={expandLabel}
      branch={<TreeLevelContext.Provider value={level + 1}>{children}</TreeLevelContext.Provider>}
    />
  )
}

export const Tree = {
  Root,
  Item,
}
