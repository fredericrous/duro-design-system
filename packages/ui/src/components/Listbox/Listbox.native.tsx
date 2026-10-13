import {createContext, type ReactNode, type Ref, useContext} from 'react'
import {Pressable} from 'react-native-gesture-handler'
import {html} from 'react-strict-dom'
import {sheetStyles} from './native.css'

/**
 * Native Listbox (plan N0, Slice C): a plain list of options, laid out where
 * it is rendered — inside a Select or Combobox sheet. Nothing is anchored and
 * nothing is highlighted: native has no arrow keys (Decision 6), so each option
 * is its own screen-reader stop and a press chooses it.
 */

export type ListboxMaxHeight = 'listMaxH' | 'listMaxHSm'

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

/** The web's anchor ARIA, kept for one API: RSD drops these props on native. */
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
  onSelect?: (value: string) => void
}

const ListboxContext = createContext<ListboxContextValue | null>(null)

function useListbox(part: string) {
  const ctx = useContext(ListboxContext)
  if (!ctx) throw new Error(`Listbox.${part} must be used within Listbox.Root`)
  return ctx
}

interface RootProps {
  id: string
  open: boolean
  /** A press on an option. */
  onSelect?: (value: string) => void
  /** Accessible name of the list. */
  'aria-label'?: string
  children: ReactNode
  // The web's placement and keyboard props; a native list flows in place.
  anchor?: () => unknown
  matchAnchorWidth?: boolean
  highlightedId?: string | null
  onHighlight?: (id: string | null) => void
  getOptionId?: (value: string) => string
  maxHeight?: ListboxMaxHeight
}

function Root({id, open, onSelect, 'aria-label': ariaLabel, children}: RootProps) {
  if (!open) return null
  return (
    <ListboxContext.Provider value={{onSelect}}>
      <html.div id={id} role="listbox" aria-label={ariaLabel} style={sheetStyles.list}>
        {children}
      </html.div>
    </ListboxContext.Provider>
  )
}

interface OptionProps {
  value: string
  id?: string
  /** The committed choice: filled, with a trailing check. */
  selected?: boolean
  disabled?: boolean
  children: ReactNode
  ref?: Ref<unknown>
}

function Option({value, selected = false, disabled = false, children, ref}: OptionProps) {
  const {onSelect} = useListbox('Option')
  // Gesture Handler's Pressable recognises the tap natively: an RN Pressable
  // loses the first tap with the keyboard up to any ScrollView above the
  // sheet's Modal in the app (keyboardShouldPersistTaps 'never', the default).
  return (
    <Pressable
      ref={ref as Ref<never>}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onPress={() => onSelect?.(value)}
    >
      {({pressed}) => (
        <html.div style={[sheetStyles.option, (selected || pressed) && sheetStyles.optionFilled]}>
          <html.span style={[sheetStyles.label, disabled && sheetStyles.labelDisabled]}>
            {children}
          </html.span>
          {selected && (
            <html.span aria-hidden style={sheetStyles.check}>
              ✓
            </html.span>
          )}
        </html.div>
      )}
    </Pressable>
  )
}

/** Shown in place of options when there are none, or none match. */
function Empty({children}: {children: ReactNode}) {
  return <html.div style={sheetStyles.empty}>{children}</html.div>
}

export const Listbox = {
  Root,
  Option,
  Empty,
  getAnchorProps,
}
