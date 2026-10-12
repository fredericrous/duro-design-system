import {createContext, useContext} from 'react'
import type {Orientation} from '../../shared/types'

/** Where the sliding indicator sits along the list, in px. */
export interface IndicatorBox {
  offset: number
  size: number
}

/** A tab's box inside its list, as native `onLayout` reports it. */
export interface TabBox {
  x: number
  y: number
  width: number
  height: number
}

/** Native: each Tab reports its box here, so the List places the indicator. */
export const TabLayoutContext = createContext<((value: string, box: TabBox) => void) | null>(null)

export function useReportTabLayout() {
  return useContext(TabLayoutContext)
}

export interface TabIndicatorInput {
  listRef: React.RefObject<HTMLDivElement | null>
  activeValue: string | null
  orientation: Orientation
  setIndicatorActive: (active: boolean) => void
}

export interface TabIndicator {
  indicator: IndicatorBox | null
  /** Native only: what the Tabs report their layout to. */
  reportTabLayout: ((value: string, box: TabBox) => void) | null
}
