import {type ReactNode, Children, isValidElement, useId, useMemo} from 'react'
import {html} from 'react-strict-dom'
import {useFormContext as useRHFFormContext, useController} from 'react-hook-form'
import {FieldContext, useFieldContext} from './FieldContext'
import {useFormContext} from '../Form/FormContext'
import type {LabelPosition, NecessityIndicator} from '../Form/FormContext'
import {styles} from './styles.css'

// --- Root ---
interface RootProps {
  name?: string
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  labelPosition?: LabelPosition
  children: ReactNode
}

function Root({name, ...props}: RootProps) {
  const formCtx = useFormContext()
  if (name && formCtx) {
    return <ControlledRoot name={name} formCtx={formCtx} {...props} />
  }
  return <StaticRoot {...props} />
}

// Always calls useController — no conditional hooks
function ControlledRoot({
  name,
  formCtx,
  invalid: invalidProp = false,
  required,
  disabled,
  labelPosition,
  children,
}: {
  name: string
  formCtx: NonNullable<ReturnType<typeof useFormContext>>
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  labelPosition?: LabelPosition
  children: ReactNode
}) {
  const id = useId()
  const {control} = useRHFFormContext()
  const {field, fieldState} = useController({control, name})
  const invalid = invalidProp || !!fieldState.error

  const effectiveDisabled = disabled ?? formCtx.disabled
  const effectiveLabelPosition = labelPosition ?? formCtx.labelPosition
  const effectiveNecessityIndicator = formCtx.necessityIndicator

  const ctx = useMemo(
    () => ({
      controlId: `${id}-control`,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
      invalid,
      required,
      disabled: effectiveDisabled,
      labelPosition: effectiveLabelPosition,
      necessityIndicator: effectiveNecessityIndicator,
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
      required,
      effectiveDisabled,
      effectiveLabelPosition,
      effectiveNecessityIndicator,
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
      <FieldLayout labelPosition={effectiveLabelPosition}>{children}</FieldLayout>
    </FieldContext.Provider>
  )
}

// Current behavior, no RHF dependency
function StaticRoot({
  invalid = false,
  required,
  disabled,
  labelPosition = 'top',
  children,
}: {
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  labelPosition?: LabelPosition
  children: ReactNode
}) {
  const id = useId()
  const ctx = useMemo(
    () => ({
      controlId: `${id}-control`,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
      invalid,
      required,
      disabled,
      labelPosition,
    }),
    [id, invalid, required, disabled, labelPosition],
  )

  return (
    <FieldContext.Provider value={ctx}>
      <FieldLayout labelPosition={labelPosition}>{children}</FieldLayout>
    </FieldContext.Provider>
  )
}

// --- FieldLayout ---
// When labelPosition is 'side', separates Label from other children
// and wraps the non-label children in a content column.
function FieldLayout({
  labelPosition,
  children,
}: {
  labelPosition: LabelPosition
  children: ReactNode
}) {
  if (labelPosition !== 'side') {
    return <html.div style={styles.root}>{children}</html.div>
  }

  let labelNode: ReactNode = null
  const rest: ReactNode[] = []

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Label && !labelNode) {
      labelNode = child
    } else {
      rest.push(child)
    }
  })

  return (
    <html.div style={styles.rootSide}>
      {labelNode}
      <html.div style={styles.fieldContent}>{rest}</html.div>
    </html.div>
  )
}

// --- Label ---
interface LabelProps {
  children: ReactNode
}

function Label({children}: LabelProps) {
  const ctx = useFieldContext()
  const isSide = ctx?.labelPosition === 'side'
  const indicator = ctx?.necessityIndicator

  return (
    <html.label
      for={ctx?.controlId}
      style={[styles.label, isSide && styles.labelSide]}
    >
      {children}
      {indicator === 'icon' && ctx?.required && (
        <html.span style={styles.necessityIcon} aria-hidden={true}>
          {' *'}
        </html.span>
      )}
      {indicator === 'label' && (
        <html.span style={styles.necessityLabel}>
          {ctx?.required ? ' (required)' : ' (optional)'}
        </html.span>
      )}
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
