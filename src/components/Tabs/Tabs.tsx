import { type ReactNode, createContext, useContext, useState, useCallback, useRef, useId, useEffect } from "react"
import { html } from "react-strict-dom"
import { styles } from "./styles.css"

// --- Context ---

type Orientation = "horizontal" | "vertical"

interface TabsContextValue {
  activeValue: string | null
  onSelect: (value: string) => void
  orientation: Orientation
  registerTab: (value: string, disabled: boolean) => () => void
  tabsRef: React.RefObject<Map<string, boolean>>
  orderRef: React.RefObject<string[]>
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error("Tabs compound components must be used within Tabs.Root")
  return ctx
}

// --- Root ---

interface RootProps {
  children: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: Orientation
}

function Root({
  children,
  value: controlledValue,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
}: RootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? null)
  const tabsRef = useRef(new Map<string, boolean>())
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

  const registerTab = useCallback((value: string, disabled: boolean) => {
    tabsRef.current.set(value, disabled)
    if (!orderRef.current.includes(value)) {
      orderRef.current.push(value)
    }
    return () => {
      tabsRef.current.delete(value)
      orderRef.current = orderRef.current.filter((v) => v !== value)
    }
  }, [])

  return (
    <TabsContext.Provider value={{ activeValue, onSelect, orientation, registerTab, tabsRef, orderRef }}>
      <html.div style={[styles.root, orientation === "vertical" && styles.rootVertical]}>{children}</html.div>
    </TabsContext.Provider>
  )
}

// --- List ---

interface ListProps {
  children: ReactNode
}

function List({ children }: ListProps) {
  const { orientation, activeValue, onSelect, tabsRef, orderRef } = useTabs()
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (!el) return

    function handleKeyDown(this: HTMLElement, e: KeyboardEvent) {
      const order = orderRef.current
      const tabs = tabsRef.current
      if (order.length === 0) return
      const listEl = this

      const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp"
      const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown"

      let targetValue: string | null = null

      switch (e.key) {
        case nextKey: {
          e.preventDefault()
          const currentIdx = activeValue ? order.indexOf(activeValue) : -1
          for (let i = 1; i <= order.length; i++) {
            const idx = (currentIdx + i) % order.length
            const val = order[idx]
            if (!tabs.get(val)) {
              targetValue = val
              break
            }
          }
          break
        }
        case prevKey: {
          e.preventDefault()
          const currentIdx = activeValue ? order.indexOf(activeValue) : 0
          for (let i = 1; i <= order.length; i++) {
            const idx = (currentIdx - i + order.length) % order.length
            const val = order[idx]
            if (!tabs.get(val)) {
              targetValue = val
              break
            }
          }
          break
        }
        case "Home": {
          e.preventDefault()
          for (const val of order) {
            if (!tabs.get(val)) {
              targetValue = val
              break
            }
          }
          break
        }
        case "End": {
          e.preventDefault()
          for (let i = order.length - 1; i >= 0; i--) {
            if (!tabs.get(order[i])) {
              targetValue = order[i]
              break
            }
          }
          break
        }
      }

      if (targetValue) {
        onSelect(targetValue)
        // Focus the newly activated tab button
        const tabEl = listEl.querySelector(`[data-tab-value="${targetValue}"]`) as HTMLElement | null
        tabEl?.focus()
      }
    }

    el.addEventListener("keydown", handleKeyDown)
    return () => el.removeEventListener("keydown", handleKeyDown)
  }, [orientation, activeValue, onSelect, tabsRef, orderRef])

  return (
    <html.div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      style={[styles.list, orientation === "vertical" && styles.listVertical]}
    >
      {children}
    </html.div>
  )
}

// --- Tab ---

interface TabProps {
  value: string
  disabled?: boolean
  children: ReactNode
}

function Tab({ value, disabled = false, children }: TabProps) {
  const { activeValue, onSelect, orientation, registerTab } = useTabs()
  const isActive = activeValue === value
  const tabId = useId()
  const panelId = `${tabId}-panel`

  useEffect(() => {
    return registerTab(value, disabled)
  }, [value, disabled, registerTab])

  const handleClick = () => {
    if (!disabled) {
      onSelect(value)
    }
  }

  return (
    <html.button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      aria-disabled={disabled || undefined}
      data-tab-value={value}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      style={[
        styles.tab,
        orientation === "vertical" && styles.tabVertical,
        isActive && (orientation === "vertical" ? styles.tabActiveVertical : styles.tabActiveHorizontal),
        disabled && styles.tabDisabled,
      ]}
    >
      {children}
    </html.button>
  )
}

// --- Panel ---

interface PanelProps {
  value: string
  children: ReactNode
}

function Panel({ value, children }: PanelProps) {
  const { activeValue, orientation } = useTabs()

  if (activeValue !== value) return null

  return (
    <html.div role="tabpanel" style={[styles.panel, orientation === "vertical" && styles.panelVertical]}>
      {children}
    </html.div>
  )
}

export const Tabs = {
  Root,
  List,
  Tab,
  Panel,
}
