import {type ReactNode, createContext, useContext, useMemo} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'

// --- Types ---

export type ListSelectionMode = 'none' | 'single' | 'multiple'

// --- Context ---

interface ListContextValue {
  selectionMode: ListSelectionMode
}

const ListContext = createContext<ListContextValue>({selectionMode: 'none'})

function useList() {
  return useContext(ListContext)
}

// --- Root ---

interface RootProps {
  children: ReactNode
  /** Selection mode: 'none' (default), 'single', or 'multiple' */
  selectionMode?: ListSelectionMode
  /** Accessible label for the list */
  'aria-label'?: string
}

function Root({children, selectionMode = 'none', 'aria-label': ariaLabel}: RootProps) {
  return (
    <ListContext.Provider value={{selectionMode}}>
      <html.div role="list" aria-label={ariaLabel} style={styles.root}>
        {children}
      </html.div>
    </ListContext.Provider>
  )
}

// --- Item ---

interface ItemProps {
  children: ReactNode
  /** Whether this item is selected */
  selected?: boolean
  /** Whether this item is disabled */
  disabled?: boolean
  /** Click handler for the item */
  onClick?: () => void
}

// What a clickable Item hands its Content, which becomes the item's button.
interface ItemActionValue {
  onClick: () => void
  disabled: boolean
}

const ItemActionContext = createContext<ItemActionValue | null>(null)

function Item({children, selected, disabled, onClick}: ItemProps) {
  const {selectionMode} = useList()
  const isSelectable = selectionMode !== 'none'
  const action = useMemo(
    () => (onClick ? {onClick, disabled: disabled === true} : null),
    [onClick, disabled],
  )

  return (
    <ItemActionContext.Provider value={action}>
      <html.div
        role="listitem"
        aria-selected={isSelectable ? selected : undefined}
        aria-disabled={disabled || undefined}
        // A press anywhere on the row; the Content's button is what keyboards and screen
        // readers reach.
        onClick={disabled ? undefined : onClick}
        style={[
          styles.item,
          onClick != null && !disabled && styles.itemClickable,
          selected && styles.itemSelected,
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
  if (!action) return <html.div style={styles.content}>{children}</html.div>
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

// --- Text: primary label ---

function ItemText({children}: {children: ReactNode}) {
  return <html.p style={styles.text}>{children}</html.p>
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
  Content,
  Text: ItemText,
  Description,
  Actions,
  Empty,
}
