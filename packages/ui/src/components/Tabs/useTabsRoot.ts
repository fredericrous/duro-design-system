import {useCallback, useRef} from 'react'
import {useControllableValue} from '../../hooks/useControllableValue'
import type {Orientation, TabsContextValue} from './TabsContext'

interface UseTabsRootOptions {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: Orientation
}

export function useTabsRoot({
  value: controlledValue,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
}: UseTabsRootOptions): TabsContextValue {
  const [activeValue, onSelect] = useControllableValue<string | null>(
    controlledValue,
    defaultValue ?? null,
    onValueChange
      ? (v) => {
          if (v !== null) onValueChange(v)
        }
      : undefined,
  )
  const tabsRef = useRef(new Map<string, boolean>())
  const orderRef = useRef<string[]>([])

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

  return {activeValue, onSelect, orientation, registerTab, tabsRef, orderRef}
}
