import {type ReactNode, useCallback, useEffect, useRef} from 'react'
import {html} from 'react-strict-dom'
import {
  useForm,
  FormProvider,
  type UseFormReturn,
  type DefaultValues,
  type FieldValues,
} from 'react-hook-form'
import {effectTsResolver} from '@hookform/resolvers/effect-ts'
import type {Schema} from 'effect'
import {FormContext} from './FormContext'

export interface FormProps<T extends FieldValues> {
  schema: Schema.Schema<T>
  defaultValues: DefaultValues<T>
  onSubmit: (data: T) => void | Promise<void>
  children: ReactNode | ((methods: UseFormReturn<T>) => ReactNode)
}

export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
}: FormProps<T>) {
  const methods = useForm<T>({
    resolver: effectTsResolver(schema),
    defaultValues,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const formRef = useRef<HTMLFormElement>(null)
  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault()
      void methods.handleSubmit(onSubmit)()
    },
    [methods, onSubmit],
  )

  useEffect(() => {
    const el = formRef.current
    if (!el) return
    el.addEventListener('submit', handleSubmit)
    return () => el.removeEventListener('submit', handleSubmit)
  }, [handleSubmit])

  return (
    <FormProvider {...methods}>
      <FormContext.Provider value={true}>
        <html.form ref={formRef}>
          {typeof children === 'function' ? children(methods) : children}
        </html.form>
      </FormContext.Provider>
    </FormProvider>
  )
}
