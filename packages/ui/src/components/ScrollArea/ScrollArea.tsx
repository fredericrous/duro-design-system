import { type ReactNode, useRef, useCallback } from "react"
import { html } from "react-strict-dom"
import { styles } from "./styles.css"
import { ScrollAreaContext, useScrollArea } from "./ScrollAreaContext"
import { useScrollAreaRoot } from "./useScrollAreaRoot"

// --- Root ---

interface RootProps {
  children: ReactNode
}

function Root({ children }: RootProps) {
  const ctx = useScrollAreaRoot()

  return (
    <ScrollAreaContext.Provider value={ctx}>
      <html.div style={styles.root}>{children}</html.div>
    </ScrollAreaContext.Provider>
  )
}

// --- Viewport ---

interface ViewportProps {
  children: ReactNode
  maxHeight?: number | string
}

function Viewport({ children, maxHeight }: ViewportProps) {
  const { viewportRef } = useScrollArea()

  return (
    <html.div ref={viewportRef} style={[styles.viewport, maxHeight != null && styles.viewportMaxHeight(maxHeight)]}>
      {children}
    </html.div>
  )
}

// --- Content ---

interface ContentProps {
  children: ReactNode
}

function Content({ children }: ContentProps) {
  const { contentRef } = useScrollArea()
  return (
    <html.div ref={contentRef} style={styles.content}>
      {children}
    </html.div>
  )
}

// --- Scrollbar ---

type ScrollbarOrientation = "vertical" | "horizontal"

interface ScrollbarProps {
  orientation?: ScrollbarOrientation
  children: ReactNode
}

function Scrollbar({ orientation = "vertical", children }: ScrollbarProps) {
  const { scrolling, scrollHeight, scrollWidth, clientHeight, clientWidth } = useScrollArea()

  // Hide scrollbar when content fits
  const hasOverflow = orientation === "vertical" ? scrollHeight > clientHeight : scrollWidth > clientWidth

  if (!hasOverflow) return null

  return (
    <html.div
      style={[
        styles.scrollbar,
        orientation === "vertical" ? styles.scrollbarVertical : styles.scrollbarHorizontal,
        scrolling ? styles.scrollbarVisible : styles.scrollbarHidden,
      ]}
    >
      {children}
    </html.div>
  )
}

// --- Thumb ---

interface ThumbProps {
  orientation?: ScrollbarOrientation
}

function Thumb({ orientation = "vertical" }: ThumbProps) {
  const { viewportRef, scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = useScrollArea()
  const draggingRef = useRef(false)
  const startPosRef = useRef(0)
  const startScrollRef = useRef(0)

  const isVertical = orientation === "vertical"

  const thumbSizePercent = isVertical
    ? Math.max((clientHeight / scrollHeight) * 100, 10)
    : Math.max((clientWidth / scrollWidth) * 100, 10)

  const maxScroll = isVertical ? scrollHeight - clientHeight : scrollWidth - clientWidth
  const trackSize = isVertical ? clientHeight : clientWidth
  const thumbPixelSize = (thumbSizePercent / 100) * trackSize
  const scrollOffset = isVertical ? scrollTop : scrollLeft
  const thumbOffset = maxScroll > 0 ? (scrollOffset / maxScroll) * (trackSize - thumbPixelSize) : 0

  const thumbStyle = isVertical
    ? styles.thumbVertical(`${thumbSizePercent}%`, `translateY(${thumbOffset}px)`)
    : styles.thumbHorizontal(`${thumbSizePercent}%`, `translateX(${thumbOffset}px)`)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      draggingRef.current = true
      startPosRef.current = isVertical ? e.clientY : e.clientX
      startScrollRef.current = isVertical
        ? (viewportRef.current?.scrollTop ?? 0)
        : (viewportRef.current?.scrollLeft ?? 0)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [isVertical, viewportRef],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return
      const vp = viewportRef.current
      if (!vp) return

      const delta = (isVertical ? e.clientY : e.clientX) - startPosRef.current
      const scrollRatio = maxScroll / (trackSize - thumbPixelSize)
      const scrollDelta = delta * scrollRatio

      if (isVertical) {
        vp.scrollTop = startScrollRef.current + scrollDelta
      } else {
        vp.scrollLeft = startScrollRef.current + scrollDelta
      }
    },
    [isVertical, maxScroll, trackSize, thumbPixelSize, viewportRef],
  )

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false
  }, [])

  return (
    <html.div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={[styles.thumb, thumbStyle]}
    />
  )
}

export const ScrollArea = {
  Root,
  Viewport,
  Content,
  Scrollbar,
  Thumb,
}
