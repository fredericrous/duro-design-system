import {useCallback, useState} from 'react'
import {useControllableValue} from '../../hooks/useControllableValue'

export interface SelectStateOptions {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string | null) => void
  initialLabels?: Record<string, string>
}

/**
 * The Select's state both platforms share (plan N0, Decision 10): the value
 * (controlled or not), whether it is open, and each option's label. Focus,
 * highlight, document order and keys are the web adapter's (useSelectRoot);
 * native presses and the sheet are Select.native's.
 */
export function useSelectState({
  defaultValue,
  value: controlledValue,
  onValueChange,
  initialLabels,
}: SelectStateOptions) {
  const [value, setValue] = useControllableValue<string | null>(
    controlledValue,
    defaultValue ?? null,
    onValueChange,
  )
  const [open, setOpen] = useState(false)
  const [labels, setLabels] = useState<Record<string, string>>(initialLabels ?? {})

  const registerLabel = useCallback((v: string, label: string) => {
    setLabels((prev) => (prev[v] === label ? prev : {...prev, [v]: label}))
  }, [])

  return {value, setValue, open, setOpen, labels, registerLabel}
}
