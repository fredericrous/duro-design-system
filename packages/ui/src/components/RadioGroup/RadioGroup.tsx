import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {visuallyHidden} from '../../styles/visually-hidden.css'
import {Root, useRadioGroup} from './group'

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
        style={[visuallyHidden.base, styles.input]}
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
