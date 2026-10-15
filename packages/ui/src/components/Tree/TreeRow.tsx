import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import type {TreeRowProps} from './TreeRowProps'
import {isPlainClick, type LinkClickEvent} from '../../shared/navigate'

/* The web row of a Tree.Item: the treeitem `li` with its aria, the row as a
 * real link (href) or a div, the chevron, the label and the meta. Hook-free:
 * Tree.Item owns the state. TreeRow.native.tsx is the native counterpart. */
export function TreeRow({
  value,
  level,
  label,
  meta,
  text,
  href,
  onNavigate,
  hasChildren,
  open,
  selected,
  tabStop,
  ringed,
  labelId,
  metaId,
  onSelect,
  onToggle,
  branch,
}: TreeRowProps) {
  const rowStyles = [
    styles.indent(level),
    selected && styles.rowSelected,
    ringed && styles.rowFocused,
  ]
  const rowContent = (
    <>
      <html.span
        aria-hidden
        onClick={
          hasChildren
            ? (e: {stopPropagation: () => void; preventDefault: () => void}) => {
                // the chevron only toggles: it never selects, nor follows a link
                e.stopPropagation()
                e.preventDefault()
                onToggle()
              }
            : undefined
        }
        style={[styles.chevron, open && styles.chevronOpen, !hasChildren && styles.chevronLeaf]}
      >
        ▸
      </html.span>
      <html.span id={labelId} style={styles.label}>
        {label}
      </html.span>
      {meta != null ? (
        <html.span id={metaId} style={styles.meta}>
          {meta}
        </html.span>
      ) : null}
    </>
  )

  return (
    <html.li
      role="treeitem"
      aria-labelledby={meta != null ? `${labelId} ${metaId}` : labelId}
      aria-level={level}
      aria-expanded={hasChildren ? open : undefined}
      aria-selected={selected}
      tabIndex={tabStop ? 0 : -1}
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
            onSelect()
            onNavigate?.(href, e)
          }}
          style={[styles.row, styles.rowLink, ...rowStyles]}
        >
          {rowContent}
        </html.a>
      ) : (
        <html.div onClick={onSelect} style={[styles.row, ...rowStyles]}>
          {rowContent}
        </html.div>
      )}
      {open ? (
        <html.ul role="group" style={styles.group}>
          {branch}
        </html.ul>
      ) : null}
    </html.li>
  )
}
