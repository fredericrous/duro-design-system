import {type ReactNode, useCallback} from 'react'
import {html} from 'react-strict-dom'
import {useControllableValue} from '../../hooks/useControllableValue'
import type {ToggleSize} from '../Toggle/Toggle'
import {ToggleGroupContext, type Orientation} from './ToggleGroupContext'
import {useFieldGroupLabelling} from '../Field/FieldContext'
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
  /** Accessible name when the group is not inside a Field.Root (inside one,
   *  the Field.Label names it). */
  'aria-label'?: string
  /** id of the element that names the group, when not inside a Field.Root. */
  'aria-labelledby'?: string
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
  ...labelling
}: ToggleGroupProps) {
  const a11y = useFieldGroupLabelling(labelling)
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
        {...a11y}
        style={[styles.root, orientation === 'vertical' && styles.vertical]}
      >
        {children}
      </html.div>
    </ToggleGroupContext.Provider>
  )
}

// inside a Field.Root, the label names this group (see Field's `group`)
ToggleGroup.isFieldGroup = true as const
