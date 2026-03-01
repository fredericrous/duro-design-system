import { useState, useCallback, useRef, useEffect } from "react"
import type { ScrollAreaContextValue } from "./ScrollAreaContext"

export function useScrollAreaRoot(): ScrollAreaContextValue {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollHeight, setScrollHeight] = useState(0)
  const [scrollWidth, setScrollWidth] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)
  const [clientWidth, setClientWidth] = useState(0)
  const [scrolling, setScrolling] = useState(false)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleScroll = useCallback(() => {
    const vp = viewportRef.current
    if (!vp) return

    setScrollTop(vp.scrollTop)
    setScrollLeft(vp.scrollLeft)
    setScrollHeight(vp.scrollHeight)
    setScrollWidth(vp.scrollWidth)
    setClientHeight(vp.clientHeight)
    setClientWidth(vp.clientWidth)
    setScrolling(true)

    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    scrollTimerRef.current = setTimeout(() => setScrolling(false), 1000)
  }, [])

  // Observe viewport size changes
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return

    const observer = new ResizeObserver(() => {
      setScrollHeight(vp.scrollHeight)
      setScrollWidth(vp.scrollWidth)
      setClientHeight(vp.clientHeight)
      setClientWidth(vp.clientWidth)
    })
    observer.observe(vp)
    // Initial measurement
    setScrollHeight(vp.scrollHeight)
    setScrollWidth(vp.scrollWidth)
    setClientHeight(vp.clientHeight)
    setClientWidth(vp.clientWidth)

    return () => observer.disconnect()
  }, [])

  // Attach scroll listener directly to ensure we capture it
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return
    vp.addEventListener("scroll", handleScroll, { passive: true })
    return () => vp.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  return {
    viewportRef,
    contentRef,
    scrollTop,
    scrollLeft,
    scrollHeight,
    scrollWidth,
    clientHeight,
    clientWidth,
    scrolling,
  }
}
