import {type ReactNode, createContext, useContext, useCallback, useId} from 'react'
import {html} from 'react-strict-dom'
import {useControllableValue} from '../../hooks/useControllableValue'
import {styles} from './styles.css'
import {useFieldGroupLabelling} from '../Field/FieldContext'

// --- Context ---

interface RadioGroupContextValue {
  value: string
  name: string
  onSelect: (value: string) => void
  disabled: boolean
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export function useRadioGroup() {
  const ctx = useContext(RadioGroupContext)
  if (!ctx) {
    throw new Error('RadioGroup.Item must be used within RadioGroup.Root')
  }
  return ctx
}

// --- Root ---

interface RootProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
  /** Form field name: every item's radio carries it, so the selection is
   *  submitted with a native form. Generated when omitted (the radios still
   *  form one group). */
  name?: string
  /** Accessible name when the group is not inside a Field.Root (inside one,
   *  the Field.Label names it). */
  'aria-label'?: string
  /** id of the element that names the group, when not inside a Field.Root. */
  'aria-labelledby'?: string
  children: ReactNode
}

export function Root({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  orientation = 'vertical',
  disabled = false,
  name: nameProp,
  children,
  ...labelling
}: RootProps) {
  const a11y = useFieldGroupLabelling(labelling)
  const generatedName = useId()
  const name = nameProp ?? generatedName
  const [value, setValue] = useControllableValue(controlledValue, defaultValue, onValueChange)

  const onSelect = useCallback(
    (itemValue: string) => {
      if (!disabled) {
        setValue(itemValue)
      }
    },
    [disabled, setValue],
  )

  return (
    <RadioGroupContext.Provider value={{value, name, onSelect, disabled}}>
      <html.div
        role="radiogroup"
        aria-orientation={orientation}
        {...a11y}
        style={[styles.root, orientation === 'horizontal' && styles.rootHorizontal]}
      >
        {children}
      </html.div>
    </RadioGroupContext.Provider>
  )
}

// inside a Field.Root, the label names this group (see Field's `group`)
Root.isFieldGroup = true as const
