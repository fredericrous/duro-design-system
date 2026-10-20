import {useCallback, useEffect, useRef, useState} from 'react'
import {useControllableValue} from '../../hooks/useControllableValue'

export interface SelectStateOptions {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string | null) => void
  initialLabels?: Record<string, string>
  /**
   * Called when the list opens or closes, by any means (a press, a key, a pick,
   * Escape, a press outside): for work that should start only once someone is
   * choosing, such as checking which options are available.
   */
  onOpenChange?: (open: boolean) => void
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
  onOpenChange,
}: SelectStateOptions) {
  const [value, setValue] = useControllableValue<string | null>(
    controlledValue,
    defaultValue ?? null,
    onValueChange,
  )
  const [open, setOpen] = useState(false)
  // Reported after the change commits, once per transition; never for the first render.
  const onOpenChangeRef = useRef(onOpenChange)
  onOpenChangeRef.current = onOpenChange
  const reportedOpenRef = useRef(open)
  useEffect(() => {
    if (reportedOpenRef.current === open) return
    reportedOpenRef.current = open
    onOpenChangeRef.current?.(open)
  }, [open])
  const [labels, setLabels] = useState<Record<string, string>>(initialLabels ?? {})

  const registerLabel = useCallback((v: string, label: string) => {
    setLabels((prev) => (prev[v] === label ? prev : {...prev, [v]: label}))
  }, [])

  return {value, setValue, open, setOpen, labels, registerLabel}
}
