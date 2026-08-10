import {useRef, useState, useEffect} from 'react'
import {breakpointsPx, type Breakpoint} from '@duro-app/tokens/tokens/breakpoints.css'

export type ContainerSize = 'compact' | 'default' | 'spacious'

interface UseContainerQueryOptions {
  compactBelow?: Breakpoint | number
  spaciousAbove?: Breakpoint | number
}

function toPx(value: Breakpoint | number): number {
  return typeof value === 'number' ? value : breakpointsPx[value]
}

export function useContainerQuery<T extends HTMLElement = HTMLElement>(
  options: UseContainerQueryOptions = {},
): {
  ref: React.RefObject<T | null>
  size: ContainerSize
} {
  const {compactBelow: compactOpt = 'xs', spaciousAbove: spaciousOpt = 'md'} = options
  const compactBelow = toPx(compactOpt)
  const spaciousAbove = toPx(spaciousOpt)
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
