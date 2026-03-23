import {type ReactNode, createContext, useContext, useCallback} from 'react'
import {html} from 'react-strict-dom'
import {useControllableValue} from '../../hooks/useControllableValue'
import {styles} from './styles.css'

// --- Context ---

interface RadioGroupContextValue {
  value: string
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
  children: ReactNode
}

function Root({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  orientation = 'vertical',
  disabled = false,
  children,
}: RootProps) {
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
    <RadioGroupContext.Provider value={{value, onSelect, disabled}}>
      <html.div
        role="radiogroup"
        aria-orientation={orientation}
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
  const {value: groupValue, onSelect, disabled: groupDisabled} = useRadioGroup()
  const isChecked = groupValue === value
  const isDisabled = groupDisabled || itemDisabled

  const handleClick = () => {
    if (!isDisabled) {
      onSelect(value)
    }
  }

  return (
    <html.label style={[styles.item, isDisabled && styles.itemDisabled]} onClick={handleClick}>
      <html.input
        type="radio"
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

export const RadioGroup = {
  Root,
  Item,
}
