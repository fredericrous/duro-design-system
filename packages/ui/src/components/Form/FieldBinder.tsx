import type {ReactNode} from 'react'
import {useController, useFormContext as useRHFFormContext} from 'react-hook-form'
import type {FieldBinding} from './FormContext'

/**
 * The react-hook-form side of Field's form binding. Lives with Form behind
 * `@duro-app/ui/form`: Field.Root reaches it only through FormContext, which
 * is what keeps react-hook-form out of the package root's module graph.
 */
export function FieldBinder({
  name,
  children,
}: {
  name: string
  children: (binding: FieldBinding) => ReactNode
}) {
  const {control} = useRHFFormContext()
  const {field, fieldState} = useController({control, name})
  return children({
    value: field.value,
    onChange: field.onChange,
    onBlur: field.onBlur,
    ref: field.ref,
    name: field.name,
    errorMessage: fieldState.error?.message,
  })
}
