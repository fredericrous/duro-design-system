import {
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import {html} from 'react-strict-dom'
import {useControllableValue} from '../../hooks/useControllableValue'
import {useFieldContext} from '../Field/FieldContext'
import {TagGroupContext, type TagGroupContextValue} from './TagGroupContext'
import {styles} from './styles.css'

// ---------------------------------------------------------------------------
// Local context accessor (non-throwing, returns null)
// ---------------------------------------------------------------------------

function useTagGroupCtx() {
  return useContext(TagGroupContext)
}

// ---------------------------------------------------------------------------
// TagGroup.Root
// ---------------------------------------------------------------------------

interface RootProps {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (values: string[]) => void
  /** Validate a value before adding. Return `true` if valid, or an error string. */
  onValidate?: (value: string) => true | string
  disabled?: boolean
  /** Form field name — renders hidden inputs for each tag value */
  name?: string
  'aria-label'?: string
  children: ReactNode
}

function Root({
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  onValidate,
  disabled: disabledProp = false,
  name,
  'aria-label': ariaLabel,
  children,
}: RootProps) {
  const gridId = useId()
  const fieldCtx = useFieldContext()
  const [values, setValues] = useControllableValue(controlledValue, defaultValue, onValueChange)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [editable, setEditable] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const disabled = disabledProp || (fieldCtx?.disabled ?? false)
  const isInvalid = fieldCtx?.invalid ?? false

  const addTag = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      if (!trimmed) return
      if (values.includes(trimmed)) return
      if (onValidate) {
        const result = onValidate(trimmed)
        if (result !== true) return
      }
      setValues([...values, trimmed])
      setAnnouncement(`Added ${trimmed}`)
    },
    [values, setValues, onValidate],
  )

  const removeTag = useCallback(
    (value: string) => {
      const idx = values.indexOf(value)
      if (idx === -1) return
      const next = values.filter((v) => v !== value)
      setValues(next)
      setAnnouncement(`Removed ${value}`)

      // Focus management: move to next tag, or previous, or input
      if (next.length === 0) {
        inputRef.current?.focus()
        setFocusedIndex(-1)
      } else if (idx >= next.length) {
        setFocusedIndex(next.length - 1)
      } else {
        setFocusedIndex(idx)
      }
    },
    [values, setValues],
  )

  // Focus the tag at focusedIndex when it changes
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < values.length) {
      const container = document.getElementById(gridId)
      if (!container) return
      const rows = container.querySelectorAll('[role="row"]')
      const target = rows[focusedIndex] as HTMLElement | undefined
      target?.focus()
    }
  }, [focusedIndex, gridId, values.length])

  const ctx = useMemo<TagGroupContextValue>(
    () => ({
      values,
      addTag,
      removeTag,
      editable,
      setEditable,
      disabled,
      validate: onValidate,
      focusedIndex,
      setFocusedIndex,
      inputRef,
      gridId,
      name,
    }),
    [values, addTag, removeTag, editable, disabled, onValidate, focusedIndex, gridId, name],
  )

  return (
    <TagGroupContext.Provider value={ctx}>
      <html.div style={styles.root} aria-label={ariaLabel}>
        <html.div
          style={[
            styles.container,
            !editable && styles.containerStatic,
            isInvalid && styles.containerError,
            disabled && styles.containerDisabled,
          ]}
          aria-describedby={
            fieldCtx
              ? `${fieldCtx.descriptionId} ${fieldCtx.invalid ? fieldCtx.errorId : ''}`.trim()
              : undefined
          }
          aria-invalid={isInvalid || undefined}
        >
          {children}
        </html.div>

        {/* Hidden inputs for form submission */}
        {name && values.map((v) => <html.input key={v} type="hidden" name={name} value={v} />)}

        {/* Live region for screen reader announcements */}
        <html.div role="status" aria-live="polite" aria-atomic style={styles.liveRegion}>
          {announcement}
        </html.div>
      </html.div>
    </TagGroupContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// TagGroup.List
// ---------------------------------------------------------------------------

interface ListProps {
  children: ReactNode
  'aria-label'?: string
}

function List({children, 'aria-label': ariaLabel}: ListProps) {
  const ctx = useTagGroupCtx()

  return (
    <html.div role={'grid' as any} aria-label={ariaLabel} id={ctx?.gridId} style={styles.list}>
      {children}
    </html.div>
  )
}

// ---------------------------------------------------------------------------
// TagGroup.Input
// ---------------------------------------------------------------------------

interface InputProps {
  placeholder?: string
}

function Input({placeholder}: InputProps) {
  const ctx = useTagGroupCtx()
  const [inputValue, setInputValue] = useState('')
  const localRef = useRef<HTMLInputElement>(null)

  // Sync local ref with context inputRef
  useEffect(() => {
    if (ctx?.inputRef) {
      ;(ctx.inputRef as React.MutableRefObject<HTMLInputElement | null>).current = localRef.current
    }
  })

  // Register as editable on mount
  useEffect(() => {
    ctx?.setEditable(true)
    return () => ctx?.setEditable(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const commitValueRef = useRef<(raw: string) => boolean>(() => false)
  commitValueRef.current = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed || !ctx) return false
    ctx.addTag(trimmed)
    setInputValue('')
    return true
  }

  // Native keydown for full KeyboardEvent access (preventDefault)
  useEffect(() => {
    const el = localRef.current
    if (!el) return

    function handleKeyDown(e: KeyboardEvent) {
      if (!ctx) return
      const target = e.target as HTMLInputElement

      if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
        e.preventDefault()
        commitValueRef.current(target.value)
        return
      }

      if (e.key === 'Tab' && target.value.trim()) {
        e.preventDefault()
        commitValueRef.current(target.value)
        return
      }

      if (e.key === 'Backspace' && !target.value && ctx.values.length > 0) {
        e.preventDefault()
        ctx.removeTag(ctx.values[ctx.values.length - 1])
        return
      }

      if (e.key === 'ArrowLeft' && (target.selectionStart ?? 0) === 0 && ctx.values.length > 0) {
        e.preventDefault()
        ctx.setFocusedIndex(ctx.values.length - 1)
        return
      }

      if (e.key === 'Escape') {
        setInputValue('')
      }
    }

    function handlePaste(e: ClipboardEvent) {
      if (!ctx) return
      const text = e.clipboardData?.getData('text') ?? ''
      const items = text
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      if (items.length > 1) {
        e.preventDefault()
        for (const item of items) {
          ctx.addTag(item)
        }
      }
    }

    function handleFocus() {
      ctx?.setFocusedIndex(-1)
    }

    el.addEventListener('keydown', handleKeyDown)
    el.addEventListener('paste', handlePaste)
    el.addEventListener('focus', handleFocus)
    return () => {
      el.removeEventListener('keydown', handleKeyDown)
      el.removeEventListener('paste', handlePaste)
      el.removeEventListener('focus', handleFocus)
    }
  }, [ctx])

  return (
    <html.input
      ref={localRef as React.Ref<HTMLInputElement>}
      type="text"
      value={inputValue}
      onChange={(e: any) => setInputValue(e.target.value)}
      placeholder={placeholder}
      disabled={ctx?.disabled}
      style={styles.input}
    />
  )
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const TagGroup = {
  Root,
  List,
  Input,
}
