import {type ReactNode, useCallback, useId, useMemo, useRef} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {useControllableValue} from '../../hooks/useControllableValue'
import {isPlainClick, type LinkClickEvent, type OnNavigate} from '../../shared/navigate'
import {
  TableOfContentsContext,
  useTableOfContents,
  type TableOfContentsVariant,
} from './TableOfContentsContext'

/* TableOfContents — the "On this page" list of a long page's sections: a
 * labelled `nav` of in-page links. The section being read is `value`; its item
 * carries `aria-current="location"` and a marker bar plus a heavier weight, so
 * colour is never the only cue. Which section is being read is the app's to
 * work out (an IntersectionObserver over the headings): the component does no
 * scroll-spy.
 *
 * `variant="menu"` is the narrow-screen form: a disclosure button (with
 * `aria-expanded`) that shows the same list below it, and closes again when an
 * item is followed or on Escape. */

// --- Root ---

/**
 * The disclosure state (`open`, `defaultOpen`, `onOpenChange`) exists only on
 * the menu: the list variant has no button, so it takes none of them.
 */
type RootProps = {
  /** Names the landmark ("On this page"); required, from your text catalog. */
  'aria-label': string
  /** The id of the section being read; the Item whose href is `#<value>` is active. */
  value?: string | null
  /**
   * Visible title: the caption above the list, or the menu button's text.
   * The menu button falls back to `aria-label`; the list shows none without it.
   */
  label?: ReactNode
  children: ReactNode
} & (
  | {
      /** `list` (default) for a sidebar; `menu` for a narrow screen, behind a disclosure button (only `menu` takes open / defaultOpen / onOpenChange). */
      variant?: 'list'
      open?: never
      defaultOpen?: never
      onOpenChange?: never
    }
  | {
      /** `list` (default) for a sidebar; `menu` for a narrow screen, behind a disclosure button (only `menu` takes open / defaultOpen / onOpenChange). */
      variant: 'menu'
      /** Whether the list is shown (controlled). */
      open?: boolean
      /** Whether the list starts shown (uncontrolled; default false). */
      defaultOpen?: boolean
      onOpenChange?: (open: boolean) => void
    }
)

function Root({
  'aria-label': ariaLabel,
  value = null,
  variant = 'list',
  label,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: RootProps) {
  const [open, setOpen] = useControllableValue(openProp, defaultOpen, onOpenChange)
  const listId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const isMenu = variant === 'menu'

  const close = useCallback(() => {
    if (isMenu && open) setOpen(false)
  }, [isMenu, open, setOpen])

  const ctx = useMemo(() => ({value, variant, close}), [value, variant, close])

  const list = (
    <html.ul id={isMenu ? listId : undefined} style={[styles.list, isMenu && styles.listMenu]}>
      {children}
    </html.ul>
  )

  return (
    <TableOfContentsContext.Provider value={ctx}>
      <html.nav
        aria-label={ariaLabel}
        onKeyDown={(e: {key: string}) => {
          if (isMenu && open && e.key === 'Escape') {
            setOpen(false)
            triggerRef.current?.focus()
          }
        }}
        style={styles.root}
      >
        {isMenu ? (
          <>
            <html.button
              ref={triggerRef}
              type="button"
              aria-expanded={open}
              aria-controls={open ? listId : undefined}
              onClick={() => setOpen(!open)}
              style={[styles.trigger, styles.focusable]}
            >
              <html.span>{label ?? ariaLabel}</html.span>
              <html.span aria-hidden style={[styles.chevron, open && styles.chevronOpen]}>
                ▾
              </html.span>
            </html.button>
            {open ? list : null}
          </>
        ) : (
          <>
            {label != null ? <html.div style={styles.caption}>{label}</html.div> : null}
            {list}
          </>
        )}
      </html.nav>
    </TableOfContentsContext.Provider>
  )
}

// --- Item ---

interface ItemProps {
  /** The section's anchor, `#<heading id>`. */
  href: string
  /** The heading's level: 2, or 3 (indented under the 2 before it). */
  level?: 2 | 3
  /**
   * Client-side navigation: called for a plain primary click (no modifier
   * key). Call `event.preventDefault()`, then scroll or navigate yourself.
   */
  onNavigate?: OnNavigate
  children: ReactNode
}

function Item({href, level = 2, onNavigate, children}: ItemProps) {
  const {value, variant, close} = useTableOfContents()
  const active = value != null && href === `#${value}`
  return (
    <html.li style={styles.item}>
      <html.a
        href={href}
        aria-current={active ? 'location' : undefined}
        onClick={(e: LinkClickEvent) => {
          if (!isPlainClick(e)) return
          onNavigate?.(href, e)
          close()
        }}
        style={[
          styles.link,
          styles.focusable,
          variant === 'menu' && styles.linkMenu,
          level === 3 && styles.level3,
          active && styles.linkActive,
        ]}
      >
        {children}
      </html.a>
    </html.li>
  )
}

export const TableOfContents = {
  Root,
  Item,
}

export type {TableOfContentsVariant}
