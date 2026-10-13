import {useCallback, useEffect, useState} from 'react'
import {useControllableValue} from '../../hooks/useControllableValue'

export interface ComboboxStateOptions {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string | null) => void
  inputValue?: string
  onInputChange?: (value: string) => void
  initialLabels?: Record<string, string>
}

/** Whether an option's label matches what was typed: a case-insensitive substring. */
export function matchesQuery(label: string, query: string): boolean {
  return !query || label.toLowerCase().includes(query.toLowerCase())
}

/**
 * The Combobox's state both platforms share (plan N0, Decision 10): the value
 * and the typed text (each controlled or not), whether it is open, each
 * option's label, choosing an option, and the text/value reconcile on close.
 * Highlight, document order, keys and DOM focus are the web adapter's
 * (useComboboxRoot); the sheet and its pinned input are Combobox.native's.
 */
export function useComboboxState({
  defaultValue,
  value: controlledValue,
  onValueChange,
  inputValue: controlledInputValue,
  onInputChange,
  initialLabels,
}: ComboboxStateOptions) {
  const [value, setValue] = useControllableValue<string | null>(
    controlledValue,
    defaultValue ?? null,
    onValueChange,
  )
  // Seed the visible text from the initially-selected value's label, so a
  // defaultValue/value shows its label on mount — and so the reconcile effect
  // below doesn't see "value set but input empty" and wipe the selection.
  const [internalInputValue, setInternalInputValue] = useState<string>(() => {
    const initial = controlledValue ?? defaultValue
    return initial ? (initialLabels?.[initial] ?? '') : ''
  })
  const inputValue = controlledInputValue !== undefined ? controlledInputValue : internalInputValue
  const setInputValue = useCallback(
    (v: string) => {
      if (controlledInputValue === undefined) setInternalInputValue(v)
      onInputChange?.(v)
    },
    [controlledInputValue, onInputChange],
  )

  const [open, setOpen] = useState(false)
  const [labels, setLabels] = useState<Record<string, string>>(initialLabels ?? {})

  const registerLabel = useCallback((v: string, label: string) => {
    setLabels((prev) => (prev[v] === label ? prev : {...prev, [v]: label}))
  }, [])

  /** Choose an option: commit it, show its label, close. */
  const chooseValue = useCallback(
    (itemValue: string) => {
      setValue(itemValue)
      setInputValue(labels[itemValue] ?? itemValue)
      setOpen(false)
    },
    [setValue, labels, setInputValue],
  )

  // Reconcile input text with the committed value once the popup closes.
  // Three cases when transitioning from open → closed:
  //   - inputValue is empty: user cleared the field, treat that as
  //     "remove the selection" so the consumer's onValueChange fires
  //     with null and downstream UI (e.g. dependent fields) can reset.
  //   - inputValue doesn't match the selected label: user typed something
  //     but didn't pick anything; restore the label so the visible text
  //     and the committed value stay consistent.
  //   - inputValue equals the selected label: nothing to do.
  useEffect(() => {
    if (open) return
    // Treat an empty value (null OR '') as "no selection" — nothing to
    // reconcile. Without this, a controlled value="" (e.g. a table column
    // filter) fires setValue(null) every render → inline onValueChange →
    // parent state change → re-render → infinite "Maximum update depth" loop.
    if (!value) return
    if (inputValue === '') {
      setValue(null)
      return
    }
    if (labels[value] && inputValue !== labels[value]) {
      setInputValue(labels[value])
    }
  }, [open, value, labels, inputValue, setInputValue, setValue])

  return {
    value,
    setValue,
    inputValue,
    setInputValue,
    open,
    setOpen,
    labels,
    registerLabel,
    chooseValue,
  }
}
