import {createContext, useContext} from 'react'
import type {Length} from '../../shared/length'
import type {TabsContextValue} from '../Tabs/TabsContext'

export interface MasterDetailContextValue {
  /** The roving-focus state Tabs owns, run vertically: the focused value is the active tab. */
  tabs: TabsContextValue
  /** Prefix of the ids that tie the detail pane to the focused item. */
  idPrefix: string
  railWidth: Length
  /** Cap of the whole component's height; the rail and the detail scroll inside it. */
  maxHeight: Length
  /** Native only: the window is narrower than `breakpoints.sm`. Web stacks with a media query. */
  stacked: boolean
}

export const MasterDetailContext = createContext<MasterDetailContextValue | null>(null)

export function useMasterDetail(part: string) {
  const ctx = useContext(MasterDetailContext)
  if (!ctx) throw new Error(`MasterDetail.${part} must be used within MasterDetail.Root`)
  return ctx
}

/** The id of the rail item for `value`, which labels the detail pane. */
export function itemId(idPrefix: string, value: string) {
  return `${idPrefix}-item-${encodeURIComponent(value)}`
}
