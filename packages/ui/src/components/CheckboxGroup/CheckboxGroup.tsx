import {type ReactNode, createContext, useContext, useCallback} from 'react'
import {html} from 'react-strict-dom'
import {useControllableValue} from '../../hooks/useControllableValue'
import {Checkbox} from '../Checkbox/Checkbox'
import {styles} from './styles.css'
import {useFieldGroupLabelling} from '../Field/FieldContext'

// --- Context ---

interface CheckboxGroupContextValue {
  value: string[]
  onToggle: (itemValue: string, checked: boolean) => void
  disabled: boolean
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null)

function useCheckboxGroup() {
  const ctx = useContext(CheckboxGroupContext)
  if (!ctx) {
    throw new Error('CheckboxGroup.Item must be used within CheckboxGroup.Root')
  }
  return ctx
}

// --- Root ---

interface RootProps {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
  /** Accessible name when the group is not inside a Field.Root (inside one,
   *  the Field.Label names it). */
  'aria-label'?: string
  /** id of the element that names the group, when not inside a Field.Root. */
  'aria-labelledby'?: string
  children: ReactNode
}

function Root({
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  orientation = 'vertical',
  disabled = false,
  children,
  ...labelling
}: RootProps) {
  const a11y = useFieldGroupLabelling(labelling)
  const [value, setValue] = useControllableValue(controlledValue, defaultValue, onValueChange)

  const onToggle = useCallback(
    (itemValue: string, checked: boolean) => {
      if (disabled) return
      const next = checked ? [...value, itemValue] : value.filter((v) => v !== itemValue)
      setValue(next)
    },
    [disabled, value, setValue],
  )

  return (
    <CheckboxGroupContext.Provider value={{value, onToggle, disabled}}>
      <html.div
        role="group"
        aria-orientation={orientation}
        {...a11y}
        style={[styles.root, orientation === 'horizontal' && styles.rootHorizontal]}
      >
        {children}
      </html.div>
    </CheckboxGroupContext.Provider>
  )
}

// --- Item ---

interface ItemProps {
  value: string
  disabled?: boolean
  children: ReactNode
}

function Item({value, disabled: itemDisabled = false, children}: ItemProps) {
  const {value: groupValue, onToggle, disabled: groupDisabled} = useCheckboxGroup()
  const isChecked = groupValue.includes(value)
  const isDisabled = groupDisabled || itemDisabled

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onToggle(value, e.target.checked)
    },
    [value, onToggle],
  )

  return (
    <Checkbox value={value} checked={isChecked} disabled={isDisabled} onChange={handleChange}>
      {children}
    </Checkbox>
  )
}

// inside a Field.Root, the label names this group (see Field's `group`)
Root.isFieldGroup = true as const

export const CheckboxGroup = {
  Root,
  Item,
}
