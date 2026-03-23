import {type ReactNode, useCallback, useEffect, useMemo, useRef} from 'react'
import {css, html} from 'react-strict-dom'
import {
  useForm,
  FormProvider,
  type UseFormReturn,
  type DefaultValues,
  type FieldValues,
  type FieldErrors,
  type Path,
} from 'react-hook-form'
import {effectTsResolver} from '@hookform/resolvers/effect-ts'
import type {Schema} from 'effect'
import {FormContext, type LabelPosition, type NecessityIndicator} from './FormContext'

export interface FormProps<T extends FieldValues> {
  schema: Schema.Schema<T>
  defaultValues: DefaultValues<T>
  onSubmit: (data: T) => void | Promise<void>
  disabled?: boolean
  labelPosition?: LabelPosition
  necessityIndicator?: NecessityIndicator
  validationErrors?: Partial<Record<Path<T>, string>>
  children: ReactNode | ((methods: UseFormReturn<T>) => ReactNode)
}

const formStyles = css.create({
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
})

export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  disabled = false,
  labelPosition = 'top',
  necessityIndicator = false,
  validationErrors,
  children,
}: FormProps<T>) {
  const methods = useForm<T>({
    resolver: effectTsResolver(schema),
    defaultValues,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  // Sync server-side validation errors into RHF
  const prevErrorKeysRef = useRef<string[]>([])
  useEffect(() => {
    const prevKeys = prevErrorKeysRef.current
    const nextKeys = validationErrors ? Object.keys(validationErrors) : []

    // Clear errors that were removed
    for (const key of prevKeys) {
      if (!nextKeys.includes(key)) {
        methods.clearErrors(key as Path<T>)
      }
    }

    // Set new errors
    if (validationErrors) {
      for (const [key, message] of Object.entries(validationErrors)) {
        if (message) {
          methods.setError(key as Path<T>, {type: 'server', message: message as string})
        }
      }
    }

    prevErrorKeysRef.current = nextKeys
  }, [validationErrors, methods])

  const formRef = useRef<HTMLFormElement>(null)

  const onInvalid = useCallback(
    (errors: FieldErrors<T>) => {
      const firstField = Object.keys(errors)[0]
      if (firstField) {
        methods.setFocus(firstField as Path<T>)
      }
    },
    [methods],
  )

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault()
      void methods.handleSubmit(onSubmit, onInvalid)()
    },
    [methods, onSubmit, onInvalid],
  )

  useEffect(() => {
    const el = formRef.current
    if (!el) return
    el.addEventListener('submit', handleSubmit)
    return () => el.removeEventListener('submit', handleSubmit)
  }, [handleSubmit])

  const formCtx = useMemo(
    () => ({disabled, labelPosition, necessityIndicator}),
    [disabled, labelPosition, necessityIndicator],
  )

  return (
    <FormProvider {...methods}>
      <FormContext.Provider value={formCtx}>
        <html.form
          ref={formRef}
          aria-disabled={disabled || undefined}
          style={disabled && formStyles.disabled}
        >
          {typeof children === 'function' ? children(methods) : children}
        </html.form>
      </FormContext.Provider>
    </FormProvider>
  )
}
