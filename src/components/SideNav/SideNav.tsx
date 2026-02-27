import { type ReactNode, createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import { html } from "react-strict-dom"
import { styles } from "./styles.css"

// --- Context ---

interface SideNavContextValue {
  activeValue: string | null
  onSelect: (value: string) => void
  expandedGroups: Set<string>
  toggleGroup: (group: string) => void
  registerItem: (value: string) => () => void
  orderRef: React.RefObject<string[]>
}

const SideNavContext = createContext<SideNavContextValue | null>(null)

function useSideNav() {
  const ctx = useContext(SideNavContext)
  if (!ctx) throw new Error("SideNav compound components must be used within SideNav.Root")
  return ctx
}

// --- Root ---

interface RootProps {
  children: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function Root({ children, value: controlledValue, defaultValue, onValueChange }: RootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const orderRef = useRef<string[]>([])

  const activeValue = controlledValue !== undefined ? controlledValue : internalValue

  const onSelect = useCallback(
    (value: string) => {
      if (controlledValue === undefined) {
        setInternalValue(value)
      }
      onValueChange?.(value)
    },
    [controlledValue, onValueChange],
  )

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

  const registerItem = useCallback((value: string) => {
    if (!orderRef.current.includes(value)) {
      orderRef.current.push(value)
    }
    return () => {
      orderRef.current = orderRef.current.filter((v) => v !== value)
    }
  }, [])

  // Auto-expand group containing active value
  useEffect(() => {
    if (activeValue) {
      setExpandedGroups((prev) => {
        // We don't know which group it belongs to here — Group handles this
        return prev
      })
    }
  }, [activeValue])

  return (
    <SideNavContext.Provider value={{ activeValue, onSelect, expandedGroups, toggleGroup, registerItem, orderRef }}>
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

function Group({ children, label, groupKey, defaultExpanded }: GroupProps) {
  const key = groupKey ?? label
  const { expandedGroups, toggleGroup, activeValue } = useSideNav()
  const isExpanded = expandedGroups.has(key)
  const groupRef = useRef<HTMLDivElement>(null)

  // Auto-expand if this group contains the active item
  useEffect(() => {
    if (!activeValue || expandedGroups.has(key)) return
    const el = groupRef.current
    if (!el) return
    const activeBtn = el.querySelector(`[data-nav-value="${activeValue}"]`)
    if (activeBtn) {
      toggleGroup(key)
    }
  }, [activeValue, key, expandedGroups, toggleGroup])

  // Expand on first render if defaultExpanded
  useEffect(() => {
    if (defaultExpanded && !expandedGroups.has(key)) {
      toggleGroup(key)
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
          &#9656;
        </html.span>
        {label}
      </html.button>
      {isExpanded && children}
    </html.div>
  )
}

// --- Item ---

interface ItemProps {
  value: string
  children: ReactNode
}

function Item({ value, children }: ItemProps) {
  const { activeValue, onSelect, registerItem } = useSideNav()
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
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </html.button>
  )
}

export const SideNav = {
  Root,
  Group,
  Item,
}
