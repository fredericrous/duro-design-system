import {type ReactNode, useState, useCallback, useRef, useEffect} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {useControllableValue} from '../../hooks/useControllableValue'
import {SideNavContext, useSideNav} from './SideNavContext'

// --- Root ---

interface RootProps {
  children: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function Root({children, value: controlledValue, defaultValue, onValueChange}: RootProps) {
  const [activeValue, onSelect] = useControllableValue<string | null>(
    controlledValue,
    defaultValue ?? null,
    onValueChange
      ? (v) => {
          if (v !== null) onValueChange(v)
        }
      : undefined,
  )
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const orderRef = useRef<string[]>([])

  const toggleGroup = useCallback((group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(group)) {
        next.delete(group)
      } else {
        next.add(group)
      }
      return next
    })
  }, [])

  // Idempotent expand — never closes an already-open group. The mount effects
  // in Group (defaultExpanded + auto-expand-active) use this instead of
  // toggleGroup so a group that qualifies on both counts stays open rather than
  // being toggled open-then-closed.
  const expandGroup = useCallback((group: string) => {
    setExpandedGroups((prev) => {
      if (prev.has(group)) return prev
      const next = new Set(prev)
      next.add(group)
      return next
    })
  }, [])

  const registerItem = useCallback((value: string) => {
    if (!orderRef.current.includes(value)) {
      orderRef.current.push(value)
    }
    return () => {
      orderRef.current = orderRef.current.filter((v) => v !== value)
    }
  }, [])

  return (
    <SideNavContext.Provider
      value={{
        activeValue,
        onSelect,
        expandedGroups,
        toggleGroup,
        expandGroup,
        registerItem,
        orderRef,
      }}
    >
      <html.nav role="navigation" style={styles.root}>
        {children}
      </html.nav>
    </SideNavContext.Provider>
  )
}

// --- Group ---

interface GroupProps {
  children: ReactNode
  label: string
  groupKey?: string
  defaultExpanded?: boolean
}

function Group({children, label, groupKey, defaultExpanded}: GroupProps) {
  const key = groupKey ?? label
  const {expandedGroups, toggleGroup, expandGroup, activeValue} = useSideNav()
  const isExpanded = expandedGroups.has(key)
  const groupRef = useRef<HTMLDivElement>(null)

  // Auto-expand if this group contains the active item. Uses expandGroup (not
  // toggleGroup) so it never races the defaultExpanded effect into a closed
  // state when the active item lives in a defaultExpanded group.
  useEffect(() => {
    if (!activeValue || expandedGroups.has(key)) return
    const el = groupRef.current
    if (!el) return
    const activeBtn = el.querySelector(`[data-nav-value="${activeValue}"]`)
    if (activeBtn) {
      expandGroup(key)
    }
  }, [activeValue, key, expandedGroups, expandGroup])

  // Expand on first render if defaultExpanded (idempotent add, not a toggle).
  useEffect(() => {
    if (defaultExpanded) {
      expandGroup(key)
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasActiveChild = (() => {
    if (!activeValue || !groupRef.current) return false
    return !!groupRef.current.querySelector(`[data-nav-value="${activeValue}"]`)
  })()

  return (
    <html.div ref={groupRef} style={styles.group}>
      <html.button
        type="button"
        onClick={() => toggleGroup(key)}
        style={[styles.groupTrigger, hasActiveChild && styles.groupTriggerActive]}
        aria-expanded={isExpanded}
      >
        <html.span style={[styles.chevron, isExpanded && styles.chevronOpen]}>
          <svg
            width={10}
            height={10}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </html.span>
        {label}
      </html.button>
      {isExpanded && children}
    </html.div>
  )
}

// --- Section ---

interface SectionProps {
  children: ReactNode
  label: string
}

/**
 * A static, non-collapsible grouping: an always-visible uppercase header with
 * its items below. Unlike `Group` there is no chevron, toggle, or hidden state
 * — use it when every section should stay open at a glance (a flat menu with
 * labelled regions rather than an accordion).
 */
function Section({children, label}: SectionProps) {
  return (
    <html.div style={styles.section}>
      <html.div style={styles.sectionLabel}>{label}</html.div>
      {children}
    </html.div>
  )
}

// --- Item ---

interface ItemProps {
  value: string
  children: ReactNode
  /** Optional leading glyph (e.g. a design-system `<Icon />`). Inherits the
   *  item's text color, so it turns accent when the item is active. */
  icon?: ReactNode
}

function Item({value, children, icon}: ItemProps) {
  const {activeValue, onSelect, registerItem} = useSideNav()
  const isActive = activeValue === value

  useEffect(() => {
    return registerItem(value)
  }, [value, registerItem])

  return (
    <html.button
      type="button"
      data-nav-value={value}
      onClick={() => onSelect(value)}
      style={[styles.item, isActive && styles.itemActive]}
      aria-current={isActive ? 'page' : undefined}
    >
      <html.span aria-hidden style={[styles.marker, isActive && styles.markerActive]} />
      {icon ? (
        <html.span aria-hidden style={styles.itemIcon}>
          {icon}
        </html.span>
      ) : null}
      <html.span style={styles.itemLabel}>{children}</html.span>
    </html.button>
  )
}

export const SideNav = {
  Root,
  Group,
  Section,
  Item,
}
