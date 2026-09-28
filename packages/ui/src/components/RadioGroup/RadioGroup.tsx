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

function useRadioGroup() {
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

function Root({
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

// --- Item ---

interface ItemProps {
  value: string
  disabled?: boolean
  children: ReactNode
}

function Item({value, disabled: itemDisabled = false, children}: ItemProps) {
  const {value: groupValue, name, onSelect, disabled: groupDisabled} = useRadioGroup()
  const isChecked = groupValue === value
  const isDisabled = groupDisabled || itemDisabled

  // The native radio is the only source of a pick: a click on the label
  // activates it, and onChange fires once, only when the selection changes.
  // (A label onClick as well would report every pick twice.)
  return (
    <html.label style={[styles.item, isDisabled && styles.itemDisabled]}>
      <html.input
        type="radio"
        name={name}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        onChange={() => onSelect(value)}
        style={styles.input}
      />
      <html.span
        style={[styles.circle, isChecked ? styles.circleChecked : styles.circleUnchecked]}
        aria-hidden
      >
        {isChecked && <html.span style={styles.dot} />}
      </html.span>
      {children && <html.span>{children}</html.span>}
    </html.label>
  )
}

// inside a Field.Root, the label names this group (see Field's `group`)
Root.isFieldGroup = true as const

export const RadioGroup = {
  Root,
  Item,
}
