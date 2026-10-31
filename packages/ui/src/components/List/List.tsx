import {
  Children,
  type ReactNode,
  createContext,
  isValidElement,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react'
import {html} from 'react-strict-dom'
import type {OnNavigate} from '../../shared/navigate'
import {
  ItemLink,
  createItemLinkState,
  pressItemLink,
  type ItemLinkState,
  type RowPress,
} from './ItemLink'
import {styles, textColorStyles} from './styles.css'
import type {TextColor} from '../Text/Text'

// --- Types ---

export type ListSelectionMode = 'none' | 'single' | 'multiple'

// --- Context ---

interface ListContextValue {
  selectionMode: ListSelectionMode
}

const ListContext = createContext<ListContextValue>({selectionMode: 'none'})

// The Root's last item draws no divider below it: the list (or the card around it) ends there.
const LastItemContext = createContext(false)

function useList() {
  return useContext(ListContext)
}

// --- Root ---

interface RootProps {
  children: ReactNode
  /** Selection mode: 'none' (default), 'single', or 'multiple' */
  selectionMode?: ListSelectionMode
  /** Accessible label for the list; a `title` names the list instead. */
  'aria-label'?: string
  /** A heading-styled label above the list, which also names the list (aria-labelledby). */
  title?: ReactNode
  /** Muted text after the list: a count, a hint, a note. */
  footer?: ReactNode
}

function Root({
  children,
  selectionMode = 'none',
  'aria-label': ariaLabel,
  title,
  footer,
}: RootProps) {
  const titleId = useId()
  const hasTitle = title != null
  const list = (
    <html.div
      role="list"
      aria-label={hasTitle ? undefined : ariaLabel}
      aria-labelledby={hasTitle ? titleId : undefined}
      style={styles.root}
    >
      {markLastItem(children)}
    </html.div>
  )
  return (
    <ListContext.Provider value={{selectionMode}}>
      {hasTitle || footer != null ? (
        <html.div style={styles.frame}>
          {hasTitle ? (
            <html.p id={titleId} style={styles.title}>
              {title}
            </html.p>
          ) : null}
          {list}
          {footer != null ? <html.p style={styles.footer}>{footer}</html.p> : null}
        </html.div>
      ) : (
        list
      )}
    </ListContext.Provider>
  )
}

/** The Root's children, the last one told it is last (a hidden conditional row is not counted). */
function markLastItem(children: ReactNode): ReactNode {
  const items = Children.toArray(children)
  return items.map((child, index) =>
    index === items.length - 1 ? (
      <LastItemContext.Provider key={isValidElement(child) ? child.key : index} value={true}>
        {child}
      </LastItemContext.Provider>
    ) : (
      child
    ),
  )
}

// --- Item ---

interface ItemBaseProps {
  children: ReactNode
  /** Whether this item is selected */
  selected?: boolean
  /** Whether this item is disabled */
  disabled?: boolean
}

interface PressItemProps extends ItemBaseProps {
  /** Click handler for the item */
  onClick?: () => void
  href?: undefined
  onNavigate?: undefined
}

interface LinkItemProps extends ItemBaseProps {
  /**
   * Makes the item's Content a link: a real `<a href>` on the web (a press through
   * `followLink` on native, ADR-0002). An item is a link or pressable, never both: `href`
   * excludes `onClick`.
   */
  href: string
  /**
   * Client-side navigation: called for a plain primary click (no modifier key); the browser
   * default runs for every other click. Call `event.preventDefault()`, then your router's
   * navigate. On native, without it a relative href goes to the system.
   */
  onNavigate?: OnNavigate
  onClick?: undefined
}

type ItemProps = PressItemProps | LinkItemProps

// What a pressable or linked Item hands its Content, which becomes the item's button or link.
type ItemAction =
  | {kind: 'press'; onClick: () => void; disabled: boolean}
  | {
      kind: 'link'
      href: string
      onNavigate: OnNavigate | undefined
      disabled: boolean
      linkState: ItemLinkState
    }

const ItemActionContext = createContext<ItemAction | null>(null)

function Item({children, selected, disabled, onClick, href, onNavigate}: ItemProps) {
  const {selectionMode} = useList()
  const isSelectable = selectionMode !== 'none'
  const isDisabled = disabled === true
  const isLast = useContext(LastItemContext)
  const [linkState] = useState(createItemLinkState)
  const action = useMemo<ItemAction | null>(() => {
    if (href !== undefined) return {kind: 'link', href, onNavigate, disabled: isDisabled, linkState}
    return onClick ? {kind: 'press', onClick, disabled: isDisabled} : null
  }, [href, onNavigate, onClick, isDisabled, linkState])
  // A press anywhere on a link row (its Leading icon, its padding) follows the link, as a
  // settings row does; a press on the Content's link is the link's own.
  const onRowClick =
    href !== undefined
      ? (press: RowPress) => pressItemLink(linkState, href, onNavigate, press)
      : onClick

  return (
    <ItemActionContext.Provider value={action}>
      <html.div
        role="listitem"
        aria-selected={isSelectable ? selected : undefined}
        aria-disabled={disabled || undefined}
        // A press anywhere on the row; the Content's button or link is what keyboards and
        // screen readers reach.
        onClick={disabled ? undefined : onRowClick}
        style={[
          styles.item,
          (onClick != null || href !== undefined) && !disabled && styles.itemClickable,
          selected && styles.itemSelected,
          isLast && styles.itemLast,
          disabled && styles.itemDisabled,
        ]}
      >
        {children}
      </html.div>
    </ItemActionContext.Provider>
  )
}

// --- Content: wraps primary text + description ---

function Content({children}: {children: ReactNode}) {
  const action = useContext(ItemActionContext)
  // A disabled link is plain text: an anchor without an href is not a link.
  if (!action || (action.kind === 'link' && action.disabled)) {
    return <html.div style={styles.content}>{children}</html.div>
  }
  if (action.kind === 'link') {
    return (
      <ItemLink state={action.linkState} href={action.href} onNavigate={action.onNavigate}>
        {children}
      </ItemLink>
    )
  }
  // In a clickable Item the Content is a real button: focusable, pressed with Enter or Space,
  // announced with its text. The Actions stay beside it, never nested inside.
  return (
    <html.button
      type="button"
      disabled={action.disabled}
      onClick={(event) => {
        // The row handles a press too; this one has been answered.
        event.stopPropagation()
        action.onClick()
      }}
      style={[styles.content, styles.contentButton]}
    >
      {children}
    </html.button>
  )
}

// --- Leading: icon or avatar before the Content ---

interface LeadingProps {
  children: ReactNode
  /** Names the slot for assistive tech; without it the slot is decorative and hidden from it. */
  'aria-label'?: string
}

function Leading({children, 'aria-label': ariaLabel}: LeadingProps) {
  return (
    <html.div
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      style={styles.leading}
    >
      {children}
    </html.div>
  )
}

// --- Text: primary label ---

/** `color` as Text's: `error` for a destructive row (Log out, Delete). */
function ItemText({children, color = 'default'}: {children: ReactNode; color?: TextColor}) {
  return <html.p style={[styles.text, textColorStyles[color]]}>{children}</html.p>
}

// --- Description: secondary text ---

function Description({children}: {children: ReactNode}) {
  return <html.p style={styles.description}>{children}</html.p>
}

// --- Actions: slot for buttons, badges, etc. ---

function Actions({children}: {children: ReactNode}) {
  return <html.div style={styles.actions}>{children}</html.div>
}

// --- Empty: placeholder when list has no items ---

function Empty({children}: {children: ReactNode}) {
  return (
    <html.div role="listitem" style={styles.empty}>
      {children}
    </html.div>
  )
}

// --- Export ---

export const List = {
  Root,
  Item,
  Leading,
  Content,
  Text: ItemText,
  Description,
  Actions,
  Empty,
}
