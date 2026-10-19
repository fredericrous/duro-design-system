import {useEffect, useLayoutEffect, type RefObject} from 'react'
import {fitToContent, supportsFieldSizing} from './autoGrow'

import type {GrowMode} from './autoGrow'

/** Fields this hook gave an inline height, so turning autoGrow off can take it back. */
const sized = new WeakSet<HTMLElement>()

/**
 * Where CSS field-sizing is missing, size the field to its content: after each
 * render (first paint, controlled value changes) and on every `input` event, so
 * an uncontrolled field grows as it is typed into.
 */
export function useAutoGrowFallback(ref: RefObject<HTMLTextAreaElement | null>, mode: GrowMode) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || supportsFieldSizing()) return
    if (mode === 'content') {
      fitToContent(el)
      sized.add(el)
    } else if (sized.delete(el)) {
      el.style.height = ''
    }
  })
  useEffect(() => {
    const el = ref.current
    if (mode !== 'content' || !el || supportsFieldSizing()) return
    const onInput = () => {
      fitToContent(el)
      sized.add(el)
    }
    el.addEventListener('input', onInput)
    return () => el.removeEventListener('input', onInput)
  }, [ref, mode])
}
