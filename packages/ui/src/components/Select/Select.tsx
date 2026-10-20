import {Children, type ReactNode, useRef, useId, useEffect, useLayoutEffect, useState} from 'react'
import {createPortal} from 'react-dom'
import {html} from 'react-strict-dom'
import {SPACING_PX} from '@duro-app/tokens/keys'
import {styles} from './styles.css'
import {SelectContext, useSelect} from './SelectContext'
import {useSelectRoot} from './useSelectRoot'
import {useFieldContext} from '../Field/FieldContext'
import {usePortalMount} from '../ThemeProvider/ThemeProvider'
import {computePopoverPosition} from '../Popover/position'
import {usePopoverLayer} from '../Popover/PopoverLayerContext'
import {useGroupedControl} from '../ButtonGroup/useGroupedControl'
import {ControlContextBoundary} from '../Toolbar/ControlContextBoundary'
import {mergeRefs} from '../../shared/mergeRefs'
import type {ControlSize} from '../../shared/types'

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
  size = 'default',
}: {
  children: ReactNode
  'aria-label'?: string
  /** `small` matches a small Toggle or Button beside it. Default: `default`. */
  size?: ControlSize
}) {
  const {open, toggle, listboxId, highlightedId, triggerRef} = useSelect()
  const localRef = useRef<HTMLButtonElement>(null)
  const grouped = useGroupedControl<HTMLButtonElement>()
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
      ref={mergeRefs(localRef, grouped.ref)}
      tabIndex={grouped.tabIndex}
      onFocus={grouped.onFocus}
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
      style={[styles.trigger, size === 'small' && styles.triggerSmall, grouped.style]}
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
interface PopupProps {
  children: ReactNode
  /** The list's accessible name; on native also the sheet's title. */
  label?: string
  /** Native only: the sheet header's text button that closes it unchanged. Default: 'Cancel' */
  cancelLabel?: string
  /** Shown in place of the list when there are no items. */
  empty?: ReactNode
}

function Popup({children, label, empty}: PopupProps) {
  const {open, close, listboxId, triggerRef} = useSelect()
  const mount = usePortalMount()
  const [coords, setCoords] = useState<{top: number; left: number; width: number} | null>(null)
  const listboxRef = useRef<HTMLDivElement>(null)

  // Place the list against the trigger when it opens, below it unless it would
  // overflow the viewport there and fits above (as Menu and Popover do), and
  // re-place it on scroll/resize so it follows the trigger. Capture-phase scroll
  // catches scroll on any ancestor (e.g. a Dialog body). The list is laid out,
  // invisible, before its first placement so its height can be measured.
  useLayoutEffect(() => {
    if (!open) return
    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      const list = listboxRef.current
      if (!rect || !list) return
      const next = computePopoverPosition({
        anchor: {top: rect.top, left: rect.left, width: rect.width, height: rect.height},
        popup: {width: Math.max(list.offsetWidth, rect.width), height: list.offsetHeight},
        viewport: {width: window.innerWidth, height: window.innerHeight},
        side: 'bottom',
        align: 'start',
        offset: SPACING_PX.xs,
      })
      setCoords((prev) =>
        prev && prev.top === next.top && prev.left === next.left && prev.width === rect.width
          ? prev
          : {top: next.top, left: next.left, width: rect.width},
      )
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, triggerRef])

  const backdropRef = useRef<HTMLDivElement>(null)
  usePopoverLayer(listboxRef, {active: open})
  usePopoverLayer(backdropRef, {active: open})

  const node = (
    <>
      {open && <html.div ref={backdropRef} style={styles.backdrop} onClick={close} />}
      <html.div
        ref={listboxRef}
        id={listboxId}
        role="listbox"
        aria-label={label}
        aria-hidden={!open}
        style={[
          styles.popup,
          !open && styles.hidden,
          open && !coords && styles.measuring,
          coords && styles.popupPosition(coords.top, coords.left, coords.width),
        ]}
      >
        <ControlContextBoundary>
          {empty != null && Children.toArray(children).length === 0 ? (
            <html.div style={styles.empty}>{empty}</html.div>
          ) : (
            children
          )}
        </ControlContextBoundary>
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
