import {type ReactNode, useCallback, useLayoutEffect, useRef} from 'react'
import {html} from 'react-strict-dom'
import {useControllableValue} from '../../hooks/useControllableValue'
import type {ToggleSize} from '../Toggle/Toggle'
import {ToggleGroupContext, type Orientation} from './ToggleGroupContext'
import {useFieldGroupLabelling} from '../Field/FieldContext'
import {ScrollArea} from '../ScrollArea/ScrollArea'
import {useRovingFocus} from './useRovingFocus'
import {styles} from './styles.css'

interface ToggleGroupProps {
  /** Controlled value — array of pressed item values. */
  value?: string[]
  /** Initial value (uncontrolled). */
  defaultValue?: string[]
  /** Callback fired when the set of pressed values changes. */
  onValueChange?: (value: string[]) => void
  /** When false, at most one item can be pressed at a time. */
  multiple?: boolean
  /** Prevents interaction with all items. */
  disabled?: boolean
  /** Layout direction. */
  orientation?: Orientation
  /** Size applied to all child toggles. */
  size?: ToggleSize
  /** Accessible name when the group is not inside a Field.Root (inside one,
   *  the Field.Label names it). */
  /** Items wrap onto rows, each with its own border (default false). Enables
   *  roving focus: one tab stop, arrow keys move between items. */
  wrap?: boolean
  /** Caps a wrapping group at this many rows (plus half a row, hinting more)
   *  and scrolls the rest. Only with `wrap`. */
  maxRows?: number
  'aria-label'?: string
  /** id of the element that names the group, when not inside a Field.Root. */
  'aria-labelledby'?: string
  children: ReactNode
}

export function ToggleGroup({
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  multiple = false,
  disabled = false,
  orientation = 'horizontal',
  size = 'default',
  wrap = false,
  maxRows,
  children,
  ...labelling
}: ToggleGroupProps) {
  const a11y = useFieldGroupLabelling(labelling)
  const [value, setValue] = useControllableValue(controlledValue, defaultValue, onValueChange)

  const toggle = useCallback(
    (itemValue: string) => {
      const nextPressed = !value.includes(itemValue)
      let next: string[]
      if (multiple) {
        next = nextPressed ? [...value, itemValue] : value.filter((v) => v !== itemValue)
      } else {
        next = nextPressed ? [itemValue] : []
      }
      setValue(next)
    },
    [value, multiple, setValue],
  )

  const rootRef = useRef<HTMLDivElement>(null)
  const roving = useRovingFocus(wrap, value, rootRef)
  const scrolls = wrap && maxRows !== undefined
  const pressedValue = value[0]

  // bring the pressed toggle into view by moving the viewport itself, never
  // scrollIntoView, which would scroll the page too
  const {items} = roving
  useLayoutEffect(() => {
    if (!scrolls || pressedValue === undefined) return
    const viewport = rootRef.current?.closest<HTMLElement>('[data-duro-scroll]')
    const el = items.current.get(pressedValue)
    if (!viewport || !el) return
    const centered = el.offsetTop - (viewport.clientHeight - el.offsetHeight) / 2
    const max = viewport.scrollHeight - viewport.clientHeight
    viewport.scrollTop = Math.min(Math.max(centered, 0), Math.max(max, 0))
  }, [scrolls, pressedValue, items])

  const group = (
    <html.div
      ref={rootRef}
      role="toolbar"
      aria-orientation={orientation}
      {...a11y}
      style={[styles.root, orientation === 'vertical' && styles.vertical, wrap && styles.wrap]}
    >
      {children}
    </html.div>
  )

  return (
    <ToggleGroupContext.Provider
      value={{
        value,
        toggle,
        disabled,
        orientation,
        size,
        wrap,
        tabStopValue: roving.tabStopValue,
        register: roving.register,
        onItemFocus: roving.onItemFocus,
      }}
    >
      {scrolls ? (
        <ScrollArea.Root>
          <ScrollArea.Viewport
            rovingOwner
            style={size === 'small' ? styles.maxRowsSmall(maxRows) : styles.maxRowsDefault(maxRows)}
          >
            <ScrollArea.Content>
              <html.div style={styles.scrollContent}>{group}</html.div>
            </ScrollArea.Content>
          </ScrollArea.Viewport>
        </ScrollArea.Root>
      ) : (
        group
      )}
    </ToggleGroupContext.Provider>
  )
}

// inside a Field.Root, the label names this group (see Field's `group`)
ToggleGroup.isFieldGroup = true as const
