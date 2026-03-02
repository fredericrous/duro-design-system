import {useState, useCallback} from 'react'

export function useControllableValue<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [internal, setInternal] = useState(defaultValue)
  const value = controlledValue !== undefined ? controlledValue : internal
  const setValue = useCallback(
    (v: T) => {
      if (controlledValue === undefined) setInternal(v)
      onChange?.(v)
    },
    [controlledValue, onChange],
  )
  return [value, setValue] as const
}
