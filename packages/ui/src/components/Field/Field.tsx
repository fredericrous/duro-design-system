import {type ReactNode, useId, useMemo} from 'react'
import {html} from 'react-strict-dom'
import {useFormContext as useRHFFormContext, useController} from 'react-hook-form'
import {FieldContext, useFieldContext} from './FieldContext'
import {useFormContext} from '../Form/FormContext'
import {styles} from './styles.css'

// --- Root ---
interface RootProps {
  name?: string
  invalid?: boolean
  children: ReactNode
}

function Root({name, ...props}: RootProps) {
  const insideForm = useFormContext()
  if (name && insideForm) {
    return <ControlledRoot name={name} {...props} />
  }
  return <StaticRoot {...props} />
}

// Always calls useController — no conditional hooks
function ControlledRoot({
  name,
  invalid: invalidProp = false,
  children,
}: {
  name: string
  invalid?: boolean
  children: ReactNode
}) {
  const id = useId()
  const {control} = useRHFFormContext()
  const {field, fieldState} = useController({control, name})
  const invalid = invalidProp || !!fieldState.error

  const ctx = useMemo(
    () => ({
      controlId: `${id}-control`,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
      invalid,
      field: {
        value: field.value,
        onChange: field.onChange,
        onBlur: field.onBlur,
        ref: field.ref,
        name: field.name,
      },
      errorMessage: fieldState.error?.message,
    }),
    [
      id,
      invalid,
      field.value,
      field.onChange,
      field.onBlur,
      field.ref,
      field.name,
      fieldState.error,
    ],
  )

  return (
    <FieldContext.Provider value={ctx}>
      <html.div style={styles.root}>{children}</html.div>
    </FieldContext.Provider>
  )
}

// Current behavior, no RHF dependency
function StaticRoot({invalid = false, children}: {invalid?: boolean; children: ReactNode}) {
  const id = useId()
  const ctx = useMemo(
    () => ({
      controlId: `${id}-control`,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
      invalid,
    }),
    [id, invalid],
  )

  return (
    <FieldContext.Provider value={ctx}>
      <html.div style={styles.root}>{children}</html.div>
    </FieldContext.Provider>
  )
}

// --- Label ---
interface LabelProps {
  children: ReactNode
}

function Label({children}: LabelProps) {
  const ctx = useFieldContext()
  return (
    <html.label for={ctx?.controlId} style={styles.label}>
      {children}
    </html.label>
  )
}

// --- Description ---
interface DescriptionProps {
  children: ReactNode
}

function Description({children}: DescriptionProps) {
  const ctx = useFieldContext()
  return (
    <html.span id={ctx?.descriptionId} style={styles.description}>
      {children}
    </html.span>
  )
}

// --- Error ---
interface ErrorProps {
  children?: ReactNode
}

function Error({children}: ErrorProps) {
  const ctx = useFieldContext()
  const content = children ?? ctx?.errorMessage
  if (!ctx?.invalid && !content) return null

  return (
    <html.span id={ctx?.errorId} role="alert" style={styles.error}>
      {content}
    </html.span>
  )
}

export const Field = {
  Root,
  Label,
  Description,
  Error,
}
