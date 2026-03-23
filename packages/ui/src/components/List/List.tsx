import {type ReactNode, createContext, useContext} from 'react'
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

function Item({children, selected, disabled, onClick}: ItemProps) {
  const {selectionMode} = useList()
  const isSelectable = selectionMode !== 'none'

  return (
    <html.div
      role="listitem"
      aria-selected={isSelectable ? selected : undefined}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      style={[
        styles.item,
        selected && styles.itemSelected,
        disabled && styles.itemDisabled,
      ]}
    >
      {children}
    </html.div>
  )
}

// --- Content: wraps primary text + description ---

function Content({children}: {children: ReactNode}) {
  return <html.div style={styles.content}>{children}</html.div>
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
