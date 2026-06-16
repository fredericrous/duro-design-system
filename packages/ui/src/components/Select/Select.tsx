import {type ReactNode, useRef, useId, useEffect, useLayoutEffect, useState} from 'react'
import {createPortal} from 'react-dom'
import {html} from 'react-strict-dom'
import {styles} from './styles.css'
import {SelectContext, useSelect} from './SelectContext'
import {useSelectRoot} from './useSelectRoot'
import {useFieldContext} from '../Field/FieldContext'
import {usePortalMount} from '../ThemeProvider/ThemeProvider'

// --- Root ---
interface RootProps {
  name?: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string | null) => void
  initialLabels?: Record<string, string>
  children: ReactNode
}

function Root({name, defaultValue, value, onValueChange, initialLabels, children}: RootProps) {
  const {ctx, rootRef} = useSelectRoot({defaultValue, value, onValueChange, initialLabels})

  return (
    <SelectContext.Provider value={ctx}>
      <html.div ref={rootRef} style={styles.root}>
        {name && <html.input type="hidden" name={name} value={ctx.value ?? ''} />}
        {children}
      </html.div>
    </SelectContext.Provider>
  )
}

// --- Trigger ---
function Trigger({
  children,
  'aria-label': ariaLabel,
}: {
  children: ReactNode
  'aria-label'?: string
}) {
  const {open, toggle, listboxId, highlightedId, triggerRef} = useSelect()
  const localRef = useRef<HTMLButtonElement>(null)
  // Inside a <Field.Root>, adopt its controlId so <Field.Label for={controlId}>
  // labels the trigger (a labelable <button>) — no manual aria-label needed; and
  // surface the field's description/error + invalid state, mirroring <Input>.
  const fieldCtx = useFieldContext()
  const describedBy = fieldCtx
    ? `${fieldCtx.descriptionId} ${fieldCtx.invalid ? fieldCtx.errorId : ''}`.trim()
    : undefined

  // Sync local ref to context triggerRef
  useEffect(() => {
    triggerRef.current = localRef.current
  })

  return (
    <html.button
      ref={localRef}
      id={fieldCtx?.controlId}
      type="button"
      role={'combobox' as 'listbox'}
      onClick={toggle}
      aria-label={ariaLabel}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls={open ? listboxId : undefined}
      aria-activedescendant={highlightedId ?? undefined}
      aria-describedby={describedBy || undefined}
      aria-invalid={fieldCtx?.invalid || undefined}
      style={styles.trigger}
    >
      {children}
    </html.button>
  )
}

// --- Value ---
function Value({placeholder}: {placeholder?: string}) {
  const {value, labels} = useSelect()
  const display = value ? (labels[value] ?? value) : null

  return (
    <html.span style={display ? styles.value : styles.placeholder}>
      {display ?? placeholder}
    </html.span>
  )
}

// --- Icon ---
function Icon({children}: {children?: ReactNode}) {
  return (
    <html.span style={styles.icon}>
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
    </html.span>
  )
}

// --- Popup ---
// Rendered into the ThemeProvider portal mount and positioned with viewport
// coordinates (measured off the trigger) so it escapes ancestor
// `overflow: hidden` / `transform` containing blocks (notably Dialog/Drawer).
// The listbox stays mounted while closed (display: none) so Items can register
// their labels from DOM text before the popup is ever opened.
function Popup({children}: {children: ReactNode}) {
  const {open, close, listboxId, triggerRef} = useSelect()
  const mount = usePortalMount()
  const [coords, setCoords] = useState<{top: number; left: number; width: number} | null>(null)

  // Measure the trigger when the popup opens, and re-measure on scroll/resize so
  // the dropdown follows it. Capture-phase scroll catches scroll on any ancestor
  // (e.g. a Dialog body).
  useLayoutEffect(() => {
    if (!open) return
    const update = () => {
      const el = triggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      // `xs` token = 4px gap below the trigger.
      setCoords({top: rect.bottom + 4, left: rect.left, width: rect.width})
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, triggerRef])

  const node = (
    <>
      {open && <html.div style={styles.backdrop} onClick={close} />}
      <html.div
        id={listboxId}
        role="listbox"
        aria-hidden={!open}
        style={[
          styles.popup,
          (!open || !coords) && styles.hidden,
          coords && styles.popupPosition(coords.top, coords.left, coords.width),
        ]}
      >
        {children}
      </html.div>
    </>
  )

  // SSR / pre-mount fallback: render inline (hidden under overflow parents but
  // won't crash). Once the mount exists, portal into it.
  return mount ? createPortal(node, mount) : node
}

// --- Item ---
interface ItemProps {
  value: string
  children: ReactNode
}

function Item({value: itemValue, children}: ItemProps) {
  const {
    value: selectedValue,
    setValue,
    close,
    registerLabel,
    highlightedId,
    setHighlightedId,
    registerItem,
  } = useSelect()
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const isSelected = selectedValue === itemValue
  const isHighlighted = highlightedId === id

  // Register label from DOM text content (works with both string and JSX children)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const text = el.textContent
    if (text) registerLabel(itemValue, text)
  }, [itemValue, registerLabel])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerItem(id, itemValue, el)
  }, [id, itemValue, registerItem])

  const handleClick = () => {
    setValue(itemValue)
    close()
  }

  return (
    <html.div
      ref={ref}
      id={id}
      role="option"
      aria-selected={isSelected}
      onClick={handleClick}
      onPointerEnter={() => setHighlightedId(id)}
      style={[
        styles.item,
        isSelected && styles.itemSelected,
        isHighlighted && styles.itemHighlighted,
      ]}
    >
      {children}
    </html.div>
  )
}

// --- ItemText ---
function ItemText({children}: {children: ReactNode}) {
  return <html.span>{children}</html.span>
}

export const Select = {
  Root,
  Trigger,
  Value,
  Icon,
  Popup,
  Item,
  ItemText,
}
