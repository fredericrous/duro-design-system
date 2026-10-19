import {useLayoutEffect, type RefObject} from 'react'
import {fitToContent, supportsFieldSizing} from './autoGrow'

/** Where CSS field-sizing is missing, size the field to its content after each render. */
export function useAutoGrowFallback(ref: RefObject<HTMLTextAreaElement | null>, enabled: boolean) {
  useLayoutEffect(() => {
    const el = ref.current
    if (enabled && el && !supportsFieldSizing()) fitToContent(el)
  })
}
