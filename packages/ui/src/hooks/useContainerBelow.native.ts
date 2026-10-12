import {useEffect, useState, type RefObject} from 'react'
import {useWindowDimensions} from 'react-native'
import {breakpointsPx, type Breakpoint} from '@duro-app/tokens/tokens/breakpoints.css'

interface Measurable {
  measure?: (cb: (x: number, y: number, width: number) => void) => void
}

/**
 * Native: whether the view behind `ref` is narrower than a Duro breakpoint.
 * There is no ResizeObserver; the view is measured after layout and again
 * whenever the window changes size (a rotation, a split screen). `false`
 * until the first measurement, as on the web.
 */
export function useContainerBelow(ref: RefObject<unknown>, breakpoint: Breakpoint): boolean {
  const [below, setBelow] = useState(false)
  const limit = breakpointsPx[breakpoint]
  const {width: windowWidth} = useWindowDimensions()

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      ;(ref.current as Measurable | null)?.measure?.((_x, _y, width) => {
        if (width > 0) setBelow(width < limit)
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [ref, limit, windowWidth])

  return below
}
