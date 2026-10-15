import {Children, type ReactNode, useCallback, useContext, useRef, useState} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {TreeContext, TreeLevelContext, useTree} from './TreeContext'
import {createTreeFocusStore} from './TreeFocusStore'
import {TreeItemRow} from './TreeItemRow'
import {devWarnOnce} from '../../shared/devWarnOnce'
import {collectRows, itemText, type TreeItemProps, type TreeRowModel} from './TreeRows'
import {CAN_WINDOW, TreeWindow} from './TreeWindow'
import {useTreeKeyboard} from './useTreeKeyboard'
import type {Length} from '../../shared/length'

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
 * the link, through `onNavigate` when given.
 *
 * Past `virtualizeThreshold` items (web) the tree is windowed: a collect pass
 * reads the items' props into rows, and only the rows in view are mounted, as
 * flat treeitems with aria-level, aria-setsize and aria-posinset. */

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
  /**
   * Web: with more items than this (open or not) the tree mounts only the rows
   * in view. At or below it, every row is mounted. Default 150.
   */
  virtualizeThreshold?: number
  /** Web, windowed: caps the scroll viewport's height; without it, it fills its parent. */
  maxHeight?: Length
}

/** Rows of a tree that is not collected (native renders every item itself). */
const NO_ROWS: TreeRowModel[] = []

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
  virtualizeThreshold = 150,
  maxHeight,
}: RootProps) {
  const [selectedInner, setSelectedInner] = useState<string | null>(defaultValue)
  const selectedValue = value !== undefined ? value : selectedInner
  const [expandedInner, setExpandedInner] = useState<ReadonlyArray<string>>(defaultExpanded)
  const open = expanded ?? expandedInner
  // the tab stop and the ring (on the focused ROW: the item wraps its
  // children, so a ring on it would circle the whole branch; only for keyboard
  // focus) live in a store the rows subscribe to: a focus move re-renders the
  // old and the new row, not the tree
  const [focus] = useState(() => createTreeFocusStore(selectedValue))
  const listRef = useRef<HTMLUListElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)

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

  const {rows, total, complete} = CAN_WINDOW
    ? collectRows(children, (el) => el.type === Item, isExpanded)
    : {rows: NO_ROWS, total: 0, complete: true}
  const windowed = CAN_WINDOW && complete && total > virtualizeThreshold
  if (CAN_WINDOW && !complete && total > virtualizeThreshold) {
    devWarnOnce(
      'Tree',
      'window-needs-items',
      'Tree is past virtualizeThreshold but some rows come from a component wrapping Tree.Item, which the collect pass cannot see: it renders every row unwindowed. Render Tree.Item directly (map over data) to window it.',
    )
  }

  useTreeKeyboard({
    rootRef: windowed ? windowRef : listRef,
    focus,
    windowedRows: windowed ? rows : null,
    children,
    open,
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
        focus,
        expandLabel,
      }}
    >
      <TreeLevelContext.Provider value={1}>
        {windowed ? (
          <TreeWindow
            rows={rows}
            maxHeight={maxHeight}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            scrollRef={windowRef}
          />
        ) : (
          <html.ul
            ref={listRef}
            role="tree"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            style={styles.root}
          >
            {children}
          </html.ul>
        )}
      </TreeLevelContext.Provider>
    </TreeContext.Provider>
  )
}

// --- Item ---

function Item({value, label, textValue, children, meta, href, onNavigate}: TreeItemProps) {
  const {isExpanded} = useTree()
  const level = useContext(TreeLevelContext)
  const hasChildren = Children.count(children) > 0

  return (
    <TreeItemRow
      value={value}
      level={level}
      label={label}
      meta={meta}
      text={itemText(label, textValue)}
      href={href}
      onNavigate={onNavigate}
      hasChildren={hasChildren}
      open={hasChildren && isExpanded(value)}
      branch={<TreeLevelContext.Provider value={level + 1}>{children}</TreeLevelContext.Provider>}
    />
  )
}

export const Tree = {
  Root,
  Item,
}
