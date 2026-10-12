import {useEffect, useMemo, useState} from 'react'
import {detentHeight, type SnapPoint} from './sheetPhysics'

interface Viewport {
  height: number
  topInset: number
}

/** The top safe-area inset, read through a probe: CSS knows it, JavaScript does not. */
function readTopInset(): number {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top,0px)'
  document.body.appendChild(probe)
  const inset = parseFloat(getComputedStyle(probe).paddingTop) || 0
  probe.remove()
  return inset
}

function readViewport(): Viewport {
  return {height: window.innerHeight, topInset: readTopInset()}
}

/**
 * Web: each detent's height in px, ascending, following the window as it
 * resizes (a rotated phone, an opened on-screen keyboard).
 */
export function useSheetHeights(points: readonly SnapPoint[], active: boolean): number[] {
  const [viewport, setViewport] = useState<Viewport | null>(null)

  useEffect(() => {
    if (!active) return
    setViewport(readViewport())
    const onResize = () => setViewport(readViewport())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [active])

  return useMemo(
    () => (viewport ? points.map((p) => detentHeight(p, viewport.height, viewport.topInset)) : []),
    [points, viewport],
  )
}
