import {useLayoutEffect, useState} from 'react'
import type {IndicatorBox, TabIndicator, TabIndicatorInput} from './indicator'

/** Web: the active tab measured in the DOM, kept current by a ResizeObserver. */
export function useTabIndicator({
  listRef,
  activeValue,
  orientation,
  setIndicatorActive,
}: TabIndicatorInput): TabIndicator {
  const [indicator, setIndicator] = useState<IndicatorBox | null>(null)

  // Measure the active tab and drive the sliding indicator. useLayoutEffect so
  // the first position is set before paint (the indicator element mounts already
  // in place — no slide-in from zero; only later tab changes animate). Observes
  // the active tab (its own size, e.g. a changing "(3)" count) and the list
  // (container resize / reflow). A non-active sibling resizing while you're on
  // another tab is the one case not caught; it self-corrects on the next
  // selection or resize.
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list || !activeValue) {
      setIndicator(null)
      setIndicatorActive(false)
      return
    }
    const el = list.querySelector<HTMLElement>(`[data-tab-value="${CSS.escape(activeValue)}"]`)
    if (!el) {
      setIndicator(null)
      setIndicatorActive(false)
      return
    }
    const measure = () => {
      setIndicator(
        orientation === 'horizontal'
          ? {offset: el.offsetLeft, size: el.offsetWidth}
          : {offset: el.offsetTop, size: el.offsetHeight},
      )
      setIndicatorActive(true)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    ro.observe(list)
    return () => ro.disconnect()
  }, [listRef, activeValue, orientation, setIndicatorActive])

  return {indicator, reportTabLayout: null}
}
