import {Children, Fragment, isValidElement, type ReactElement, type ReactNode} from 'react'
import type {OnNavigate} from '../../shared/navigate'

/** The props of a `Tree.Item`. */
export interface TreeItemProps {
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

/** One visible row of the tree, read from the items without rendering them. */
export interface TreeRowModel {
  value: string
  level: number
  text: string
  label: ReactNode
  meta: ReactNode
  href: string | undefined
  onNavigate: OnNavigate | undefined
  hasChildren: boolean
  open: boolean
  /** the value of the parent row, null at the top level */
  parent: string | null
  setSize: number
  posInSet: number
}

export interface CollectedRows {
  /** the rows in view order: an open branch is followed by its children */
  rows: TreeRowModel[]
  /** every item of the tree, open or not (what the threshold counts) */
  total: number
  /**
   * false when a branch holds something other than `Tree.Item`s (an item
   * inside another component): the pass cannot see those rows, so the tree
   * must not be windowed, or they would vanish
   */
  complete: boolean
}

/** The plain text of an item: typeahead and names. */
export function itemText(label: ReactNode, textValue: string | undefined): string {
  return textValue ?? (typeof label === 'string' ? label : '')
}

type ItemElement = ReactElement<TreeItemProps>

/** The `Tree.Item` elements among `children`, looking through fragments and arrays. */
function itemsOf(children: ReactNode, isItem: (el: ReactElement) => boolean): ItemElement[] {
  const out: ItemElement[] = []
  Children.forEach(children, (child) => {
    if (!isValidElement<{children?: ReactNode}>(child)) return
    if (child.type === Fragment) out.push(...itemsOf(child.props.children, isItem))
    else if (isItem(child)) out.push(child as ItemElement)
  })
  return out
}

/**
 * The collect pass: walks the `Tree.Item` elements of the tree and returns its
 * visible rows, with each row's level and its set size and position among its
 * siblings. It reads props only: no DOM, no render, no mutation of anything
 * outside this call. Items must be JSX descendants of the root (through
 * fragments or arrays); an item hidden inside another component is not seen.
 */
export function collectRows(
  children: ReactNode,
  isItem: (el: ReactElement) => boolean,
  isOpen: (value: string) => boolean,
): CollectedRows {
  const rows: TreeRowModel[] = []
  let total = 0
  let complete = true
  const visit = (nodes: ReactNode, level: number, parent: string | null, visible: boolean) => {
    const items = itemsOf(nodes, isItem)
    items.forEach((item, index) => {
      const {value, label, textValue, children: nested, meta, href, onNavigate} = item.props
      const hasChildren = Children.count(nested) > 0
      if (hasChildren && countLeaves(nested) !== itemsOf(nested, isItem).length) complete = false
      const open = hasChildren && isOpen(value)
      total += 1
      if (visible) {
        rows.push({
          value,
          level,
          text: itemText(label, textValue),
          label,
          meta,
          href,
          onNavigate,
          hasChildren,
          open,
          parent,
          setSize: items.length,
          posInSet: index + 1,
        })
      }
      if (hasChildren) visit(nested, level + 1, value, visible && open)
    })
  }
  visit(children, 1, null, true)
  if (countLeaves(children) !== itemsOf(children, isItem).length) complete = false
  return {rows, total, complete}
}

/** The non-fragment nodes among `children` (null, false and '' are not counted). */
function countLeaves(children: ReactNode): number {
  let n = 0
  Children.forEach(children, (child) => {
    if (child == null || typeof child === 'boolean' || child === '') return
    if (isValidElement<{children?: ReactNode}>(child) && child.type === Fragment) {
      n += countLeaves(child.props.children)
    } else n += 1
  })
  return n
}
