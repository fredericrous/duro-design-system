import {useEffect, useRef} from 'react'

// Open layers that close on Escape, oldest first. Their listeners all sit on
// `document`, where the oldest registered first, so a Dialog would close
// before a Popover opened inside it. Each layer acts on Escape only when it is
// the newest one, so the innermost closes first and the next Escape the next.
const openLayers: symbol[] = []

/** Joins the stack while `active`; returns whether this layer is the innermost one. */
export function useEscapeLayer(active: boolean): () => boolean {
  const layerRef = useRef<symbol>(Symbol('escape-layer'))
  useEffect(() => {
    if (!active) return
    const layer = layerRef.current
    openLayers.push(layer)
    return () => {
      const index = openLayers.indexOf(layer)
      if (index !== -1) openLayers.splice(index, 1)
    }
  }, [active])
  return () => openLayers[openLayers.length - 1] === layerRef.current
}
