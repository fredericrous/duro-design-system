import {useCallback, useEffect, useState} from 'react'
import type {TabBox, TabIndicator, TabIndicatorInput} from './indicator'

/** Native: the indicator follows the active tab's `onLayout` box. */
export function useTabIndicator({
  activeValue,
  orientation,
  setIndicatorActive,
}: TabIndicatorInput): TabIndicator {
  const [boxes, setBoxes] = useState<ReadonlyMap<string, TabBox>>(() => new Map())
  const reportTabLayout = useCallback((value: string, box: TabBox) => {
    setBoxes((prev) => {
      const old = prev.get(value)
      if (
        old &&
        old.x === box.x &&
        old.y === box.y &&
        old.width === box.width &&
        old.height === box.height
      ) {
        return prev
      }
      return new Map(prev).set(value, box)
    })
  }, [])
  const box = activeValue ? boxes.get(activeValue) : undefined
  const indicator = box
    ? orientation === 'horizontal'
      ? {offset: box.x, size: box.width}
      : {offset: box.y, size: box.height}
    : null
  const active = indicator !== null
  useEffect(() => setIndicatorActive(active), [active, setIndicatorActive])
  return {indicator, reportTabLayout}
}
