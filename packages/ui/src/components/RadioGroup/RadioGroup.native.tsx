import type {ReactNode} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {Root, useRadioGroup} from './group'

interface ItemProps {
  value: string
  disabled?: boolean
  children: ReactNode
}

/**
 * Native radio item: RSD renders `<input type="radio">` as a text field on
 * native, so the item is a button with the radio role, drawn like the web one.
 */
function Item({value, disabled: itemDisabled = false, children}: ItemProps) {
  const {value: groupValue, onSelect, disabled: groupDisabled} = useRadioGroup()
  const isChecked = groupValue === value
  const isDisabled = groupDisabled || itemDisabled
  return (
    <html.button
      type="button"
      role="radio"
      aria-checked={isChecked}
      disabled={isDisabled}
      onClick={() => onSelect(value)}
      style={[styles.item, styles.nativeItem, isDisabled && styles.itemDisabled]}
    >
      {/* div, not span: a native span is a Text, which draws no sized box. */}
      <html.div
        style={[
          styles.circle,
          styles.nativeFlex,
          isChecked ? styles.circleChecked : styles.circleUnchecked,
        ]}
        aria-hidden
      >
        {isChecked && <html.div style={styles.dot} />}
      </html.div>
      {children && <html.span>{children}</html.span>}
    </html.button>
  )
}

export const RadioGroup = {
  Root,
  Item,
}
