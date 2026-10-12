import {type ReactNode, useRef, useId, useEffect} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {isNative} from '../../platform'
import {TabsContext, useTabs} from './TabsContext'
import {useTabsRoot} from './useTabsRoot'
import {useTabIndicator} from './useTabIndicator'
import {useTabKeys} from './useTabKeys'
import {TabLayoutContext} from './indicator'
import {TabLayout} from './TabLayout'

// --- Root ---

interface RootProps {
  children: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
}

function Root({
  children,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
}: RootProps) {
  const ctx = useTabsRoot({value, defaultValue, onValueChange, orientation})

  return (
    <TabsContext.Provider value={ctx}>
      <html.div style={[styles.root, orientation === 'vertical' && styles.rootVertical]}>
        {children}
      </html.div>
    </TabsContext.Provider>
  )
}

// --- List ---

interface ListProps {
  children: ReactNode
}

function List({children}: ListProps) {
  const {orientation, activeValue, onSelect, tabsRef, orderRef, setIndicatorActive} = useTabs()
  const listRef = useRef<HTMLDivElement>(null)

  const {indicator, reportTabLayout} = useTabIndicator({
    listRef,
    activeValue,
    orientation,
    setIndicatorActive,
  })
  useTabKeys({listRef, orientation, activeValue, onSelect, tabsRef, orderRef})

  return (
    <html.div
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      style={[styles.list, orientation === 'vertical' && styles.listVertical]}
    >
      <TabLayoutContext.Provider value={reportTabLayout}>{children}</TabLayoutContext.Provider>
      {indicator && (
        <html.div
          aria-hidden
          style={[
            styles.indicator,
            orientation === 'horizontal' ? styles.indicatorHorizontal : styles.indicatorVertical,
            orientation === 'horizontal'
              ? styles.indicatorOffsetH(indicator.offset, indicator.size)
              : styles.indicatorOffsetV(indicator.offset, indicator.size),
          ]}
        />
      )}
    </html.div>
  )
}

// --- Tab ---

interface TabProps {
  value: string
  disabled?: boolean
  children: ReactNode
}

function Tab({value, disabled = false, children}: TabProps) {
  const {activeValue, onSelect, orientation, registerTab, indicatorActive} = useTabs()
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
    <TabLayout value={value}>
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
          isNative && styles.nativeFlex,
          orientation === 'vertical' && styles.tabVertical,
          isActive &&
            (orientation === 'vertical' ? styles.tabActiveVertical : styles.tabActiveHorizontal),
          isActive && indicatorActive && styles.tabIndicatorActive,
          disabled && styles.tabDisabled,
        ]}
      >
        {children}
      </html.button>
    </TabLayout>
  )
}

// --- Panel ---

interface PanelProps {
  value: string
  children: ReactNode
}

function Panel({value, children}: PanelProps) {
  const {activeValue, orientation} = useTabs()

  if (activeValue !== value) return null

  return (
    <html.div
      role="tabpanel"
      style={[styles.panel, orientation === 'vertical' && styles.panelVertical]}
    >
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
