import {type ReactNode, useCallback} from 'react'
import {html} from 'react-strict-dom'
import {useControllableValue} from '../../hooks/useControllableValue'
import type {ToggleSize} from '../Toggle/Toggle'
import {ToggleGroupContext, type Orientation} from './ToggleGroupContext'
import {styles} from './styles.css'

interface ToggleGroupProps {
  /** Controlled value — array of pressed item values. */
  value?: string[]
  /** Initial value (uncontrolled). */
  defaultValue?: string[]
  /** Callback fired when the set of pressed values changes. */
  onValueChange?: (value: string[]) => void
  /** When false, at most one item can be pressed at a time. */
  multiple?: boolean
  /** Prevents interaction with all items. */
  disabled?: boolean
  /** Layout direction. */
  orientation?: Orientation
  /** Size applied to all child toggles. */
  size?: ToggleSize
  children: ReactNode
}

export function ToggleGroup({
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  multiple = false,
  disabled = false,
  orientation = 'horizontal',
  size = 'default',
  children,
}: ToggleGroupProps) {
  const [value, setValue] = useControllableValue(controlledValue, defaultValue, onValueChange)

  const toggle = useCallback(
    (itemValue: string) => {
      const nextPressed = !value.includes(itemValue)
      let next: string[]
      if (multiple) {
        next = nextPressed ? [...value, itemValue] : value.filter((v) => v !== itemValue)
      } else {
        next = nextPressed ? [itemValue] : []
      }
      setValue(next)
    },
    [value, multiple, setValue],
  )

  return (
    <ToggleGroupContext.Provider value={{value, toggle, disabled, orientation, size}}>
      <html.div
        role="toolbar"
        aria-orientation={orientation}
        style={[styles.root, orientation === 'vertical' && styles.vertical]}
      >
        {children}
      </html.div>
    </ToggleGroupContext.Provider>
  )
}
