import {type ReactNode, useId} from 'react'
import {TreeRow} from './TreeRow'
import {useTree} from './TreeContext'
import {useTreeRowFocus} from './TreeFocusStore'
import type {WindowedRow} from './TreeRowProps'
import type {OnNavigate} from '../../shared/navigate'

interface TreeItemRowProps {
  value: string
  level: number
  label: ReactNode
  meta?: ReactNode
  text: string
  href?: string
  onNavigate?: OnNavigate
  hasChildren: boolean
  open: boolean
  /** the open branch's children (nested tree), none in a windowed one */
  branch: ReactNode
  windowed?: WindowedRow
}

/**
 * One row of the tree with its state: the selection from the tree, and the
 * tab stop and ring from the focus store, which this row alone subscribes to.
 * Shared by the nested `Tree.Item` and the windowed rows.
 */
export function TreeItemRow({
  value,
  level,
  label,
  meta,
  text,
  href,
  onNavigate,
  hasChildren,
  open,
  branch,
  windowed,
}: TreeItemRowProps) {
  const {selectedValue, onSelect, toggle, focus, expandLabel} = useTree()
  const rowFocus = useTreeRowFocus(focus, value)
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
      selected={selectedValue === value}
      tabStop={rowFocus !== 'none'}
      ringed={rowFocus === 'ringed'}
      labelId={labelId}
      metaId={metaId}
      onSelect={() => onSelect(value)}
      onToggle={() => toggle(value)}
      expandLabel={expandLabel}
      branch={branch}
      windowed={windowed}
    />
  )
}
