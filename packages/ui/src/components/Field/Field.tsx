import {
  type ReactNode,
  Children,
  isValidElement,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import {html} from 'react-strict-dom'
import {useFormContext as useRHFFormContext, useController} from 'react-hook-form'
import {FieldContext, useFieldContext} from './FieldContext'
import type {FieldContextValue} from './FieldContext'
import {useFormContext} from '../Form/FormContext'
import type {LabelPosition} from '../Form/FormContext'
import {styles} from './styles.css'

// Native error state shared by both roots, with a count of mounted Field.Error
// parts: Root shows the native message itself only while the count is zero.
function useNativeErrorState() {
  const [nativeError, setNativeError] = useState<string | undefined>()
  const [errorCount, setErrorCount] = useState(0)
  const registerError = useCallback(() => {
    setErrorCount((count) => count + 1)
    return () => setErrorCount((count) => count - 1)
  }, [])
  return {nativeError, setNativeError, errorCount, registerError}
}

function ownError(fieldContext: FieldContextValue, errorCount: number): ReactNode {
  if (fieldContext.nativeError === undefined || errorCount > 0) return null
  return (
    <html.span id={fieldContext.errorId} role="alert" style={styles.error}>
      {fieldContext.errorMessage ?? fieldContext.nativeError}
    </html.span>
  )
}

// --- Root ---
interface RootProps {
  name?: string
  /** The control is a group of controls rather than one input — the label
   *  then names the group (`aria-labelledby`) instead of pointing `for` at an
   *  input. Detected automatically when a direct child is a ToggleGroup,
   *  CheckboxGroup.Root or RadioGroup.Root; set it for any other group. */
  group?: boolean
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  labelPosition?: LabelPosition
  children: ReactNode
}

/** A group control marks itself so a Field can tell it holds a group. */
export type FieldGroupComponent = {isFieldGroup?: true}

function holdsGroup(children: ReactNode): boolean {
  let found = false
  Children.forEach(children, (child) => {
    if (isValidElement(child) && (child.type as FieldGroupComponent).isFieldGroup) found = true
  })
  return found
}

function Root({name, group, ...props}: RootProps) {
  const formCtx = useFormContext()
  const isGroup = group ?? holdsGroup(props.children)
  if (name && formCtx) {
    return <ControlledRoot name={name} formCtx={formCtx} group={isGroup} {...props} />
  }
  return <StaticRoot group={isGroup} {...props} />
}

// Always calls useController — no conditional hooks
function ControlledRoot({
  name,
  formCtx,
  group,
  invalid: invalidProp = false,
  required,
  disabled,
  labelPosition,
  children,
}: {
  name: string
  formCtx: NonNullable<ReturnType<typeof useFormContext>>
  group: boolean
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  labelPosition?: LabelPosition
  children: ReactNode
}) {
  const id = useId()
  const {control} = useRHFFormContext()
  const {field, fieldState} = useController({control, name})
  const {nativeError, setNativeError, errorCount, registerError} = useNativeErrorState()
  const invalid = invalidProp || !!fieldState.error || nativeError !== undefined

  const effectiveDisabled = disabled ?? formCtx.disabled
  const effectiveLabelPosition = labelPosition ?? formCtx.labelPosition
  const effectiveNecessityIndicator = formCtx.necessityIndicator

  const ctx = useMemo(
    () => ({
      controlId: `${id}-control`,
      labelId: `${id}-label`,
      group,
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
      nativeError,
      setNativeError,
      registerError,
    }),
    [
      id,
      group,
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
      nativeError,
      setNativeError,
      registerError,
    ],
  )

  return (
    <FieldContext.Provider value={ctx}>
      <FieldLayout labelPosition={effectiveLabelPosition} ownError={ownError(ctx, errorCount)}>
        {children}
      </FieldLayout>
    </FieldContext.Provider>
  )
}

// Current behavior, no RHF dependency
function StaticRoot({
  group,
  invalid: invalidProp = false,
  required,
  disabled,
  labelPosition = 'top',
  children,
}: {
  group: boolean
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  labelPosition?: LabelPosition
  children: ReactNode
}) {
  const id = useId()
  const {nativeError, setNativeError, errorCount, registerError} = useNativeErrorState()
  const invalid = invalidProp || nativeError !== undefined
  const ctx = useMemo(
    () => ({
      controlId: `${id}-control`,
      labelId: `${id}-label`,
      group,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
      invalid,
      required,
      disabled,
      labelPosition,
      nativeError,
      setNativeError,
      registerError,
    }),
    [
      id,
      group,
      invalid,
      required,
      disabled,
      labelPosition,
      nativeError,
      setNativeError,
      registerError,
    ],
  )

  return (
    <FieldContext.Provider value={ctx}>
      <FieldLayout labelPosition={labelPosition} ownError={ownError(ctx, errorCount)}>
        {children}
      </FieldLayout>
    </FieldContext.Provider>
  )
}

// --- FieldLayout ---
// When labelPosition is 'side', separates Label from other children
// and wraps the non-label children in a content column.
function FieldLayout({
  labelPosition,
  ownError,
  children,
}: {
  labelPosition: LabelPosition
  ownError: ReactNode
  children: ReactNode
}) {
  if (labelPosition !== 'side') {
    return (
      <html.div style={styles.root}>
        {children}
        {ownError}
      </html.div>
    )
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
      <html.div style={styles.fieldContent}>
        {rest}
        {ownError}
      </html.div>
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
  const content = (
    <>
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
    </>
  )

  // A group is not a labelable element: `for` would point at nothing. The
  // group names itself from this id instead (aria-labelledby).
  if (ctx?.group) {
    return (
      <html.span id={ctx.labelId} style={[styles.label, isSide && styles.labelSide]}>
        {content}
      </html.span>
    )
  }
  return (
    <html.label
      id={ctx?.labelId}
      for={ctx?.controlId}
      style={[styles.label, isSide && styles.labelSide]}
    >
      {content}
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

function rendersSomething(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== true && node !== ''
}

// --- Error ---
interface ErrorProps {
  children?: ReactNode
}

function Error({children}: ErrorProps) {
  const ctx = useFieldContext()
  const registerError = ctx?.registerError
  useLayoutEffect(() => registerError?.(), [registerError])
  const content = [children, ctx?.errorMessage, ctx?.nativeError].find(rendersSomething)
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
