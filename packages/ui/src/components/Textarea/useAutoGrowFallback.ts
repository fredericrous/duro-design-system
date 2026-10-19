import {useEffect, useLayoutEffect, type RefObject} from 'react'
import {fitToContent, supportsFieldSizing} from './autoGrow'

/** `content`: the field sizes itself to its text; `fixed`: it keeps its `rows`. */
import type {GrowMode} from './autoGrow'

export type {GrowMode}

/**
 * Where CSS field-sizing is missing, size the field to its content: after each
 * render (first paint, controlled value changes) and on every `input` event, so
 * an uncontrolled field grows as it is typed into.
 */
export function useAutoGrowFallback(ref: RefObject<HTMLTextAreaElement | null>, mode: GrowMode) {
  useLayoutEffect(() => {
    const el = ref.current
    if (mode === 'content' && el && !supportsFieldSizing()) fitToContent(el)
  })
  useEffect(() => {
    const el = ref.current
    if (mode !== 'content' || !el || supportsFieldSizing()) return
    const onInput = () => fitToContent(el)
    el.addEventListener('input', onInput)
    return () => el.removeEventListener('input', onInput)
  }, [ref, mode])
}
