import {type ReactNode, useEffect, useId, useRef} from 'react'
import {html} from 'react-strict-dom'
import {resolveLength, type Length} from '../../shared/length'
import {Icon} from '../Icon/Icon'
import {useTabKeys} from '../Tabs/useTabKeys'
import {useTabsRoot} from '../Tabs/useTabsRoot'
import {itemId, MasterDetailContext, useMasterDetail} from './MasterDetailContext'
import {Scroller} from './Scroller'
import {styles} from './styles.css'
import {useStacked} from './useStacked'

// --- Root ---

interface RootProps {
  /** A Rail and a Detail. */
  children: ReactNode
  /** The value of the focused Item, which the Detail shows. Controlled. */
  focusedValue?: string
  /** The value focused first. Give one: the rail is reached through its focused item. */
  defaultFocusedValue?: string
  onFocusedValueChange?: (value: string) => void
  /** Width of the rail, a `sizes` token key; it never takes more than 30% of the width. Default: `railW`. */
  railWidth?: Length
  /** Cap of the height, a `sizes` token key: the rail and the detail scroll inside it. Default: `pickerMaxH`. */
  maxHeight?: Length
}

function Root({
  children,
  focusedValue,
  defaultFocusedValue,
  onFocusedValueChange,
  railWidth = 'railW',
  maxHeight = 'pickerMaxH',
}: RootProps) {
  const tabs = useTabsRoot({
    value: focusedValue,
    defaultValue: defaultFocusedValue,
    onValueChange: onFocusedValueChange,
    orientation: 'vertical',
  })
  const idPrefix = useId()
  const stacked = useStacked()
  return (
    <MasterDetailContext.Provider value={{tabs, idPrefix, railWidth, maxHeight, stacked}}>
      <html.div
        style={[
          styles.root,
          stacked && styles.rootStacked,
          styles.rootMaxHeight(resolveLength(maxHeight)),
        ]}
      >
        <Scroller enabled={stacked}>{children}</Scroller>
      </html.div>
    </MasterDetailContext.Provider>
  )
}

// --- Rail ---

interface RailProps {
  /** Items, optionally in Sections. */
  children: ReactNode
  /** Accessible name of the rail. */
  'aria-label': string
}

function Rail({children, 'aria-label': ariaLabel}: RailProps) {
  const {tabs, railWidth, stacked} = useMasterDetail('Rail')
  const listRef = useRef<HTMLDivElement>(null)
  useTabKeys({
    listRef,
    orientation: 'vertical',
    activeValue: tabs.activeValue,
    onSelect: tabs.onSelect,
    tabsRef: tabs.tabsRef,
    orderRef: tabs.orderRef,
  })
  return (
    <html.div
      ref={listRef}
      role="tablist"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      style={[
        styles.rail,
        styles.railWidth(resolveLength(railWidth)),
        stacked && styles.railStacked,
      ]}
    >
      <Scroller enabled={!stacked}>{children}</Scroller>
    </html.div>
  )
}

// --- Section ---

interface SectionProps {
  children: ReactNode
  /** The section's heading, which also names the group. */
  title: string
  /** How many items the section holds, shown beside the heading. */
  count?: number
}

function Section({children, title, count}: SectionProps) {
  const titleId = useId()
  return (
    <html.div role="group" aria-labelledby={titleId} style={styles.section}>
      <html.div style={styles.sectionHeader}>
        <html.p id={titleId} style={styles.sectionTitle}>
          {title}
        </html.p>
        {count != null ? <html.span style={styles.sectionCount}>{count}</html.span> : null}
      </html.div>
      {children}
    </html.div>
  )
}

// --- Item ---

interface ItemProps {
  /** Names the item; the Detail shows the content for the focused item's value. */
  value: string
  /** The item's label. */
  children: ReactNode
  /** Marks the item as the chosen one, with a check (apart from the focused item, which only shows its detail). */
  selected?: boolean
  disabled?: boolean
  /** A control after the label (a remove button). It sits beside the item's button, never inside it. */
  action?: ReactNode
  /**
   * Called when the item is pressed (a click, or Enter or Space on it), after
   * it takes focus. Arrow keys move the focus and the detail without calling
   * it, so this is where a choice is made (`onFocusedValueChange` follows the
   * arrows too).
   */
  onActivate?: () => void
}

function Item({
  value,
  children,
  selected = false,
  disabled = false,
  action,
  onActivate,
}: ItemProps) {
  const {tabs, idPrefix} = useMasterDetail('Item')
  const {activeValue, onSelect, registerTab} = tabs
  const isFocused = activeValue === value

  useEffect(() => registerTab(value, disabled), [registerTab, value, disabled])

  return (
    <html.div
      style={[styles.item, isFocused && styles.itemFocused, disabled && styles.itemDisabled]}
    >
      <html.button
        type="button"
        role="tab"
        id={itemId(idPrefix, value)}
        aria-selected={isFocused}
        aria-controls={`${idPrefix}-detail`}
        aria-current={selected || undefined}
        aria-disabled={disabled || undefined}
        data-tab-value={value}
        tabIndex={isFocused ? 0 : -1}
        onClick={
          disabled
            ? undefined
            : () => {
                onSelect(value)
                onActivate?.()
              }
        }
        style={styles.itemButton}
      >
        <html.span style={styles.itemLabel}>{children}</html.span>
        {selected ? (
          <html.span aria-hidden style={styles.itemCheck}>
            <Icon name="check-done" size="sm" />
          </html.span>
        ) : null}
      </html.button>
      {action != null ? <html.div style={styles.itemAction}>{action}</html.div> : null}
    </html.div>
  )
}

// --- Detail ---

interface DetailProps {
  /** The content for the focused value: a node, or a function of the value. */
  children: ReactNode | ((focusedValue: string) => ReactNode)
}

function Detail({children}: DetailProps) {
  const {tabs, idPrefix, stacked} = useMasterDetail('Detail')
  const focused = tabs.activeValue
  if (focused === null) return null
  return (
    <html.div
      id={`${idPrefix}-detail`}
      role="tabpanel"
      aria-labelledby={itemId(idPrefix, focused)}
      style={[styles.detail, stacked && styles.detailStacked]}
    >
      <Scroller enabled={!stacked}>
        {typeof children === 'function' ? children(focused) : children}
      </Scroller>
    </html.div>
  )
}

export const MasterDetail = {
  Root,
  Rail,
  Section,
  Item,
  Detail,
}
