import {useRef, useState, useEffect} from 'react'

export type ContainerSize = 'compact' | 'default' | 'spacious'

interface UseContainerQueryOptions {
  compactBelow?: number
  spaciousAbove?: number
}

export function useContainerQuery<T extends HTMLElement = HTMLElement>(
  options: UseContainerQueryOptions = {},
): {
  ref: React.RefObject<T | null>
  size: ContainerSize
} {
  const {compactBelow = 480, spaciousAbove = 768} = options
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState<ContainerSize>('default')

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let rafId: number | null = null

    const observer = new ResizeObserver((entries) => {
      if (rafId !== null) cancelAnimationFrame(rafId)

      rafId = requestAnimationFrame(() => {
        const entry = entries[0]
        if (!entry) return

        const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width

        if (width < compactBelow) {
          setSize('compact')
        } else if (width >= spaciousAbove) {
          setSize('spacious')
        } else {
          setSize('default')
        }
      })
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [compactBelow, spaciousAbove])

  return {ref, size}
}
