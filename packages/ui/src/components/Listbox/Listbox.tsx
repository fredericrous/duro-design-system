import {
  type ReactNode,
  type Ref,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {createPortal} from 'react-dom'
import {html} from 'react-strict-dom'
import {SPACING_PX} from '@duro-app/tokens/keys'
import {styles} from './styles.css'
import {usePortalMount} from '../ThemeProvider/ThemeProvider'
import {computePopoverPosition} from '../Popover/position'
import {usePopoverLayer} from '../Popover/PopoverLayerContext'

/**
 * A headless-state popup list of options for an input that keeps focus: a
 * Combobox's text field, or a rich-text editor's typeahead (mentions, slash
 * commands). The anchor element owns focus and the keyboard; it moves the
 * highlight by setting `highlightedId`, and wires itself to the list with
 * `getAnchorProps()` (aria-controls / aria-expanded / aria-activedescendant).
 * A press on an option never takes focus from the anchor.
 */

export type ListboxMaxHeight = 'listMaxH' | 'listMaxHSm'

const maxHeightMap = {
  listMaxH: styles.maxHeightListMaxH,
  listMaxHSm: styles.maxHeightListMaxHSm,
} as const

/** Default option id: the listbox id plus the value, made safe for an id. */
export function defaultOptionId(listboxId: string, value: string): string {
  return `${listboxId}-option-${value.replace(/[^\w-]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}`)}`
}

export interface ListboxAnchorProps {
  role?: 'combobox'
  'aria-controls': string | undefined
  'aria-expanded': boolean
  'aria-activedescendant': string | undefined
  'aria-autocomplete': 'list'
  'aria-haspopup': 'listbox'
}

/**
 * ARIA for the element that keeps focus and drives the list. Spread it on an
 * input, or set each attribute on a contenteditable root.
 */
export function getAnchorProps({
  id,
  open,
  highlightedId,
}: {
  id: string
  open: boolean
  highlightedId: string | null | undefined
}): ListboxAnchorProps {
  return {
    'aria-controls': open ? id : undefined,
    'aria-expanded': open,
    'aria-activedescendant': open && highlightedId ? highlightedId : undefined,
    'aria-autocomplete': 'list',
    'aria-haspopup': 'listbox',
  }
}

interface ListboxContextValue {
  id: string
  highlightedId: string | null
  onHighlight?: (id: string | null) => void
  onSelect?: (value: string) => void
  getOptionId: (value: string) => string
}

const ListboxContext = createContext<ListboxContextValue | null>(null)

function useListbox(part: string) {
  const ctx = useContext(ListboxContext)
  if (!ctx) throw new Error(`Listbox.${part} must be used within Listbox.Root`)
  return ctx
}

// --- Root ---

interface RootProps {
  /** DOM id of the list; pass the same to getAnchorProps. */
  id: string
  open: boolean
  /** The rect the list is placed against: the input, or the editor's caret. */
  anchor: () => DOMRect | null | undefined
  /** Give the list the anchor's width (a Combobox under its input). */
  matchAnchorWidth?: boolean
  /** Id of the highlighted option, controlled by the anchor's keyboard handling. */
  highlightedId: string | null
  /** Pointer hover asks to move the highlight. */
  onHighlight?: (id: string | null) => void
  /** A press on an option. */
  onSelect?: (value: string) => void
  /** Option value → DOM id. Default: defaultOptionId(id, value). */
  getOptionId?: (value: string) => string
  /** Accessible name of the list. */
  'aria-label'?: string
  /** Size-token key capping the list's height; longer lists scroll. Default: listMaxH. */
  maxHeight?: ListboxMaxHeight
  children: ReactNode
}

function Root({
  id,
  open,
  anchor,
  matchAnchorWidth = false,
  highlightedId,
  onHighlight,
  onSelect,
  getOptionId,
  'aria-label': ariaLabel,
  maxHeight = 'listMaxH',
  children,
}: RootProps) {
  const mount = usePortalMount()
  const listRef = useRef<HTMLDivElement>(null)
  const [place, setPlace] = useState<{top: number; left: number; width: number} | null>(null)
  const anchorRef = useRef(anchor)
  anchorRef.current = anchor

  useLayoutEffect(() => {
    if (!open) {
      setPlace(null)
      return
    }
    const update = () => {
      const rect = anchorRef.current()
      if (!rect) return
      const list = listRef.current
      const next = computePopoverPosition({
        anchor: {top: rect.top, left: rect.left, width: rect.width, height: rect.height},
        popup: {
          width: matchAnchorWidth ? rect.width : (list?.offsetWidth ?? 0),
          height: list?.offsetHeight ?? 0,
        },
        viewport: {width: window.innerWidth, height: window.innerHeight},
        side: 'bottom',
        align: 'start',
        offset: SPACING_PX.xs,
      })
      setPlace((prev) =>
        prev && prev.top === next.top && prev.left === next.left && prev.width === rect.width
          ? prev
          : {top: next.top, left: next.left, width: rect.width},
      )
    }
    update()
    // A second pass once the list has its size, so the flip sees its height.
    const frame = requestAnimationFrame(update)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, matchAnchorWidth])

  // A press inside the list must not move focus off the anchor.
  useEffect(() => {
    const list = listRef.current
    if (!list || !open) return
    const keep = (e: MouseEvent) => e.preventDefault()
    list.addEventListener('mousedown', keep)
    return () => list.removeEventListener('mousedown', keep)
  }, [open, place])

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open || !highlightedId) return
    const list = listRef.current
    const option = list?.querySelector<HTMLElement>(`[id="${CSS.escape(highlightedId)}"]`)
    option?.scrollIntoView?.({block: 'nearest'})
  }, [open, highlightedId])

  usePopoverLayer(listRef, {active: open && place !== null})

  const optionId = useCallback(
    (value: string) => (getOptionId ? getOptionId(value) : defaultOptionId(id, value)),
    [getOptionId, id],
  )

  if (!open || !place || typeof document === 'undefined') return null

  const node = (
    <ListboxContext.Provider
      value={{id, highlightedId, onHighlight, onSelect, getOptionId: optionId}}
    >
      <html.div
        ref={listRef}
        id={id}
        role="listbox"
        aria-label={ariaLabel}
        style={[
          styles.popup,
          maxHeightMap[maxHeight],
          styles.position(place.top, place.left),
          matchAnchorWidth ? styles.width(place.width) : styles.ownWidth,
        ]}
      >
        {children}
      </html.div>
    </ListboxContext.Provider>
  )
  return mount ? createPortal(node, mount) : node
}

// --- Option ---

interface OptionProps {
  value: string
  /** DOM id. Default: Root's getOptionId(value). */
  id?: string
  /** The committed choice (aria-selected). */
  selected?: boolean
  disabled?: boolean
  children: ReactNode
  ref?: Ref<HTMLDivElement>
}

function Option({
  value,
  id: idProp,
  selected = false,
  disabled = false,
  children,
  ref,
}: OptionProps) {
  const {highlightedId, onHighlight, onSelect, getOptionId} = useListbox('Option')
  const id = idProp ?? getOptionId(value)
  const highlighted = highlightedId === id

  return (
    <html.div
      ref={ref}
      id={id}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : () => onSelect?.(value)}
      onPointerEnter={disabled ? undefined : () => onHighlight?.(id)}
      style={[
        styles.option,
        selected && styles.optionSelected,
        highlighted && styles.optionHighlighted,
        disabled && styles.optionDisabled,
      ]}
    >
      {children}
    </html.div>
  )
}

// --- Empty ---

/** Shown in place of options when nothing matches. */
function Empty({children}: {children: ReactNode}) {
  useListbox('Empty')
  return <html.div style={styles.empty}>{children}</html.div>
}

export const Listbox = {
  Root,
  Option,
  Empty,
  getAnchorProps,
}
