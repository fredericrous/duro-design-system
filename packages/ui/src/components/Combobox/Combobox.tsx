import {type ReactNode, useCallback, useRef, useId, useEffect, useState} from 'react'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {styles as selectStyles} from '../Select/styles.css'
import {ComboboxContext, useCombobox} from './ComboboxContext'
import {useComboboxRoot} from './useComboboxRoot'
import {matchesQuery} from './comboboxState'
import {Listbox, getAnchorProps} from '../Listbox/Listbox'
import {useFieldContext} from '../Field/FieldContext'

// --- Root ---
interface RootProps {
  name?: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string | null) => void
  inputValue?: string
  onInputChange?: (value: string) => void
  /** Called once each time the list opens or closes. There is no controlled `open`, as on Select. */
  onOpenChange?: (open: boolean) => void
  initialLabels?: Record<string, string>
  children: ReactNode
}

function Root({
  name,
  defaultValue,
  value,
  onValueChange,
  inputValue,
  onInputChange,
  onOpenChange,
  initialLabels,
  children,
}: RootProps) {
  const {ctx, rootRef} = useComboboxRoot({
    defaultValue,
    value,
    onValueChange,
    inputValue,
    onInputChange,
    onOpenChange,
    initialLabels,
  })

  return (
    <ComboboxContext.Provider value={ctx}>
      <html.div ref={rootRef} style={styles.root}>
        {name && <html.input type="hidden" name={name} value={ctx.value ?? ''} />}
        {children}
      </html.div>
    </ComboboxContext.Provider>
  )
}

// --- Input ---
function Input({
  placeholder,
  'aria-label': ariaLabel,
  children,
}: {
  placeholder?: string
  /** The input's accessible name; inside a Field.Root the Field.Label names it. */
  'aria-label'?: string
  children?: ReactNode
}) {
  const {
    open,
    openPopup,
    inputValue,
    setInputValue,
    onInputFocus,
    onInputBlur,
    listboxId,
    highlightedId,
    inputRef,
  } = useCombobox()
  const fieldCtx = useFieldContext()
  const describedBy = fieldCtx
    ? `${fieldCtx.descriptionId} ${fieldCtx.invalid ? fieldCtx.errorId : ''}`.trim()
    : undefined
  const pointerFocusRef = useRef(false)
  const localRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const anchor = getAnchorProps({id: listboxId, open, highlightedId})

  useEffect(() => {
    inputRef.current = localRef.current
  })

  return (
    <html.div style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
      <html.input
        ref={localRef}
        id={fieldCtx?.controlId}
        type="text"
        role={'combobox' as 'listbox'}
        value={inputValue}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-describedby={describedBy || undefined}
        aria-invalid={fieldCtx?.invalid || undefined}
        aria-expanded={anchor['aria-expanded']}
        aria-haspopup="listbox"
        aria-controls={anchor['aria-controls']}
        aria-activedescendant={anchor['aria-activedescendant']}
        aria-autocomplete={'list' as 'none'}
        autoComplete="off"
        style={styles.input}
        onMouseDown={() => {
          pointerFocusRef.current = document.activeElement !== localRef.current
        }}
        onMouseUp={() => {
          // The pointer that focused the field would collapse the selection.
          if (pointerFocusRef.current) localRef.current?.select()
          pointerFocusRef.current = false
        }}
        onFocus={() => {
          setFocused(true)
          localRef.current?.select()
          onInputFocus()
        }}
        onBlur={() => {
          setFocused(false)
          onInputBlur()
        }}
        onChange={(e: any) => {
          setInputValue(e.target.value)
          if (!open) openPopup()
        }}
      />
      {children}
    </html.div>
  )
}

// --- Trigger ---
function Trigger({children}: {children?: ReactNode}) {
  const {open, openPopup, close, inputRef} = useCombobox()

  return (
    <html.button
      type="button"
      tabIndex={-1}
      aria-label={open ? 'Close' : 'Open'}
      onClick={() => {
        if (open) {
          close()
        } else {
          openPopup()
        }
        inputRef.current?.focus()
      }}
      style={styles.trigger}
    >
      {children ?? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      )}
    </html.button>
  )
}

// --- Popup ---
// A Listbox placed under the input, as wide as the field: rendered into the
// ThemeProvider portal mount so it escapes ancestor `overflow: hidden` /
// `transform` containing blocks (notably Dialog and Drawer).
interface PopupProps {
  children: ReactNode
  /** The list's accessible name; on native also the sheet's title. */
  label?: string
  /** Native only: the sheet header's text button that closes it unchanged. Default: 'Cancel' */
  cancelLabel?: string
}

function Popup({children, label}: PopupProps) {
  const {open, listboxId, rootRef, highlightedId, setHighlightedId, setValue} = useCombobox()
  const anchor = useCallback(() => rootRef.current?.getBoundingClientRect(), [rootRef])

  return (
    <Listbox.Root
      id={listboxId}
      open={open}
      anchor={anchor}
      matchAnchorWidth
      highlightedId={highlightedId}
      onHighlight={setHighlightedId}
      onSelect={setValue}
      aria-label={label}
      maxHeight="listMaxHSm"
    >
      {children}
    </Listbox.Root>
  )
}

// --- Item ---
interface ItemProps {
  value: string
  /** A second line under the option's text, in muted type. Not part of the option's name, its filtering or the input's text. */
  description?: ReactNode
  /** An icon or a small preview before the option's text. Decorative: hidden from assistive technology. */
  leading?: ReactNode
  children: ReactNode
}

function Item({value: itemValue, description, leading, children}: ItemProps) {
  const {value: selectedValue, query, labels, registerLabel, registerItem} = useCombobox()
  const id = useId()
  const textId = useId()
  const descriptionId = useId()
  const ref = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const isSelected = selectedValue === itemValue
  const detailed = description != null || leading != null
  const hasDescription = description != null

  // Filter: check if this item matches the input (the label, never the description)
  const isVisible = matchesQuery(labels[itemValue] ?? itemValue, query)

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    const text = el.textContent
    if (text) registerLabel(itemValue, text)
  }, [itemValue, registerLabel])

  // An option the filter hides unmounts its element, so it registers again when
  // it shows again (`isVisible`): that is also how a pending open highlight
  // settles on it after a filter change.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerItem(id, itemValue, el)
  }, [id, itemValue, registerItem, isVisible])

  // Listbox.Option owns the option element and takes no aria props, so the
  // name (the label text alone) and the description are set on it here.
  useEffect(() => {
    const el = ref.current
    if (!el || !isVisible) return
    el.setAttribute('aria-labelledby', textId)
    if (hasDescription) el.setAttribute('aria-describedby', descriptionId)
    else el.removeAttribute('aria-describedby')
  }, [isVisible, textId, descriptionId, hasDescription])

  if (!isVisible) return null

  return (
    <Listbox.Option ref={ref} id={id} value={itemValue} selected={isSelected}>
      {leading != null && (
        <html.span aria-hidden style={selectStyles.itemLeading}>
          {leading}
        </html.span>
      )}
      {detailed ? (
        <html.span style={selectStyles.itemBody}>
          <html.span ref={textRef} id={textId}>
            {children}
          </html.span>
          {hasDescription && (
            <html.span id={descriptionId} style={selectStyles.itemDescription}>
              {description}
            </html.span>
          )}
        </html.span>
      ) : (
        <html.span ref={textRef} id={textId}>
          {children}
        </html.span>
      )}
    </Listbox.Option>
  )
}

// --- ItemText ---
function ItemText({children}: {children: ReactNode}) {
  return <html.span>{children}</html.span>
}

// --- Empty ---
function Empty({children}: {children: ReactNode}) {
  const {open, shownCount} = useCombobox()

  // Shown while the list holds no option: none matches what was typed, or the
  // options have not arrived yet.
  if (!open || shownCount > 0) return null

  return <Listbox.Empty>{children}</Listbox.Empty>
}

export const Combobox = {
  Root,
  Input,
  Trigger,
  Popup,
  Item,
  ItemText,
  Empty,
}
